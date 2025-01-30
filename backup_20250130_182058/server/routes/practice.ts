import express from "express";
import { db } from "../db/index";
import { 
  questions, 
  quizAttempts, 
  questionHistory, 
  type Question,
  type QuizAttempt,
  type QuestionHistory 
} from "../db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "express";
import { z } from "zod";

const router = express.Router();

// Input validation schemas
const startPracticeSchema = z.object({
  userId: z.number().positive(),
  moduleId: z.number().positive(),
  type: z.string().min(1)
});

const answerSubmissionSchema = z.object({
  sessionId: z.number().positive(),
  questionId: z.number().positive(),
  userId: z.number().positive(),
  answer: z.string().min(1),
  timeSpent: z.number().positive()
});

interface PracticeQuestion {
  id: number;
  text: string;
  type: string;
  options: Array<{ id: string; text: string }>;
  difficulty: number;
  category: string;
  subcategory: string;
}

interface PracticeSessionResponse {
  sessionId: number;
  questions: PracticeQuestion[];
}

interface AnswerSubmissionResponse {
  isCorrect: boolean;
  explanation: string;
  conceptBreakdown: Array<{ concept: string; explanation: string }>;
  relatedTopics: string[];
  progress: {
    completed: number;
    total: number;
    score: number;
  };
}

// Start a new practice session
const startPractice: RequestHandler = async (req, res, next) => {
  try {
    const result = startPracticeSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ 
        error: "Invalid request data",
        details: result.error.issues
      });
      return;
    }

    const { userId, moduleId, type } = result.data;

    // Get questions for this practice session with specific columns
    const practiceQuestions = await db.query.questions.findMany({
      where: eq(questions.moduleId, moduleId),
      columns: {
        id: true,
        text: true,
        type: true,
        options: true,
        difficulty: true,
        category: true,
        subcategory: true
      },
      limit: 10,
      orderBy: (questions, { asc }) => [asc(questions.id)]
    }) satisfies Question[];

    if (practiceQuestions.length === 0) {
      res.status(404).json({ error: "No questions found for this module" });
      return;
    }

    // Create quiz attempt
    const [quizAttempt] = await db.insert(quizAttempts)
      .values({
        userId,
        moduleId,
        type,
        answers: [],
        score: 0,
        totalQuestions: practiceQuestions.length,
        startedAt: new Date()
      })
      .returning() satisfies QuizAttempt[];

    const response: PracticeSessionResponse = {
      sessionId: quizAttempt.id,
      questions: practiceQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category,
        subcategory: q.subcategory
      }))
    };

    res.json(response);
  } catch (error) {
    console.error("Error starting practice session:", error);
    next(error);
  }
};

// Submit answer for a question
const submitAnswer: RequestHandler = async (req, res, next) => {
  try {
    const result = answerSubmissionSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ 
        error: "Invalid request data",
        details: result.error.issues
      });
      return;
    }

    const { sessionId, questionId, userId, answer, timeSpent } = result.data;

    // Get question with specific columns
    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId),
      columns: {
        id: true,
        correctAnswer: true,
        explanation: true,
        conceptBreakdown: true,
        difficulty: true,
        topicTags: true,
        relatedTopics: true
      }
    }) satisfies Question | undefined;

    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    const isCorrect = answer === question.correctAnswer;

    // Record answer in history
    const [history] = await db.insert(questionHistory)
      .values({
        userId,
        questionId,
        answer,
        isCorrect,
        timeSpent,
        timestamp: new Date(),
        attemptContext: {
          sessionId,
          difficulty: question.difficulty,
          topics: question.topicTags ?? []
        }
      })
      .returning() satisfies QuestionHistory[];

    // Update quiz attempt
    const attempt = await db.query.quizAttempts.findFirst({
      where: eq(quizAttempts.id, sessionId),
      columns: {
        id: true,
        answers: true,
        totalQuestions: true
      }
    }) satisfies QuizAttempt | undefined;

    if (!attempt) {
      res.status(404).json({ error: "Practice session not found" });
      return;
    }

    const answers = [...attempt.answers, { 
      questionId, 
      answer, 
      correct: isCorrect,
      timeSpent 
    }];

    const score = Math.round((answers.filter(a => a.correct).length / answers.length) * 100);

    // Get the first topic tag if available, otherwise use undefined
    const firstTopicTag = question.topicTags?.[0];

    await db.update(quizAttempts)
      .set({ 
        answers, 
        score,
        completedAt: answers.length === attempt.totalQuestions ? new Date() : undefined,
        strengthAreas: isCorrect && firstTopicTag ? [firstTopicTag] : undefined,
        weaknessAreas: !isCorrect && firstTopicTag ? [firstTopicTag] : undefined
      })
      .where(eq(quizAttempts.id, sessionId));

    const response: AnswerSubmissionResponse = {
      isCorrect,
      explanation: question.explanation ?? '',
      conceptBreakdown: question.conceptBreakdown ?? [],
      relatedTopics: question.relatedTopics ?? [],
      progress: {
        completed: answers.length,
        total: attempt.totalQuestions,
        score
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Error submitting answer:", error);
    next(error);
  }
};

router.post("/start", startPractice);
router.post("/answer", submitAnswer);

export default router;
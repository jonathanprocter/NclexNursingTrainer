import express from "express";
import { db } from '@/db/index';
import { 
  questions, 
  quizAttempts,
  type Question,
  type QuizAttempt 
} from '@/db/schema';
import { eq, and } from "drizzle-orm";
import type { RequestHandler } from "express";
import { z } from "zod";

const router = express.Router();

// Request validation schemas
const startSimulationSchema = z.object({
  userId: z.number().positive(),
  type: z.enum(['CAT', 'standard']),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
});

const simulationAnswerSchema = z.object({
  questionId: z.number().positive(),
  answer: z.string().min(1),
  timeSpent: z.number().positive()
});

interface SimulationQuestion {
  id: number;
  text: string;
  type: string;
  options: Array<{ id: string; text: string }>;
  category: string;
  subcategory: string;
}

interface SimulationResponse {
  sessionId: number;
  questions: SimulationQuestion[];
}

interface AnswerResponse {
  isCorrect: boolean;
  explanation: string;
  conceptBreakdown: Array<{ concept: string; explanation: string }>;
  nextQuestion: SimulationQuestion | null;
  completed: boolean;
}

// Start a new simulation
const startSimulation: RequestHandler = async (req, res, next) => {
  try {
    const result = startSimulationSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ 
        error: "Invalid request data",
        details: result.error.issues
      });
      return;
    }

    const { userId, type, difficulty } = result.data;

    // Get appropriate questions based on simulation type
    const simulationQuestions = await db.query.questions.findMany({
      where: and(
        eq(questions.type, type),
        eq(questions.difficulty, difficulty === "medium" ? 2 : difficulty === "hard" ? 3 : 1)
      ),
      columns: {
        id: true,
        text: true,
        type: true,
        options: true,
        category: true,
        subcategory: true
      },
      limit: type === "CAT" ? 75 : 25 // CAT simulations use more questions
    }) satisfies Question[];

    // Create simulation attempt
    const [attempt] = await db.insert(quizAttempts)
      .values({
        userId,
        moduleId: 0, // Special case for simulations
        type: `simulation_${type}`,
        answers: [],
        score: 0,
        totalQuestions: simulationQuestions.length,
        startedAt: new Date(),
        aiAnalysis: {
          adaptiveLevel: difficulty,
          currentDifficulty: difficulty,
          masteryEstimate: 0.5
        }
      })
      .returning() satisfies QuizAttempt[];

    const response: SimulationResponse = {
      sessionId: attempt.id,
      questions: simulationQuestions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        category: q.category,
        subcategory: q.subcategory
      }))
    };

    res.json(response);
  } catch (error) {
    console.error("Error starting simulation:", error);
    next(error);
  }
};

// Submit simulation answer and get next question (for CAT)
const submitAnswer: RequestHandler<{ sessionId: string }> = async (req, res, next) => {
  try {
    const sessionIdResult = z.string().regex(/^\d+$/).transform(Number).safeParse(req.params.sessionId);
    const answerResult = simulationAnswerSchema.safeParse(req.body);

    if (!sessionIdResult.success || !answerResult.success) {
      res.status(400).json({ 
        error: "Invalid request data",
        details: {
          ...(sessionIdResult.success ? {} : { sessionId: sessionIdResult.error.issues }),
          ...(answerResult.success ? {} : { answer: answerResult.error.issues })
        }
      });
      return;
    }

    const sessionId = sessionIdResult.data;
    const { questionId, answer, timeSpent } = answerResult.data;

    const attempt = await db.query.quizAttempts.findFirst({
      where: eq(quizAttempts.id, sessionId)
    }) satisfies QuizAttempt | undefined;

    if (!attempt) {
      res.status(404).json({ error: "Simulation session not found" });
      return;
    }

    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId),
      columns: {
        id: true,
        correctAnswer: true,
        explanation: true,
        conceptBreakdown: true,
        difficulty: true
      }
    }) satisfies Question | undefined;

    if (!question) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    const isCorrect = answer === question.correctAnswer;
    const answers = [...attempt.answers, { questionId, answer, correct: isCorrect, timeSpent }];
    const score = Math.round((answers.filter(a => a.correct).length / answers.length) * 100);

    // Update difficulty for CAT simulation
    let nextQuestion: SimulationQuestion | null = null;
    if (attempt.type === "simulation_CAT" && answers.length < attempt.totalQuestions) {
      const currentDifficulty = attempt.aiAnalysis?.currentDifficulty || 2;
      const newDifficulty = isCorrect ? 
        Math.min(currentDifficulty + 1, 3) : 
        Math.max(currentDifficulty - 1, 1);

      // Get next question based on new difficulty
      const nextQuestionData = await db.query.questions.findFirst({
        where: and(
          eq(questions.difficulty, newDifficulty),
          eq(questions.type, "CAT")
        ),
        columns: {
          id: true,
          text: true,
          type: true,
          options: true,
          category: true,
          subcategory: true
        }
      }) satisfies Question | undefined;

      if (nextQuestionData) {
        nextQuestion = {
          id: nextQuestionData.id,
          text: nextQuestionData.text,
          type: nextQuestionData.type,
          options: nextQuestionData.options,
          category: nextQuestionData.category,
          subcategory: nextQuestionData.subcategory
        };
      }

      // Update AI analysis
      attempt.aiAnalysis = {
        ...attempt.aiAnalysis,
        currentDifficulty: newDifficulty,
        masteryEstimate: score / 100
      };
    }

    // Update attempt
    await db.update(quizAttempts)
      .set({ 
        answers, 
        score,
        aiAnalysis: attempt.aiAnalysis,
        completedAt: answers.length === attempt.totalQuestions ? new Date() : undefined
      })
      .where(eq(quizAttempts.id, sessionId));

    const response: AnswerResponse = {
      isCorrect,
      explanation: question.explanation ?? '',
      conceptBreakdown: question.conceptBreakdown ?? [],
      nextQuestion,
      completed: answers.length === attempt.totalQuestions
    };

    res.json(response);
  } catch (error) {
    console.error("Error processing simulation answer:", error);
    next(error);
  }
};

router.post("/start", startSimulation);
router.post("/:sessionId/answer", submitAnswer);

export default router;
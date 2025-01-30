import express, { Request, Response } from "express";
import { db } from "../db";
import { questions, quizAttempts, questionHistory } from "../db/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

interface StartPracticeRequest {
  userId: number;
  moduleId: number;
  type: string;
}

interface AnswerSubmissionRequest {
  sessionId: number;
  questionId: number;
  userId: number;
  answer: string;
  timeSpent: number;
}

// Start a new practice session
router.post("/start", async (req: Request<{}, {}, StartPracticeRequest>, res: Response) => {
  try {
    const { userId, moduleId, type } = req.body;

    if (!userId || !moduleId || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get questions for this practice session
    const practiceQuestions = await db.query.questions.findMany({
      where: eq(questions.moduleId, moduleId),
      limit: 10
    });

    // Create quiz attempt
    const quizAttempt = await db.insert(quizAttempts).values({
      userId,
      moduleId,
      type,
      answers: [],
      score: 0,
      totalQuestions: practiceQuestions.length,
      startedAt: new Date()
    }).returning();

    res.json({
      sessionId: quizAttempt[0].id,
      questions: practiceQuestions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options
      }))
    });
  } catch (error) {
    console.error("Error starting practice session:", error);
    res.status(500).json({ error: "Failed to start practice session" });
  }
});

// Submit answer for a question
router.post("/answer", async (req: Request<{}, {}, AnswerSubmissionRequest>, res: Response) => {
  try {
    const { sessionId, questionId, userId, answer, timeSpent } = req.body;

    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId)
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = answer === question.correctAnswer;

    // Record answer in history
    await db.insert(questionHistory).values({
      userId,
      questionId,
      answer,
      isCorrect,
      timeSpent,
      timestamp: new Date()
    });

    // Update quiz attempt
    const attempt = await db.query.quizAttempts.findFirst({
      where: eq(quizAttempts.id, sessionId)
    });

    if (attempt) {
      const answers = [...attempt.answers, { questionId, answer, correct: isCorrect }];
      const score = Math.round((answers.filter(a => a.correct).length / answers.length) * 100);

      await db.update(quizAttempts)
        .set({ 
          answers, 
          score,
          completedAt: answers.length === attempt.totalQuestions ? new Date() : undefined
        })
        .where(eq(quizAttempts.id, sessionId));
    }

    res.json({
      isCorrect,
      explanation: question.explanation,
      conceptBreakdown: question.conceptBreakdown
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

export default router;
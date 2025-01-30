import express from "express";
import { db } from "../db/index.js";
import { questions, questionHistory, userProgress } from "../db/schema.js";
import { questionHistorySchema, userProgressSchema } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/", async (req: Request<{}, {}, {}, { difficulty?: string; category?: string; min?: string }>, res: Response) => {
  try {
    const { difficulty, category, min = "25" } = req.query;

    let query = db.select().from(questions);

    if (difficulty && difficulty !== "all") {
      query = query.where(eq(questions.difficulty, parseInt(difficulty)));
    }

    if (category && category !== "all") {
      query = query.where(eq(questions.category, category));
    }

    const questionsList = await query.limit(parseInt(min));
    const shuffled = [...questionsList].sort(() => Math.random() - 0.5);

    res.json(shuffled);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

router.post("/:id/answer", async (req: Request<{ id: string }, {}, { answer: string; userId: string; timeSpent: number }>, res: Response) => {
  try {
    const { id } = req.params;
    const { answer, userId, timeSpent } = req.body;

    // Validate input
    const validatedHistory = questionHistorySchema.parse({
      userId: parseInt(userId),
      questionId: parseInt(id),
      answer,
      timeSpent,
      isCorrect: false // Will be updated after checking
    });

    const question = await db.select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)))
      .limit(1);

    if (!question.length) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = answer === question[0].correctAnswer;
    validatedHistory.isCorrect = isCorrect;

    // Record the answer in history
    await db.insert(questionHistory).values({
      ...validatedHistory,
      timestamp: new Date()
    });

    // Update user progress
    const progress = await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, parseInt(userId)))
      .limit(1);

    const now = new Date();

    if (progress.length) {
      const current = progress[0];
      const validatedProgress = userProgressSchema.parse({
        userId: parseInt(userId),
        moduleId: question[0].moduleId,
        completedQuestions: current.completedQuestions + 1,
        correctAnswers: current.correctAnswers + (isCorrect ? 1 : 0),
        lastAttempt: now,
        performanceMetrics: {
          ...current.performanceMetrics,
          lastScore: isCorrect ? 1 : 0,
          totalAttempts: (current.performanceMetrics?.totalAttempts || 0) + 1
        }
      });

      await db.update(userProgress)
        .set(validatedProgress)
        .where(eq(userProgress.userId, parseInt(userId)));
    } else {
      const validatedProgress = userProgressSchema.parse({
        userId: parseInt(userId),
        moduleId: question[0].moduleId,
        completedQuestions: 1,
        correctAnswers: isCorrect ? 1 : 0,
        lastAttempt: now,
        performanceMetrics: {
          lastScore: isCorrect ? 1 : 0,
          totalAttempts: 1
        }
      });

      await db.insert(userProgress).values(validatedProgress);
    }

    res.json({
      isCorrect,
      explanation: question[0].explanation
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

// Get user stats
router.get("/stats/:userId", async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const { userId } = req.params;
    const progress = await db.select()
      .from(questionHistory)
      .where(eq(questionHistory.userId, parseInt(userId)));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userStats = await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, parseInt(userId)))
      .limit(1);

    const stats = {
      totalAnswered: progress.length,
      correctAnswers: progress.filter(p => p.isCorrect).length,
      todayAnswered: progress.filter(p => {
        const answerDate = new Date(p.timestamp);
        answerDate.setHours(0, 0, 0, 0);
        return answerDate.getTime() === today.getTime();
      }).length,
      lastAttempt: userStats[0]?.lastAttempt || null,
      performanceMetrics: userStats[0]?.performanceMetrics || {}
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
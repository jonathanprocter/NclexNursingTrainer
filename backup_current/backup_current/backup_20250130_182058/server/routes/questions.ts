import express from "express";
import { db } from "../db";
import { questions, questionHistory, userProgress } from "../db/schema";
import { eq, and, lt, desc } from "drizzle-orm";

const router = express.Router();

// Get questions with filters
router.get("/", async (req, res) => {
  try {
    const { difficulty, category, min = 25 } = req.query;

    let query = db.select().from(questions);

    if (difficulty && difficulty !== "all") {
      query = query.where(
        eq(questions.difficulty, parseInt(difficulty as string)),
      );
    }

    if (category && category !== "all") {
      query = query.where(eq(questions.category, category as string));
    }

    const questionsList = await query.limit(parseInt(min as string));
    const shuffled = [...questionsList].sort(() => Math.random() - 0.5);

    res.json(shuffled);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Submit an answer
router.post("/:id/answer", async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, userId, timeSpent } = req.body;

    const question = await db
      .select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)))
      .limit(1);

    if (!question.length) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = answer === question[0].correctAnswer;

    // Record the answer in history
    await db.insert(questionHistory).values({
      userId: parseInt(userId),
      questionId: parseInt(id),
      answer,
      isCorrect,
      timeSpent,
      timestamp: new Date(),
    });

    // Update user progress
    const progress = await db
      .select({
        totalQuestions: userProgress.totalQuestions,
        correctAnswers: userProgress.correctAnswers,
        studyStreak: userProgress.studyStreak,
        lastStudied: userProgress.lastStudied,
      })
      .from(userProgress)
      .where(eq(userProgress.userId, parseInt(userId)))
      .limit(1);

    let newStreak = 1;
    if (progress.length) {
      const lastStudied = progress[0].lastStudied;
      if (lastStudied) {
        const lastStudiedDate = new Date(lastStudied);
        lastStudiedDate.setHours(0, 0, 0, 0);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        if (lastStudiedDate.getTime() === yesterday.getTime()) {
          newStreak = progress[0].studyStreak + 1;
        }
      }

      await db
        .update(userProgress)
        .set({
          totalQuestions: progress[0].totalQuestions + 1,
          correctAnswers: progress[0].correctAnswers + (isCorrect ? 1 : 0),
          lastStudied: new Date(),
          studyStreak: newStreak,
        })
        .where(eq(userProgress.userId, parseInt(userId)));
    } else {
      await db.insert(userProgress).values({
        userId: parseInt(userId),
        totalQuestions: 1,
        correctAnswers: isCorrect ? 1 : 0,
        lastStudied: new Date(),
        studyStreak: 1,
      });
    }

    res.json({
      isCorrect,
      explanation: question[0].explanation,
      conceptBreakdown: question[0].conceptBreakdown,
      streak: newStreak,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

// Get user stats
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await db
      .select()
      .from(questionHistory)
      .where(eq(questionHistory.userId, parseInt(userId)));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userProgress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, parseInt(userId)))
      .limit(1);

    const stats = {
      totalAnswered: progress.length,
      correctAnswers: progress.filter((p) => p.isCorrect).length,
      todayAnswered: progress.filter((p) => {
        const answerDate = new Date(p.timestamp);
        answerDate.setHours(0, 0, 0, 0);
        return answerDate.getTime() === today.getTime();
      }).length,
      streak: userProgress[0]?.studyStreak || 0,
      lastStudied: userProgress[0]?.lastStudied || null,
      masteryLevel: userProgress[0]?.masteryLevel || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Get question explanations
router.get("/:id/explain", async (req, res) => {
  try {
    const { id } = req.params;
    const questionResult = await db
      .select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)))
      .limit(1);

    if (!questionResult.length) {
      return res.status(404).json({ error: "Question not found" });
    }

    const question = questionResult[0];

    const explanation = {
      mainExplanation: question.explanation,
      conceptBreakdown: question.conceptBreakdown || [],
      faqs: question.faqs || [],
      relatedTopics: question.relatedTopics || [],
      references: question.references || [],
    };

    res.json(explanation);
  } catch (error) {
    console.error("Error fetching explanation:", error);
    res.status(500).json({ error: "Failed to fetch explanation" });
  }
});

export default router;

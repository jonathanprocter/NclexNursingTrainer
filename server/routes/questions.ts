import express from "express";
import { db } from "../db";
import { questions, questionHistory, userProgress } from "../db/schema";
import { eq, and, lt, desc } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { difficulty, category, min = 25 } = req.query;
    
    let query = db.select().from(questions);
    
    if (difficulty && difficulty !== "all") {
      query = query.where(eq(questions.difficulty, parseInt(difficulty as string)));
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

router.post("/:id/answer", async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, userId, timeSpent } = req.body;

    const question = await db.select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)))
      .limit(1);

    if (!question.length) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = answer === question[0].correctAnswer;

    await db.insert(questionHistory).values({
      userId: parseInt(userId),
      questionId: parseInt(id),
      answer,
      isCorrect,
      timeSpent,
      timestamp: new Date(),
    });

    const progress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, parseInt(userId)))
      .limit(1);

    if (progress.length) {
      await db
        .update(userProgress)
        .set({
          totalQuestions: progress[0].totalQuestions + 1,
          correctAnswers: progress[0].correctAnswers + (isCorrect ? 1 : 0),
          lastStudied: new Date(),
        })
        .where(eq(userProgress.userId, parseInt(userId)));
    }

    res.json({
      isCorrect,
      explanation: question[0].explanation,
      conceptBreakdown: question[0].conceptBreakdown,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

export default router;

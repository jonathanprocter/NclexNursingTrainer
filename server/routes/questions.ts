import express from "express";
import { db } from "../db";
import { questions, questionHistory, userProgress } from "../db/schema";
import { eq, and, lt, desc } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const questions = await db.query.questions.findMany() || [];
    if (questions.length === 0) {
      return res.json([{
        id: "sample_1",
        question: "Sample Question",
        answer: "Sample Answer",
        category: "General",
        explanation: "This is a sample question"
      }]);
    }
    res.json(questions);
  } catch (error) {
    console.error("Questions fetch error:", error);
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
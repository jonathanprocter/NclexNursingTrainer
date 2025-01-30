import express from "express";
import { db } from "../db";
import { questions, quizAttempts } from "../db/schema";
import { eq, and } from "drizzle-orm";

const router = express.Router();

// Start a new simulation
router.post("/start", async (req, res) => {
  try {
    const { userId, type, difficulty = "medium" } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get appropriate questions based on simulation type
    const simulationQuestions = await db.query.questions.findMany({
      where: and(
        eq(questions.type, type),
        eq(questions.difficulty, difficulty === "medium" ? 2 : difficulty === "hard" ? 3 : 1)
      ),
      limit: type === "CAT" ? 75 : 25 // CAT simulations use more questions
    });

    // Create simulation attempt
    const attempt = await db.insert(quizAttempts).values({
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
    }).returning();

    res.json({
      sessionId: attempt[0].id,
      questions: simulationQuestions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        category: q.category,
        subcategory: q.subcategory
      }))
    });
  } catch (error) {
    console.error("Error starting simulation:", error);
    res.status(500).json({ error: "Failed to start simulation" });
  }
});

// Submit simulation answer and get next question (for CAT)
router.post("/:sessionId/answer", async (req, res) => {
  try {
    const { questionId, answer, timeSpent } = req.body;
    const sessionId = parseInt(req.params.sessionId);

    const attempt = await db.query.quizAttempts.findFirst({
      where: eq(quizAttempts.id, sessionId)
    });

    if (!attempt) {
      return res.status(404).json({ error: "Simulation session not found" });
    }

    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId)
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = answer === question.correctAnswer;
    const answers = [...attempt.answers, { questionId, answer, correct: isCorrect, timeSpent }];
    const score = Math.round((answers.filter(a => a.correct).length / answers.length) * 100);

    // Update difficulty for CAT simulation
    let nextQuestion = null;
    if (attempt.type === "simulation_CAT" && answers.length < attempt.totalQuestions) {
      const currentDifficulty = attempt.aiAnalysis.currentDifficulty;
      const newDifficulty = isCorrect ? 
        Math.min(currentDifficulty + 1, 3) : 
        Math.max(currentDifficulty - 1, 1);

      // Get next question based on new difficulty
      nextQuestion = await db.query.questions.findFirst({
        where: and(
          eq(questions.difficulty, newDifficulty),
          eq(questions.type, "CAT")
        )
      });

      // Update AI analysis
      attempt.aiAnalysis.currentDifficulty = newDifficulty;
      attempt.aiAnalysis.masteryEstimate = score / 100;
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

    res.json({
      isCorrect,
      explanation: question.explanation,
      conceptBreakdown: question.conceptBreakdown,
      nextQuestion: nextQuestion ? {
        id: nextQuestion.id,
        text: nextQuestion.text,
        type: nextQuestion.type,
        options: nextQuestion.options
      } : null,
      completed: answers.length === attempt.totalQuestions
    });
  } catch (error) {
    console.error("Error processing simulation answer:", error);
    res.status(500).json({ error: "Failed to process answer" });
  }
});

export default router;

import express from "express";
import { practiceQuestions } from "../data/practice-questions";

const router = express.Router();

// GET /api/questions - Get all questions with optional filtering
router.get("/", async (req, res) => {
  try {
    const { topic, limit = 10, page = 1 } = req.query;

    let questionsList = practiceQuestions;

    // Filter by topic if provided
    if (topic) {
      questionsList = questionsList.filter(q =>
        q.category.toLowerCase() === topic.toString().toLowerCase()
      );
    }

    // Apply pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedQuestions = questionsList.slice(startIndex, endIndex);

    res.json({
      questions: paginatedQuestions,
      total: questionsList.length,
      page: Number(page),
      totalPages: Math.ceil(questionsList.length / Number(limit))
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      message: "Failed to fetch questions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/questions/:id - Get a specific question by ID
router.get("/:id", async (req, res) => {
  try {
    const question = practiceQuestions.find(q => q.id === req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({
      message: "Failed to fetch question",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;

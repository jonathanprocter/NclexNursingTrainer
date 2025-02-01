#!/bin/bash
set -e

echo "Creating necessary directories..."
mkdir -p server/attached_assets
mkdir -p server/data
mkdir -p server/routes

echo "Creating server/routes.ts..."
cat << 'EOF' > server/routes.ts
// server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { db } from "@db";
import { eq } from "drizzle-orm";
import studyGuideRouter from "./routes/study-guide";
// Import the questions router from the attached_assets folder
import questionRouter from "./attached_assets/question-routes";
import OpenAI from "openai";
import { studyBuddyChats, quizAttempts, userProgress, questions } from "@db/schema";

// Key validation and initialization code here...

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Register API routes
  app.use("/api/questions", questionRouter);
  app.use("/api/study-guide", studyGuideRouter);

  // Serve static files for the frontend
  app.use(express.static("public"));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return;
    }
    res.sendFile("index.html", { root: "public" });
  });

  return httpServer;
}
EOF

echo "Creating server/attached_assets/question-routes.ts..."
cat << 'EOF' > server/attached_assets/question-routes.ts
// server/attached_assets/question-routes.ts
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
EOF

echo "Creating server/data/practice-questions.ts..."
cat << 'EOF' > server/data/practice-questions.ts
// server/data/practice-questions.ts
export const practiceQuestions = [
  {
    id: "fund-1",
    text: "A client has a respiratory rate of 28 breaths/min, oxygen saturation of 89%, and is using accessory muscles. Which nursing intervention should be implemented first?",
    options: [
      { id: "a", text: "Position the client in high Fowler's position" },
      { id: "b", text: "Administer prescribed PRN bronchodilator" },
      { id: "c", text: "Call for a respiratory therapy consult" },
      { id: "d", text: "Document the assessment findings" }
    ],
    correctAnswer: "a",
    explanation: "Positioning the client in high Fowler's position is the first priority as it maximizes lung expansion and reduces the work of breathing.",
    category: "Fundamentals",
    difficulty: "Medium",
    tags: ["respiratory", "positioning", "oxygenation"]
  },
  {
    id: "med-1",
    text: "A client with heart failure is experiencing dyspnea and fatigue. Which position would best facilitate breathing?",
    options: [
      { id: "a", text: "Supine position with one pillow" },
      { id: "b", text: "High Fowler's position (60-90 degrees)" },
      { id: "c", text: "Left lateral position with legs elevated" },
      { id: "d", text: "Right lateral position with head flat" }
    ],
    correctAnswer: "b",
    explanation: "High Fowler's position reduces venous return and promotes optimal lung expansion.",
    category: "Med-Surg",
    difficulty: "Medium",
    tags: ["cardiac", "positioning", "respiratory"]
  }
];
EOF

echo "Setup complete. Your routes and practice questions files have been created."

import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { eq } from "drizzle-orm";
import studyGuideRouter from './routes/study-guide';
import OpenAI from "openai";
import { studyBuddyChats, quizAttempts, userProgress, questions } from "@db/schema";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Register original routes
  app.use('/api/study-guide', studyGuideRouter);
  
  // Questions endpoint
  app.get('/api/questions', async (req, res) => {
    try {
      const defaultQuestions = [
        {
          id: 1,
          question: "What is the first step in the nursing process?",
          options: [
            { id: "a", text: "Assessment" },
            { id: "b", text: "Planning" },
            { id: "c", text: "Implementation" },
            { id: "d", text: "Evaluation" }
          ],
          correctAnswer: "a",
          explanation: "Assessment is the first step of the nursing process where data is collected about the patient's health status."
        },
        {
          id: 2,
          question: "Which vital sign is most indicative of infection?",
          options: [
            { id: "a", text: "Blood pressure" },
            { id: "b", text: "Temperature" },
            { id: "c", text: "Pulse" },
            { id: "d", text: "Respiratory rate" }
          ],
          correctAnswer: "b",
          explanation: "An elevated temperature (fever) is often the first sign of infection in the body."
        }
      ];
      
      res.json({ questions: defaultQuestions });
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  return httpServer;
}

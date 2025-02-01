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

  return httpServer;
}

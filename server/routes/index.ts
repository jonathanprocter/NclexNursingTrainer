import type { Express } from "express";
import { createServer, type Server } from "http";
import studyGuideRouter from "./study-guide";
import questionsRouter from "./questions";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Register routes
  app.use("/api/study-guide", studyGuideRouter);
  app.use("/api/questions", questionsRouter);

  return httpServer;
}

export default registerRoutes;

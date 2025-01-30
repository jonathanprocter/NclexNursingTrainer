import type { Express } from "express";
import { createServer, type Server } from "http";
import studyGuideRouter from '@/study-guide';
import questionsRouter from '@/questions';
import analyticsRouter from '@/analytics';
import modulesRouter from '@/modules';
import practiceRouter from '@/practice';
import simulationsRouter from '@/simulations';
import studyToolsRouter from '@/study-tools';

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Register routes
  app.use("/api/study-guide", studyGuideRouter);
  app.use("/api/questions", questionsRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/modules", modulesRouter);
  app.use("/api/practice", practiceRouter);
  app.use("/api/simulations", simulationsRouter);
  app.use("/api/study-tools", studyToolsRouter);

  return httpServer;
}

export default registerRoutes;
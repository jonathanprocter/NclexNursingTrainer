import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { modules, questions, quizAttempts, userProgress, studyPlans, aiInteractions } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // AI-Enhanced Study Plan Routes
  app.post("/api/study-plans", async (req, res) => {
    try {
      const { userId, duration, targetAreas } = req.body;
      const newPlan = await db.insert(studyPlans).values({
        userId,
        duration,
        targetAreas,
        plan: req.body.plan,
        createdAt: new Date(),
      }).returning();
      res.json(newPlan[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to create study plan" });
    }
  });

  // AI Performance Analysis Routes
  app.get("/api/analytics/user/:userId", async (req, res) => {
    try {
      // Fetch all performance data
      const attempts = await db.query.quizAttempts.findMany({
        where: eq(quizAttempts.userId, parseInt(req.params.userId)),
        orderBy: (quizAttempts, { desc }) => [desc(quizAttempts.startedAt)],
      });

      const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, parseInt(req.params.userId)),
      });

      const studyPlansData = await db.query.studyPlans.findMany({
        where: eq(studyPlans.userId, parseInt(req.params.userId)),
        orderBy: (studyPlans, { desc }) => [desc(studyPlans.createdAt)],
      });

      // Calculate comprehensive analytics
      const summary = {
        totalAttempts: attempts.length,
        averageScore: attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length || 0,
        completedPlans: studyPlansData.filter(plan => plan.completed).length,
        strengthAreas: progress.flatMap(p => p.strengthAreas || []),
        weakAreas: progress.flatMap(p => p.weakAreas || []),
      };

      res.json({
        attempts,
        progress,
        studyPlans: studyPlansData,
        summary,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // AI-Generated Questions Routes
  app.post("/api/questions/generate", async (req, res) => {
    try {
      const { moduleId, type, difficulty, topics } = req.body;
      const newQuestion = await db.insert(questions).values({
        moduleId,
        type,
        difficulty,
        topics,
        text: req.body.text,
        options: req.body.options,
        correctAnswer: req.body.correctAnswer,
        explanation: req.body.explanation,
        aiGenerated: true,
        createdAt: new Date(),
      }).returning();
      res.json(newQuestion[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate question" });
    }
  });

  // Track AI Interactions
  app.post("/api/ai-interactions", async (req, res) => {
    try {
      const { userId, type, input, output, metadata } = req.body;
      const interaction = await db.insert(aiInteractions).values({
        userId,
        type,
        input,
        output,
        metadata,
        createdAt: new Date(),
      }).returning();
      res.json(interaction[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to log AI interaction" });
    }
  });

  // Update User Progress with AI Analysis
  app.post("/api/progress/update", async (req, res) => {
    try {
      const { userId, moduleId, strengthAreas, weakAreas, metrics } = req.body;

      const updatedProgress = await db.update(userProgress)
        .set({
          strengthAreas,
          weakAreas,
          averageResponseTime: metrics.averageResponseTime,
          currentDifficulty: metrics.suggestedDifficulty,
          updatedAt: new Date(),
        })
        .where(and(
          eq(userProgress.userId, userId),
          eq(userProgress.moduleId, moduleId)
        ))
        .returning();

      res.json(updatedProgress[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Keep existing routes
  app.get("/api/modules", async (_req, res) => {
    try {
      const allModules = await db.query.modules.findMany({
        orderBy: (modules, { asc }) => [asc(modules.orderIndex)],
      });
      res.json(allModules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.get("/api/questions/:moduleId", async (req, res) => {
    try {
      const moduleQuestions = await db.query.questions.findMany({
        where: eq(questions.moduleId, parseInt(req.params.moduleId)),
      });
      res.json(moduleQuestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post("/api/quiz-attempts", async (req, res) => {
    try {
      const { userId, moduleId, type, answers, performanceMetrics } = req.body;
      const newAttempt = await db.insert(quizAttempts).values({
        userId,
        moduleId,
        type,
        answers,
        performanceMetrics,
        score: 0, // Calculate score based on answers
        totalQuestions: answers.length,
        startedAt: new Date(),
      }).returning();
      res.json(newAttempt[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to save quiz attempt" });
    }
  });

  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, parseInt(req.params.userId)),
        with: {
          module: true,
        },
      });
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
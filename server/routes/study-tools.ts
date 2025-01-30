import express from "express";
import { db } from "../db/index";
import { modules, userProgress } from "../db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "express";

const router = express.Router();

interface StudyScheduleResponse {
  moduleId: number;
  moduleName: string;
  nextReview: Date | null;
  masteryLevel: number;
  recommendedStudyTime: number;
  focusAreas: string[];
}

interface StudyGoalsRequest {
  goals: Record<string, any>;
}

// Get study schedule
const getStudySchedule: RequestHandler = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      res.status(400).json([]);
      return;
    }

    const progress = await db.query.userProgress.findMany({
      where: eq(userProgress.userId, userId),
      with: {
        module: {
          columns: {
            id: true,
            title: true
          }
        }
      }
    });

    const schedule: StudyScheduleResponse[] = progress.map(p => ({
      moduleId: p.moduleId,
      moduleName: p.module?.title || 'Unknown Module',
      nextReview: p.nextReview,
      masteryLevel: p.masteryLevel,
      recommendedStudyTime: p.masteryLevel < 70 ? 60 : 30, // minutes
      focusAreas: p.weakAreas || []
    }));

    res.json(schedule);
  } catch (error) {
    console.error("Error fetching study schedule:", error);
    next(error);
  }
};

// Create/Update study goals
const updateStudyGoals: RequestHandler = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const { goals } = req.body as StudyGoalsRequest;

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    await db.update(userProgress)
      .set({ 
        studyGoals: goals,
        updatedAt: new Date()
      })
      .where(eq(userProgress.userId, userId));

    res.json({ success: true, message: "Study goals updated successfully" });
  } catch (error) {
    console.error("Error updating study goals:", error);
    next(error);
  }
};

// Get concept maps
const getConceptMap: RequestHandler = async (req, res, next) => {
  try {
    const moduleId = parseInt(req.params.moduleId);

    if (isNaN(moduleId)) {
      res.status(400).json({ error: "Invalid module ID" });
      return;
    }

    const module = await db.query.modules.findFirst({
      where: eq(modules.id, moduleId)
    });

    if (!module) {
      res.status(404).json({ error: "Module not found" });
      return;
    }

    const conceptMap = module.aiGeneratedContent?.conceptMap || {
      nodes: [],
      edges: []
    };

    res.json(conceptMap);
  } catch (error) {
    console.error("Error fetching concept map:", error);
    next(error);
  }
};

router.get("/schedule/:userId", getStudySchedule);
router.post("/goals/:userId", updateStudyGoals);
router.get("/concept-maps/:moduleId", getConceptMap);

export default router;
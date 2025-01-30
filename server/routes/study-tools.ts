import express, { Request, Response } from "express";
import { db } from "../db";
import { modules, userProgress } from "../db/schema";
import { eq } from "drizzle-orm";

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
router.get("/schedule/:userId", async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const progress = await db.query.userProgress.findMany({
      where: eq(userProgress.userId, userId),
      with: {
        module: true
      }
    });

    // Generate study recommendations based on progress
    const schedule: StudyScheduleResponse[] = progress.map(p => ({
      moduleId: p.moduleId,
      moduleName: p.module.title,
      nextReview: p.nextReview,
      masteryLevel: p.masteryLevel,
      recommendedStudyTime: p.masteryLevel < 70 ? 60 : 30, // minutes
      focusAreas: p.weakAreas || []
    }));

    res.json(schedule);
  } catch (error) {
    console.error("Error fetching study schedule:", error);
    res.status(500).json({ error: "Failed to fetch study schedule" });
  }
});

// Create/Update study goals
router.post("/goals/:userId", async (req: Request<{ userId: string }, {}, StudyGoalsRequest>, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { goals } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
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
    res.status(500).json({ error: "Failed to update study goals" });
  }
});

// Get concept maps
router.get("/concept-maps/:moduleId", async (req: Request<{ moduleId: string }>, res: Response) => {
  try {
    const moduleId = parseInt(req.params.moduleId);

    if (isNaN(moduleId)) {
      return res.status(400).json({ error: "Invalid module ID" });
    }

    const module = await db.query.modules.findFirst({
      where: eq(modules.id, moduleId)
    });

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    // Generate concept map from module content
    const conceptMap = module.aiGeneratedContent?.conceptMap || {
      nodes: [],
      edges: []
    };

    res.json(conceptMap);
  } catch (error) {
    console.error("Error fetching concept map:", error);
    res.status(500).json({ error: "Failed to fetch concept map" });
  }
});

export default router;
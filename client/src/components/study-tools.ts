import express from "express";
import { db } from '@/db/index';
import { modules, userProgress, type Module, type UserProgress } from '@/db/schema';
import { eq } from "drizzle-orm";
import type { RequestHandler } from "express";
import { z } from "zod";

const router = express.Router();

interface StudyScheduleResponse {
  moduleId: number;
  moduleName: string;
  nextReview: Date | null;
  masteryLevel: number;
  recommendedStudyTime: number;
  focusAreas: string[];
}

const userIdSchema = z.object({
  userId: z.string().regex(/^\d+$/).transform(Number)
});

const moduleIdSchema = z.object({
  moduleId: z.string().regex(/^\d+$/).transform(Number)
});

const studyGoalsSchema = z.object({
  goals: z.record(z.unknown())
});

// Get study schedule
const getStudySchedule: RequestHandler<{ userId: string }> = async (req, res, next) => {
  try {
    const result = userIdSchema.safeParse({ userId: req.params.userId });

    if (!result.success) {
      res.status(400).json({ 
        error: "Invalid user ID",
        details: result.error.issues
      });
      return;
    }

    const { userId } = result.data;

    const progress = await db.query.userProgress.findMany({
      where: eq(userProgress.userId, userId),
      columns: {
        moduleId: true,
        masteryLevel: true,
        nextReview: true,
        weakAreas: true
      },
      with: {
        module: {
          columns: {
            title: true
          }
        }
      }
    }) satisfies (UserProgress & { module: Module | null })[];

    const schedule: StudyScheduleResponse[] = progress.map(p => ({
      moduleId: p.moduleId,
      moduleName: p.module?.title ?? 'Unknown Module',
      nextReview: p.nextReview,
      masteryLevel: p.masteryLevel,
      recommendedStudyTime: p.masteryLevel < 70 ? 60 : 30, // minutes
      focusAreas: p.weakAreas ?? []
    }));

    res.json(schedule);
  } catch (error) {
    console.error("Error fetching study schedule:", error);
    next(error);
  }
};

// Create/Update study goals
const updateStudyGoals: RequestHandler<{ userId: string }> = async (req, res, next) => {
  try {
    const userResult = userIdSchema.safeParse({ userId: req.params.userId });
    const goalsResult = studyGoalsSchema.safeParse(req.body);

    if (!userResult.success || !goalsResult.success) {
      res.status(400).json({ 
        error: "Invalid request data",
        details: {
          ...(userResult.success ? {} : { userId: userResult.error.issues }),
          ...(goalsResult.success ? {} : { goals: goalsResult.error.issues })
        }
      });
      return;
    }

    const { userId } = userResult.data;
    const { goals } = goalsResult.data;

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
const getConceptMap: RequestHandler<{ moduleId: string }> = async (req, res, next) => {
  try {
    const result = moduleIdSchema.safeParse({ moduleId: req.params.moduleId });

    if (!result.success) {
      res.status(400).json({ 
        error: "Invalid module ID",
        details: result.error.issues
      });
      return;
    }

    const { moduleId } = result.data;

    const module = await db.query.modules.findFirst({
      where: eq(modules.id, moduleId),
      columns: {
        id: true,
        aiGeneratedContent: true
      }
    }) satisfies Module | undefined;

    if (!module) {
      res.status(404).json({ error: "Module not found" });
      return;
    }

    const conceptMap = module.aiGeneratedContent?.conceptMap ?? {
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
import express from "express";
import { db } from "../db/index";
import type { RequestHandler } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { modules, questions, type Module, type Question } from "../db/schema";

const router = express.Router();

const moduleIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
});

interface QuestionMetadata {
  total: number;
  byDifficulty: Record<number, number>;
  byType: Record<string, number>;
}

interface ModuleResponse extends Omit<Module, 'questions'> {
  questions: Array<{
    id: number;
    text: string;
    type: string;
    options: Array<{ id: string; text: string }>;
    difficulty: number;
    category: string;
    subcategory: string;
    topicTags: string[];
    conceptBreakdown: Array<{ concept: string; explanation: string }>;
    aiGenerated: boolean;
  }>;
  metadata: QuestionMetadata;
}

// Get all modules with their metadata
const getAllModules: RequestHandler = async (_req, res, next) => {
  try {
    const allModules = await db.query.modules.findMany({
      orderBy: (modules, { asc }) => [asc(modules.orderIndex)],
      columns: {
        id: true,
        title: true,
        description: true,
        type: true,
        orderIndex: true,
        aiGeneratedContent: true,
        createdAt: true,
        updatedAt: true
      }
    }) satisfies Module[];

    if (allModules.length === 0) {
      res.json({ 
        modules: [], 
        message: "No modules found",
        count: 0
      });
      return;
    }

    res.json({ 
      modules: allModules,
      count: allModules.length
    });
  } catch (error) {
    console.error("Error fetching modules:", error);
    next(error);
  }
};

// Get module by ID with its questions and metadata
const getModuleById: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const result = moduleIdSchema.safeParse({ id: req.params.id });

    if (!result.success) {
      res.status(400).json({ 
        error: "Invalid module ID",
        details: result.error.issues
      });
      return;
    }

    const moduleId = result.data.id;

    const moduleData = await db.query.modules.findFirst({
      where: eq(modules.id, moduleId),
      columns: {
        id: true,
        title: true,
        description: true,
        type: true,
        orderIndex: true,
        aiGeneratedContent: true,
        createdAt: true,
        updatedAt: true
      },
      with: {
        questions: {
          orderBy: (questions, { asc }) => [asc(questions.id)],
          columns: {
            id: true,
            text: true,
            type: true,
            options: true,
            difficulty: true,
            category: true,
            subcategory: true,
            topicTags: true,
            conceptBreakdown: true,
            aiGenerated: true
          }
        }
      }
    }) satisfies (Module & { questions: Question[] }) | undefined;

    if (!moduleData) {
      res.status(404).json({ error: "Module not found" });
      return;
    }

    const questionsMetadata: QuestionMetadata = {
      total: moduleData.questions.length,
      byDifficulty: moduleData.questions.reduce((acc: Record<number, number>, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
      }, {}),
      byType: moduleData.questions.reduce((acc: Record<string, number>, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      }, {})
    };

    const response: ModuleResponse = {
      ...moduleData,
      questions: moduleData.questions.map(q => ({
        ...q,
        topicTags: q.topicTags ?? [],
        conceptBreakdown: q.conceptBreakdown ?? []
      })),
      metadata: questionsMetadata
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching module:", error);
    next(error);
  }
};

router.get("/", getAllModules);
router.get("/:id", getModuleById);

export default router;
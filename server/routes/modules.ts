import express from "express";
import { db } from "../db";
import { modules, questions } from "../db/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Get all modules
router.get("/", async (_req, res) => {
  try {
    const allModules = await db.query.modules.findMany({
      orderBy: (modules, { asc }) => [asc(modules.orderIndex)]
    });
    res.json(allModules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ error: "Failed to fetch modules" });
  }
});

// Get module by ID with its questions
router.get("/:id", async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id);
    if (isNaN(moduleId)) {
      return res.status(400).json({ error: "Invalid module ID" });
    }

    const moduleData = await db.query.modules.findFirst({
      where: eq(modules.id, moduleId),
      with: {
        questions: {
          orderBy: (questions, { asc }) => [asc(questions.id)]
        }
      }
    });

    if (!moduleData) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.json(moduleData);
  } catch (error) {
    console.error("Error fetching module:", error);
    res.status(500).json({ error: "Failed to fetch module" });
  }
});

export default router;

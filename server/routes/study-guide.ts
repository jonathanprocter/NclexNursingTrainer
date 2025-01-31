import { Router } from 'express';
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { userProgress } from "../db/schema.js";
import { 
  StudyGuideRequest, 
  StudyGuideResponse,
  studyGuideRequestSchema
} from "../types.js";
import { z } from 'zod';

const router = Router();

// Middleware for validation
const validateRequest = <T>(schema: z.ZodSchema<T>) => (
  async (req: any, res: any, next: any) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        next(error);
      }
    }
  }
);

// Get current study guide
router.get("/current/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Get user's performance data
    const performance = await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    // Calculate performance metrics
    const completedModules = performance.filter(p => p.completedQuestions && parseInt(p.completedQuestions) > 0);
    const averageScore = completedModules.length > 0
      ? completedModules.reduce((acc, curr) => 
          acc + (parseInt(curr.correctAnswers || '0') / parseInt(curr.completedQuestions || '1') * 100), 0) / completedModules.length
      : 0;

    // Generate study guide
    const guide: StudyGuideResponse = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: [
        "Fundamentals of Nursing",
        "Pharmacology",
        "Medical-Surgical Nursing",
        "Pediatric Nursing"
      ].map((domain, index) => ({
        id: domain.toLowerCase().replace(/\s+/g, '-'),
        name: domain,
        priority: index === 0 ? 'high' : 'medium',
        completed: false,
        estimatedTime: 30,
        description: `Focus on mastering key concepts in ${domain}`,
        learningTips: [
          "Review core concepts",
          "Practice with questions",
          "Create summaries"
        ]
      })),
      weakAreas: [],
      strengthAreas: [],
      recommendedResources: [],
      progress: averageScore,
      nextSteps: [
        "Review weak areas",
        "Take practice tests",
        "Schedule reviews"
      ]
    };

    res.json({
      success: true,
      data: guide
    });
  } catch (error) {
    console.error("Error fetching study guide:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch study guide',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate new study guide with validation
router.post("/generate", validateRequest(studyGuideRequestSchema), async (req, res) => {
  try {
    const { userId, focusAreas = [], timeAvailable } = req.body as StudyGuideRequest;

    // Get user's performance data
    const performance = await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    // Generate weak areas analysis
    const weakAreas = performance
      .filter(p => p.completedQuestions && p.correctAnswers && 
        (parseInt(p.correctAnswers) / parseInt(p.completedQuestions)) < 0.7)
      .map(p => ({
        moduleId: p.moduleId,
        score: Math.round((parseInt(p.correctAnswers || '0') / parseInt(p.completedQuestions || '1')) * 100).toString()
      }));

    const guide: StudyGuideResponse = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: [
        "Fundamentals of Nursing",
        "Pharmacology",
        "Medical-Surgical Nursing",
        "Pediatric Nursing"
      ].map((domain) => ({
        id: domain.toLowerCase().replace(/\s+/g, '-'),
        name: domain,
        priority: focusAreas.includes(domain) ? 'high' : 'medium',
        completed: false,
        estimatedTime: timeAvailable ? Math.floor(timeAvailable / 4) : 30,
        description: `Focus on mastering key concepts in ${domain}`,
        learningTips: [
          "Review core concepts",
          "Practice with questions",
          "Create summaries"
        ]
      })),
      weakAreas,
      strengthAreas: [],
      recommendedResources: focusAreas.map((plan, i) => ({
        id: `resource-${i}`,
        type: 'article',
        title: plan,
        url: `/resources/${plan.toLowerCase().replace(/\s+/g, '-')}`,
        difficulty: i === 0 ? 'beginner' : 'intermediate',
        estimatedTime: '30 mins',
        learningOutcome: `Master ${plan} concepts and applications`
      })),
      progress: 0,
      nextSteps: [
        "Break study sessions into 25-minute focused intervals",
        "Review material regularly to reinforce learning",
        "Practice active recall through self-testing"
      ]
    };

    res.json({
      success: true,
      data: guide
    });
  } catch (error) {
    console.error("Error generating study guide:", error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate study guide',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
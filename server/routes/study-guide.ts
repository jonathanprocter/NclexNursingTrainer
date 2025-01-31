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
      req.validatedData = await schema.parseAsync(req.body);
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
router.get("/current", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const performance = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    // Calculate performance metrics
    const completedModules = performance.filter(p => p.completedQuestions && parseInt(p.completedQuestions) > 0);
    const averageScore = completedModules.length > 0
      ? completedModules.reduce((acc, curr) => 
          acc + ((parseInt(curr.correctAnswers || '0') / parseInt(curr.completedQuestions || '1')) * 100), 0) / completedModules.length
      : 0;

    // Generate response
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
    const { userId, focusAreas = [], timeAvailable } = req.validatedData as StudyGuideRequest;

    // Get user's performance data with proper ordering
    const performance = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(userProgress.updatedAt);

    // Analyze weak areas based on completedQuestions and correctAnswers
    const weakAreas = performance
      .filter(p => p.completedQuestions && p.correctAnswers && 
        (p.correctAnswers / p.completedQuestions) < 0.7)
      .map(p => ({
        moduleId: p.moduleId?.toString(),
        score: Math.round((p.correctAnswers || 0) / (p.completedQuestions || 1) * 100),
        improvement: `Focus on core concepts`,
        suggestedApproach: timeAvailable ?
          `Review fundamentals and practice with ${Math.round(timeAvailable * 0.4)} minutes of targeted questions` :
          'Practice with targeted questions'
      }));

    const defaultWeakAreas = [
      { topic: "Fundamentals of Nursing", score: "60", improvement: "Review basic nursing concepts", suggestedApproach: "Spend 20 minutes reviewing fundamental concepts." },
      { topic: "Pharmacology", score: "55", improvement: "Focus on medication calculations and side effects", suggestedApproach: "Practice medication calculations and review common side effects of medications." }
    ];

    const nursingTopics = [
      "Fundamentals of Nursing",
      "Pharmacology",
      "Medical-Surgical Nursing",
      "Pediatric Nursing"
    ];

    const guide: StudyGuideResponse = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: nursingTopics.map((domain, index) => ({
        id: domain.toLowerCase().replace(/\s+/g, '-'),
        name: domain,
        priority: focusAreas.includes(domain) ? 'high' : 'medium',
        completed: false,
        estimatedTime: timeAvailable ? Math.floor(timeAvailable / 4) : 30,
        description: `Focus on mastering key concepts in ${domain} for better NCLEX preparation`,
        learningTips: [
          "Review core concepts first",
          "Practice with sample questions",
          "Create summary notes"
        ]
      })),
      weakAreas: weakAreas.length > 0 ? weakAreas : defaultWeakAreas,
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

    res.json(guide);
  } catch (error) {
    console.error("Error generating study guide:", error);
    res.status(500).json({
      error: 'Failed to generate study guide',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Please try again or adjust your study preferences'
    });
  }
});

export default router;
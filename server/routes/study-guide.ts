import { Router } from 'express';
import { db } from "@db";
import { eq, desc } from "drizzle-orm";
import { userProgress } from "@db/schema";

interface StudyTopic {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  estimatedTime: number;
  description?: string;
  learningTips?: string[];
  learningObjectives?: string[];
}

interface StudyResource {
  id: string;
  type: 'article' | 'video' | 'quiz';
  title: string;
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  learningOutcome?: string;
}

interface StudyGuide {
  id: string;
  createdAt: string;
  topics: StudyTopic[];
  weakAreas: Array<{
    moduleId?: string;
    topic?: string;
    score?: string;
    improvement?: string;
    suggestedApproach?: string;
  }>;
  strengthAreas: Array<{
    moduleId?: string;
    topic?: string;
    score?: string;
    tip?: string;
  }>;
  recommendedResources: StudyResource[];
  progress: number;
  studyTips?: string[];
  nextSteps?: string[];
}

const router = Router();

// Get current study guide with enhanced error handling and learner feedback
router.get("/current", async (req, res) => {
  try {
    const userId = 1; // TODO: Replace with actual user ID from auth, should be Bianca's ID

    // Get recent performance data for personalized recommendations
    const performance = await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    // Calculate performance metrics
    const completedModules = performance.filter(p => p.completedQuestions > 0);
    const averageScore = completedModules.length > 0
      ? completedModules.reduce((acc, curr) => acc + (curr.correctAnswers / curr.completedQuestions * 100), 0) / completedModules.length
      : 0;

    // Generate adaptive recommendations based on performance
    const weakModules = completedModules
      .filter(p => (p.correctAnswers / p.completedQuestions) < 0.7)
      .map(p => ({
        id: p.moduleId,
        score: (p.correctAnswers / p.completedQuestions * 100).toFixed(1)
      }));

    const strongModules = completedModules
      .filter(p => (p.correctAnswers / p.completedQuestions) >= 0.7)
      .map(p => ({
        id: p.moduleId,
        score: (p.correctAnswers / p.completedQuestions * 100).toFixed(1)
      }));

    const nclex2024Domains: string[] = [
      "Domain 1: Basic Care and Comfort",
      "Domain 2: Pharmacological and Parenteral Therapies",
      "Domain 3: Reduction of Risk Potential",
      "Domain 4: Physiological Adaptation",
      "Domain 5: Psychosocial Integrity",
      "Domain 6: Safe and Effective Care Environment"

    ];

    // Transform data to learner-friendly format
    const guide: StudyGuide = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: nclex2024Domains.map((domain: string, index: number) => ({
        id: domain.toLowerCase().replace(/\s+/g, '-'),
        name: domain,
        priority: index === 0 ? 'high' : 'medium',
        completed: false,
        estimatedTime: 30,
        description: `Focus on mastering key concepts in ${domain} for better NCLEX preparation`,
        learningTips: [
          "Review core concepts first",
          "Practice with sample questions",
          "Create summary notes"
        ]
      })),
      weakAreas: weakModules.map(module => ({
        moduleId: module.id,
        score: module.score,
        improvement: "Focus on understanding core concepts and practice more questions"
      })).slice(0, 3),
      strengthAreas: strongModules.map(module => ({
        moduleId: module.id,
        score: module.score,
        tip: "Keep practicing to maintain proficiency"
      })).slice(0, 3),
      recommendedResources: [
        "Patient Care Management",
        "Medication Administration",
        "Health Assessment"
      ].map((plan: string, i: number) => ({
        id: `resource-${i}`,
        type: 'article',
        title: plan,
        url: `/resources/${plan.toLowerCase().replace(/\s+/g, '-')}`,
        difficulty: i === 0 ? 'beginner' : 'intermediate',
        estimatedTime: '30 mins',
        learningOutcome: `Master ${plan} concepts and applications`
      })),
      progress: averageScore,
      nextSteps: [
        "Review weak areas first",
        "Take practice tests in strong areas to maintain knowledge",
        "Schedule regular review sessions"
      ]
    };

    res.json(guide);
  } catch (error) {
    console.error("Error fetching study guide:", error);
    res.status(500).json({
      error: 'Failed to fetch study guide',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Please try refreshing the page or contact support if the issue persists'
    });
  }
});

// Generate new personalized study guide
router.post("/generate", async (req, res) => {
  try {
    const userId = 1; // TODO: Replace with actual user ID from auth, should be Bianca's ID
    const { focusAreas = [], timeAvailable } = req.body as { focusAreas: string[], timeAvailable?: number };

    const nclex2024Domains = [
      "Domain 1: Basic Care and Comfort",
      "Domain 2: Pharmacological and Parenteral Therapies",
      "Domain 3: Reduction of Risk Potential",
      "Domain 4: Physiological Adaptation",
      "Domain 5: Psychosocial Integrity",
      "Domain 6: Safe and Effective Care Environment"
    ];

    const guide: StudyGuide = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: nclex2024Domains.map((domain: string, index: number) => ({
        id: domain.toLowerCase().replace(/\s+/g, '-'),
        name: domain,
        priority: focusAreas.includes(domain) ? 'high' : 'medium',
        completed: false,
        estimatedTime: timeAvailable ? Math.floor(timeAvailable / 6) : 30, // Adjusted for 6 domains
        learningObjectives: [
          `Understand key concepts in ${domain}`,
          "Apply knowledge in practice questions",
          "Review and reinforce learning"
        ]
      })),
      weakAreas: focusAreas.map((area: string) => ({
        topic: area,
        suggestedApproach: "Start with fundamentals and gradually increase difficulty"
      })),
      strengthAreas: [],
      recommendedResources: focusAreas.map((plan: string, i: number) => ({
        id: `resource-${i}`,
        type: 'article',
        title: plan,
        url: `/resources/${plan.toLowerCase().replace(/\s+/g, '-')}`,
        difficulty: i === 0 ? 'beginner' : 'intermediate',
        estimatedTime: '30 mins',
        learningOutcome: `Master ${plan} concepts and applications`
      })),
      progress: 0,
      studyTips: [
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
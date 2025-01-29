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
    const userId = 1; // TODO: Replace with actual user ID from auth

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

    const nursingTopics: string[] = [
      "Fundamentals of Nursing",
      "Pharmacology",
      "Medical-Surgical Nursing",
      "Pediatric Nursing"
    ];

    // Transform data to learner-friendly format
    const guide: StudyGuide = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: nursingTopics.map((domain: string, index: number) => ({
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

// Generate new study guide
router.post("/generate", async (req, res) => {
  try {
    const userId = 1; // TODO: Replace with actual user ID from auth
    const { focusAreas = [], timeAvailable } = req.body as { focusAreas: string[], timeAvailable?: number };

    // Get user's performance data
    const performance = await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.timestamp))
      .limit(10);

    // Analyze weak areas
    const weakAreas = performance
      .filter(p => (p.correctAnswers / p.completedQuestions) < 0.7)
      .map(p => ({
        topic: p.topic,
        score: Math.round((p.correctAnswers / p.completedQuestions) * 100),
        improvement: `Focus on understanding core concepts in ${p.topic}`,
        suggestedApproach: `Review fundamentals and practice with ${Math.round(timeAvailable * 0.4)} minutes of targeted questions`
      }));

    // Generate adaptive questions for weak areas
    const adaptiveQuestions = await Promise.all(
      weakAreas.map(async (area) => ({
        topic: area.topic,
        questions: await generateAdaptiveQuestions({
          topics: [area.topic],
          difficulty: Math.max(1, Math.min(3, Math.round((area.score / 100) * 5))),
          previousPerformance: performance
            .filter(p => p.topic === area.topic)
            .map(p => ({
              topic: p.topic,
              successRate: (p.correctAnswers / p.completedQuestions) * 100
            }))
        })
      }))
    );


    const nursingTopics = [
      "Fundamentals of Nursing",
      "Pharmacology",
      "Medical-Surgical Nursing",
      "Pediatric Nursing"
    ];

    const guide: StudyGuide = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: nursingTopics.map((domain: string, index: number) => ({
        id: domain.toLowerCase().replace(/\s+/g, '-'),
        name: domain,
        priority: focusAreas.includes(domain) ? 'high' : 'medium',
        completed: false,
        estimatedTime: timeAvailable ? Math.floor(timeAvailable / 4) : 30,
        learningObjectives: [
          `Understand key concepts in ${domain}`,
          "Apply knowledge in practice questions",
          "Review and reinforce learning"
        ]
      })),
      weakAreas: weakAreas, // Use the dynamically generated weak areas
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

// Placeholder for adaptive question generation
async function generateAdaptiveQuestions(params: any): Promise<any[]> {
  // Implement your AI-driven question generation logic here.
  // This is a placeholder, replace with your actual implementation.
  console.log("Generating adaptive questions with parameters:", params);
  return [
    { question: "Adaptive Question 1", answer: "Answer 1" },
    { question: "Adaptive Question 2", answer: "Answer 2" },
  ];
}

export default router;
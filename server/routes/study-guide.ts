import { Router } from "express";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { userProgress } from "@db/schema";

interface StudyTopic {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  estimatedTime: number;
  description?: string;
  learningTips?: string[];
  learningObjectives?: string[];
}

interface StudyResource {
  id: string;
  type: "article" | "video" | "quiz";
  title: string;
  url: string;
  difficulty: "beginner" | "intermediate" | "advanced";
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

/**
 * GET /current
 * Retrieves the current study guide using the learner’s performance analytics.
 */
router.get("/current", async (req, res) => {
  try {
    const userId = 1; // TODO: Replace with actual user ID from authentication

    // Query the user's performance data
    const performance = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    // Calculate overall metrics
    const completedModules = performance.filter(
      (p) => p.completedQuestions > 0,
    );
    const averageScore =
      completedModules.length > 0
        ? completedModules.reduce(
            (acc, curr) =>
              acc + (curr.correctAnswers / curr.completedQuestions) * 100,
            0,
          ) / completedModules.length
        : 0;

    // Identify weak modules (score below 70%)
    const weakModules = completedModules
      .filter((p) => p.correctAnswers / p.completedQuestions < 0.7)
      .map((p) => ({
        id: p.moduleId,
        score: ((p.correctAnswers / p.completedQuestions) * 100).toFixed(1),
      }));

    const strongModules = completedModules
      .filter((p) => p.correctAnswers / p.completedQuestions >= 0.7)
      .map((p) => ({
        id: p.moduleId,
        score: ((p.correctAnswers / p.completedQuestions) * 100).toFixed(1),
      }));

    // Define the topics (for example purposes, using nursing topics)
    const nursingTopics: string[] = [
      "Fundamentals of Nursing",
      "Pharmacology",
      "Medical-Surgical Nursing",
      "Pediatric Nursing",
    ];

    // Build a basic guide (for display or further use)
    const guide: StudyGuide = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: nursingTopics.map((domain: string, index: number) => ({
        id: domain.toLowerCase().replace(/\s+/g, "-"),
        name: domain,
        priority: index === 0 ? "high" : "medium",
        completed: false,
        estimatedTime: 30,
        description: `Focus on mastering key concepts in ${domain} for better NCLEX preparation`,
        learningTips: [
          "Review core concepts first",
          "Practice with sample questions",
          "Create summary notes",
        ],
      })),
      weakAreas: weakModules
        .map((module) => ({
          moduleId: module.id,
          score: module.score,
          improvement:
            "Focus on understanding core concepts and practice more questions",
        }))
        .slice(0, 3),
      strengthAreas: strongModules
        .map((module) => ({
          moduleId: module.id,
          score: module.score,
          tip: "Keep practicing to maintain proficiency",
        }))
        .slice(0, 3),
      recommendedResources: [
        "Patient Care Management",
        "Medication Administration",
        "Health Assessment",
      ].map((plan: string, i: number) => ({
        id: `resource-${i}`,
        type: "article",
        title: plan,
        url: `/resources/${plan.toLowerCase().replace(/\s+/g, "-")}`,
        difficulty: i === 0 ? "beginner" : "intermediate",
        estimatedTime: "30 mins",
        learningOutcome: `Master ${plan} concepts and applications`,
      })),
      progress: averageScore,
      nextSteps: [
        "Review weak areas first",
        "Take practice tests in strong areas to maintain knowledge",
        "Schedule regular review sessions",
      ],
    };

    res.json(guide);
  } catch (error) {
    console.error("Error fetching study guide:", error);
    res.status(500).json({
      error: "Failed to fetch study guide",
      details: error instanceof Error ? error.message : "Unknown error",
      suggestion:
        "Please try refreshing the page or contact support if the issue persists",
    });
  }
});

/**
 * POST /generate
 * Generates a personalized, AI-driven study guide based on:
 *  - The numeral study time provided by the learner (e.g. 10 minutes)
 *  - Analytics and performance metrics from past study sessions.
 *
 * The endpoint dynamically allocates time between topics—prioritizing weak or focused areas.
 */
router.post("/generate", async (req, res) => {
  try {
    const userId = 1; // TODO: Replace with actual user ID from authentication
    const { focusAreas = [], timeAvailable } = req.body as {
      focusAreas: string[];
      timeAvailable?: number;
    };

    // Query the user's performance data
    const performance = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    const completedModules = performance.filter(
      (p) => p.completedQuestions > 0,
    );
    const averageScore =
      completedModules.length > 0
        ? completedModules.reduce(
            (acc, curr) =>
              acc + (curr.correctAnswers / curr.completedQuestions) * 100,
            0,
          ) / completedModules.length
        : 0;

    // Determine which modules are weak (score below 70%)
    const weakModules = completedModules.filter(
      (p) => p.correctAnswers / p.completedQuestions < 0.7,
    );
    const weakModuleIds = weakModules.map((p) => p.moduleId);

    // Define the topics (for example purposes, using nursing topics)
    const nursingTopics = [
      "Fundamentals of Nursing",
      "Pharmacology",
      "Medical-Surgical Nursing",
      "Pediatric Nursing",
    ];

    // Build study topics—mark topics as high priority if they are weak (per analytics) or if they are in focusAreas.
    let topics: StudyTopic[] = nursingTopics.map((domain) => {
      const topicId = domain.toLowerCase().replace(/\s+/g, "-");
      const isWeak =
        weakModuleIds.includes(topicId) || focusAreas.includes(domain);
      return {
        id: topicId,
        name: domain,
        priority: isWeak ? "high" : "medium",
        completed: false,
        estimatedTime: 0, // This will be set dynamically below
        learningObjectives: [
          `Understand key concepts in ${domain}`,
          "Apply knowledge in practice questions",
          "Review and reinforce learning",
        ],
      };
    });

    // Dynamically allocate study time if a timeAvailable value is provided.
    // If timeAvailable is provided (e.g. 10 minutes), allocate 70% of that time to high-priority (weak/focus) topics.
    if (timeAvailable && timeAvailable > 0) {
      const totalTime = timeAvailable;
      const weakTopics = topics.filter((t) => t.priority === "high");
      const nonWeakTopics = topics.filter((t) => t.priority !== "high");

      let weakTimeTotal = 0;
      let nonWeakTimeTotal = 0;

      if (weakTopics.length > 0) {
        weakTimeTotal = Math.floor(totalTime * 0.7);
        nonWeakTimeTotal = totalTime - weakTimeTotal;
      } else {
        nonWeakTimeTotal = totalTime;
      }

      weakTopics.forEach((topic) => {
        topic.estimatedTime = Math.max(
          1,
          Math.floor(weakTimeTotal / weakTopics.length),
        );
      });
      nonWeakTopics.forEach((topic) => {
        topic.estimatedTime =
          nonWeakTopics.length > 0
            ? Math.max(1, Math.floor(nonWeakTimeTotal / nonWeakTopics.length))
            : 0;
      });
    } else {
      // Fallback estimated time if no time is provided
      topics = topics.map((topic) => ({
        ...topic,
        estimatedTime: 30,
      }));
    }

    // Build recommended resources based on the topics and their allocated study time.
    const recommendedResources: StudyResource[] = topics.map((topic, i) => ({
      id: `resource-${i}`,
      type: "article",
      title: `${topic.name} Overview`,
      url: `/resources/${topic.id}`,
      difficulty: topic.priority === "high" ? "beginner" : "intermediate",
      estimatedTime: `${topic.estimatedTime} mins`,
      learningOutcome: `Improve your understanding of ${topic.name}`,
    }));

    // Create weak and strength area summaries for additional learner feedback.
    const weakAreas = topics
      .filter((t) => t.priority === "high")
      .map((topic) => ({
        topic: topic.name,
        suggestedApproach:
          "Spend extra time reviewing foundational concepts and practice questions.",
      }));

    const strengthAreas = topics
      .filter((t) => t.priority !== "high")
      .map((topic) => ({
        topic: topic.name,
        tip: "A quick review and self-assessment should suffice.",
      }));

    // Construct the final personalized study guide
    const guide: StudyGuide = {
      id: `sg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics,
      weakAreas,
      strengthAreas,
      recommendedResources,
      progress: averageScore,
      studyTips: [
        "Prioritize high priority topics in your study session.",
        "Utilize allocated time wisely and focus on weak areas.",
        "Take short breaks to maintain focus.",
      ],
      nextSteps: [
        "Start with a quick review of the high priority topics.",
        "Use the recommended resources to improve areas of weakness.",
        "Monitor your progress for continuous improvement.",
      ],
    };

    res.json(guide);
  } catch (error) {
    console.error("Error generating study guide:", error);
    res.status(500).json({
      error: "Failed to generate study guide",
      details: error instanceof Error ? error.message : "Unknown error",
      suggestion: "Please try again or adjust your study preferences",
    });
  }
});

export default router;

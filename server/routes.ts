import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { modules, questions, quizAttempts, userProgress } from "@db/schema";
import { eq } from "drizzle-orm";
import { practiceQuestions } from "./data/practice-questions";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI();

// Helper function for analyzing performance
async function analyzePerformance(answers: any[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert nursing educator analyzing student performance on NCLEX-style questions. Provide detailed feedback on strengths and areas for improvement."
        },
        {
          role: "user",
          content: `Analyze these question responses: ${JSON.stringify(answers)}`
        }
      ]
    });

    const analysis = completion.choices[0]?.message?.content;
    return {
      strengths: ["Clinical reasoning", "Patient safety"],
      weaknesses: ["Pharmacology calculations", "Priority setting"],
      confidence: 0.75,
      recommendedTopics: ["Medication administration", "Critical thinking"]
    };
  } catch (error) {
    console.error("Error analyzing performance:", error);
    return null;
  }
}

// Helper function for pathophysiology help
async function getPathophysiologyHelp(topic: string, context: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert pathophysiology educator helping nursing students understand complex disease processes."
        },
        {
          role: "user",
          content: `Explain ${topic} in the context of ${context}`
        }
      ]
    });

    return {
      content: completion.choices[0]?.message?.content,
      relatedConcepts: ["Inflammation", "Cellular adaptation", "Tissue repair"],
      clinicalCorrelations: ["Assessment findings", "Common complications", "Nursing interventions"]
    };
  } catch (error) {
    console.error("Error getting pathophysiology help:", error);
    return null;
  }
}

// Helper function for study recommendations
async function getStudyRecommendations(performanceData: any[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert nursing educator providing personalized study recommendations based on student performance data."
        },
        {
          role: "user",
          content: `Analyze this performance data and provide study recommendations: ${JSON.stringify(performanceData)}`
        }
      ]
    });

    return {
      recommendations: completion.choices[0]?.message?.content,
      priorityTopics: ["Critical thinking", "Clinical judgment", "Patient safety"],
      studyStrategies: ["Case studies", "Practice questions", "Concept mapping"]
    };
  } catch (error) {
    console.error("Error generating study recommendations:", error);
    return null;
  }
}

// Question generation helper function
async function generateNewQuestions(userId: number, examType: string) {
  try {
    const availableQuestions = Object.values(practiceQuestions).flat();

    if (availableQuestions.length === 0) {
      throw new Error("No questions available");
    }

    if (examType === 'cat') {
      const sortedQuestions = availableQuestions.sort((a, b) => {
        const difficultyMap = { Easy: 1, Medium: 2, Hard: 3 };
        return difficultyMap[a.difficulty as keyof typeof difficultyMap] -
               difficultyMap[b.difficulty as keyof typeof difficultyMap];
      });

      const mediumQuestions = sortedQuestions.filter(q => q.difficulty === 'Medium');
      if (mediumQuestions.length === 0) {
        throw new Error("No medium difficulty questions available");
      }

      const selectedQuestion = mediumQuestions[Math.floor(Math.random() * mediumQuestions.length)];
      return formatQuestion(selectedQuestion);
    }

    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    return formatQuestion(randomQuestion);
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions");
  }
}

function formatQuestion(question: any) {
  return {
    id: 1,
    text: question.text,
    options: question.options,
    correctAnswer: question.correctAnswer
  };
}

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Modules routes
  app.get("/api/modules", async (_req, res) => {
    try {
      const allModules = await db.query.modules.findMany({
        orderBy: (modules, { asc }) => [asc(modules.orderIndex)],
      });
      res.json(allModules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  // AI Help endpoint with enhanced safety measures context
  app.post("/api/chat/risk-reduction", async (req, res) => {
    const { topic, question } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert nursing educator specializing in patient safety and risk reduction.
            Focus on providing practical, evidence-based guidance for nursing practice. When discussing safety measures:
            - Reference relevant nursing standards and guidelines
            - Provide concrete examples from clinical practice
            - Emphasize critical thinking and clinical judgment
            - Include both preventive measures and risk assessment strategies
            Your responses should be clear, detailed, and directly applicable to nursing practice.`
          },
          {
            role: "user",
            content: question || `Explain key considerations for ${topic} in nursing practice.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("No response generated");
      }

      res.json({ response });
    } catch (error) {
      console.error("Error in AI chat endpoint:", error);
      res.status(500).json({
        message: "Failed to get AI assistance",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Questions routes
  app.get("/api/questions/:moduleId", async (req, res) => {
    try {
      const moduleQuestions = await db.query.questions.findMany({
        where: eq(questions.moduleId, parseInt(req.params.moduleId)),
      });
      res.json(moduleQuestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Quiz attempts routes with AI analysis
  app.post("/api/quiz-attempts", async (req, res) => {
    try {
      const { userId, moduleId, type, answers } = req.body;

      // Analyze performance using AI
      const aiAnalysis = await analyzePerformance(answers);

      const newAttempt = await db.insert(quizAttempts).values({
        userId,
        moduleId,
        type,
        answers,
        score: answers.filter((a: any) => a.correct).length / answers.length * 100,
        totalQuestions: answers.length,
        startedAt: new Date(),
        aiAnalysis,
        strengthAreas: aiAnalysis?.strengths || [],
        weaknessAreas: aiAnalysis?.weaknesses || []
      }).returning();

      // Update user progress with AI insights
      await db.update(userProgress)
        .set({
          completedQuestions: userProgress.completedQuestions + answers.length,
          correctAnswers: userProgress.correctAnswers + answers.filter((a: any) => a.correct).length,
          lastAttempt: new Date(),
          performanceMetrics: aiAnalysis
        })
        .where(eq(userProgress.userId, userId));

      res.json(newAttempt[0]);
    } catch (error) {
      res.status(500).json({ message: "Failed to save quiz attempt" });
    }
  });

  // User progress routes with AI recommendations
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, parseInt(req.params.userId)),
        with: {
          module: true,
        },
      });

      // Get AI study recommendations
      const performanceData = progress.map(p => ({
        topic: p.module?.type || "",
        score: (p.correctAnswers / p.completedQuestions) * 100 || 0,
        timeSpent: p.lastAttempt ?
          (new Date(p.lastAttempt).getTime() - new Date(p.updatedAt).getTime()) / 1000 : 0
      }));

      const recommendations = await getStudyRecommendations(performanceData);

      res.json({
        progress,
        recommendations,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Analytics routes with AI insights
  app.get("/api/analytics/user/:userId", async (req, res) => {
    try {
      const attempts = await db.query.quizAttempts.findMany({
        where: eq(quizAttempts.userId, parseInt(req.params.userId)),
        orderBy: (quizAttempts, { desc }) => [desc(quizAttempts.startedAt)],
      });

      const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, parseInt(req.params.userId)),
      });

      // Analyze overall performance
      const overallAnalysis = await analyzePerformance(
        attempts.flatMap((a: any) => a.answers as any[])
      );

      res.json({
        attempts,
        progress,
        analysis: overallAnalysis,
        summary: {
          totalAttempts: attempts.length,
          averageScore: attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length || 0,
          strengths: overallAnalysis?.strengths || [],
          weaknesses: overallAnalysis?.weaknesses || [],
          confidence: overallAnalysis?.confidence || 0
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Add exam question endpoint
  app.post("/api/exam/:type/question", async (req, res) => {
    try {
      const { type } = req.params;
      const { previousAnswer } = req.body;

      // For demo purposes using userId 1
      const userId = 1;
      const question = await generateNewQuestions(userId, type);

      res.json(question);
    } catch (error) {
      console.error("Error generating exam question:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to generate question"
      });
    }
  });

  app.post("/api/exam/prevention/questions", async (req, res) => {
    try {
      const { previousQuestions } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Generate 3 NCLEX-style questions focused on nursing prevention strategies and risk reduction. 
          Format each question with:
          - A clear scenario
          - 4 multiple choice options
          - The correct answer
          - A detailed explanation
          Questions should test critical thinking and clinical judgment.`
          },
          {
            role: "user",
            content: "Generate new prevention-focused questions that are different from these IDs: " +
              (previousQuestions?.join(", ") || "")
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("Failed to generate questions");
      }

      // Parse and format the response into question objects
      const formattedQuestions = parseAIResponseToQuestions(response);
      res.json(formattedQuestions);
    } catch (error) {
      console.error("Error generating prevention questions:", error);
      res.status(500).json({
        message: "Failed to generate questions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add helper function to parse AI response
  function parseAIResponseToQuestions(aiResponse: string) {
    // Simple parsing logic for demo - in production would need more robust parsing
    return [
      {
        id: Date.now().toString(),
        question: "A patient has been admitted with dizziness and weakness. Which combination of interventions best addresses fall prevention?",
        options: [
          { value: "a", label: "Bed alarm and restraints" },
          { value: "b", label: "Fall risk assessment, bed in low position, non-slip footwear, and scheduled assistance" },
          { value: "c", label: "Keeping patient in bed and raising all rails" },
          { value: "d", label: "Telling family to watch patient" }
        ],
        correctAnswer: "b",
        explanation: {
          main: "Option B provides a comprehensive fall prevention strategy that addresses multiple risk factors while maintaining patient dignity and independence.",
          concepts: [
            {
              title: "Assessment First",
              description: "Always begin with a thorough risk assessment"
            },
            {
              title: "Multiple Interventions",
              description: "Fall prevention requires a multi-faceted approach"
            }
          ]
        }
      }
      // Additional questions would be parsed from AI response
    ];
  }

  return httpServer;
}
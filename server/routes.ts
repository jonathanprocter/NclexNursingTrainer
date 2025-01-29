import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { modules, questions, quizAttempts, userProgress } from "@db/schema";
import { eq } from "drizzle-orm";
import { practiceQuestions } from "./data/practice-questions";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set in environment variables");
}

// Initialize OpenAI with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
      console.log("AI response generated successfully");

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

  // Add exam question endpoint with enhanced error handling
  app.post("/api/exam/prevention/questions", async (req, res) => {
    try {
      console.log('Received request for more prevention questions');
      const { previousQuestions } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Generate 3 NCLEX-style questions focused on nursing prevention strategies and risk reduction. 
            Each question should follow this JSON format:
            {
              "id": "unique_id",
              "question": "question text",
              "options": [
                { "value": "a", "label": "option text" },
                { "value": "b", "label": "option text" },
                { "value": "c", "label": "option text" },
                { "value": "d", "label": "option text" }
              ],
              "correctAnswer": "correct_option_value",
              "explanation": {
                "main": "main explanation text",
                "concepts": [
                  { "title": "concept title", "description": "concept description" },
                  { "title": "concept title", "description": "concept description" }
                ]
              }
            }`
          },
          {
            role: "user",
            content: "Generate new prevention-focused questions that are different from these IDs: " +
              (previousQuestions?.join(", ") || "")
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      console.log('Generated response from OpenAI');

      if (!response) {
        throw new Error("Failed to generate questions");
      }

      try {
        // Try to parse the response as JSON
        const questions = JSON.parse(response);
        console.log(`Successfully parsed ${Array.isArray(questions) ? questions.length : 1} questions`);
        res.json(Array.isArray(questions) ? questions : [questions]);
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        // If parsing fails, use the backup question generation
        const backupQuestions = generateBackupQuestions();
        res.json(backupQuestions);
      }
    } catch (error) {
      console.error("Error generating prevention questions:", error);
      res.status(500).json({
        message: "Failed to generate questions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  function generateBackupQuestions() {
    // Generating backup questions in case of API failure
    return [
      {
        id: `backup_${Date.now()}_1`,
        question: "Which nursing intervention best demonstrates proper infection control practices?",
        options: [
          { value: "a", label: "Performing hand hygiene before and after patient contact" },
          { value: "b", label: "Wearing the same gloves between patients" },
          { value: "c", label: "Reusing personal protective equipment" },
          { value: "d", label: "Using hand sanitizer without washing visibly soiled hands" }
        ],
        correctAnswer: "a",
        explanation: {
          main: "Hand hygiene is the most effective way to prevent the spread of infections.",
          concepts: [
            {
              title: "Basic Prevention",
              description: "Hand hygiene is fundamental to infection control"
            },
            {
              title: "Evidence-Based Practice",
              description: "CDC guidelines emphasize hand hygiene as primary prevention"
            }
          ]
        }
      },
      {
        id: `backup_${Date.now()}_2`,
        question: "What is the most important step in preventing medication errors?",
        options: [
          { value: "a", label: "Checking the five rights once" },
          { value: "b", label: "Verifying the five rights multiple times" },
          { value: "c", label: "Relying on memory for regular medications" },
          { value: "d", label: "Having another nurse give all medications" }
        ],
        correctAnswer: "b",
        explanation: {
          main: "Multiple verification of the five rights ensures medication safety.",
          concepts: [
            {
              title: "Safety Protocol",
              description: "Multiple checks reduce error probability"
            },
            {
              title: "Critical Thinking",
              description: "Each verification step requires focused attention"
            }
          ]
        }
      }
    ];
  }

  return httpServer;
}
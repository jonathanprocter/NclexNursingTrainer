import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { modules, questions, quizAttempts, userProgress } from "@db/schema";
import { eq } from "drizzle-orm";
import { analyzePerformance, generateAdaptiveQuestions, getStudyRecommendations, getPharmacologyHelp } from "../client/src/lib/ai-services";
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Pre-integrated case studies with progressive complexity
const preIntegratedCases = [
  {
    id: "case1",
    title: "Basic Heart Failure Assessment",
    description: "Initial case focusing on fundamental assessment skills",
    difficulty: "beginner",
    type: "cardiology",
    prerequisites: [],
    content: `
      <h3>Patient Information</h3>
      <p>73-year-old female with history of CHF (EF 35%), diabetes, and hypertension presents with increasing dyspnea and peripheral edema over 5 days.</p>

      <h3>Current Presentation</h3>
      <ul>
        <li>Vitals: BP 158/92, HR 92, RR 24, O2 sat 91% on RA</li>
        <li>Bilateral crackles to mid-lung fields</li>
        <li>3+ peripheral edema</li>
        <li>Recent medication non-compliance due to cost</li>
      </ul>

      <h3>Laboratory Data</h3>
      <ul>
        <li>BNP: 1250 pg/mL</li>
        <li>Creatinine: 1.8 mg/dL (baseline 1.2)</li>
        <li>Potassium: 4.8 mEq/L</li>
        <li>Troponin: Negative</li>
      </ul>
    `,
    questions: [
      {
        type: "assessment",
        question: "What are the key assessment findings that indicate heart failure exacerbation?",
        options: [
          {
            text: "Elevated blood pressure and tachycardia only",
            correct: false,
            explanation: "While these are concerning signs, they alone are not sufficient to indicate heart failure exacerbation.",
            topics: ["Vital Signs", "Cardiovascular Assessment"]
          },
          {
            text: "Bilateral crackles, peripheral edema, and increased BNP",
            correct: true,
            explanation: "These findings together strongly indicate fluid overload and heart failure exacerbation. The bilateral crackles suggest pulmonary edema, peripheral edema indicates systemic fluid retention, and elevated BNP is a specific marker for heart failure.",
            topics: ["Pulmonary Assessment", "Cardiovascular Assessment", "Lab Values", "Heart Failure"]
          },
          {
            text: "Elevated creatinine and medication non-compliance",
            correct: false,
            explanation: "While medication non-compliance may contribute to exacerbation, and elevated creatinine suggests renal involvement, these are not the primary indicators of heart failure exacerbation.",
            topics: ["Medication Management", "Renal Function", "Patient Compliance"]
          },
          {
            text: "Negative troponin and normal potassium",
            correct: false,
            explanation: "These lab values, while important for ruling out acute cardiac injury, do not specifically indicate heart failure exacerbation.",
            topics: ["Lab Values", "Differential Diagnosis"]
          }
        ],
        keyTopics: ["Heart Failure Pathophysiology", "Clinical Assessment", "Lab Interpretation"]
      },
      {
        type: "analysis",
        question: "Which combination of findings best explains the patient's current clinical status?",
        options: [
          {
            text: "Medication non-compliance → fluid retention → increased preload → decreased cardiac output",
            correct: true,
            explanation: "This sequence correctly shows how medication non-compliance leads to the current exacerbation through a cascade of physiological changes, ultimately resulting in decreased cardiac output.",
            topics: ["Pathophysiology", "Medication Effects", "Cardiac Function"]
          },
          {
            text: "Hypertension → increased afterload → renal failure → edema",
            correct: false,
            explanation: "While hypertension can contribute to heart failure, this sequence doesn't fully explain the acute exacerbation in this case.",
            topics: ["Hypertension", "Renal Function", "Fluid Balance"]
          },
          {
            text: "Diabetes → peripheral neuropathy → decreased mobility → edema",
            correct: false,
            explanation: "Although diabetes is a comorbidity, this sequence doesn't explain the acute heart failure exacerbation.",
            topics: ["Diabetes", "Comorbidities", "Mobility"]
          },
          {
            text: "Elevated BNP → fluid overload → increased blood pressure",
            correct: false,
            explanation: "This reverses the cause and effect relationship; BNP elevation is a result of fluid overload, not its cause.",
            topics: ["Lab Values", "Pathophysiology", "Clinical Correlation"]
          }
        ],
        keyTopics: ["Heart Failure Pathophysiology", "Medication Management", "Clinical Reasoning"]
      }
    ],
    nextCaseHints: ["Consider how comorbidities affect heart failure management"]
  }
];

export function registerRoutes(app: Express): Server {
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

  // Add endpoint to get pre-integrated cases
  app.get("/api/pre-integrated-cases", (_req, res) => {
    res.json(preIntegratedCases);
  });

  // Add endpoint to get completed cases
  app.get("/api/user/completed-cases", async (_req, res) => {
    try {
      // For now, return an empty array as we haven't implemented user authentication yet
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completed cases" });
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

  // AI-powered adaptive questions
  app.post("/api/questions/adaptive", async (req, res) => {
    try {
      const { topics, difficulty, userId } = req.body;

      // Get user's previous performance
      const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, parseInt(userId)),
      });

      const previousPerformance = progress.map(p => ({
        topic: p.moduleId.toString(),
        successRate: p.correctAnswers / p.completedQuestions || 0
      }));

      const adaptiveQuestions = await generateAdaptiveQuestions({
        topics,
        difficulty,
        previousPerformance
      });

      res.json(adaptiveQuestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate adaptive questions" });
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
        score: answers.filter(a => a.correct).length / answers.length * 100,
        totalQuestions: answers.length,
        startedAt: new Date(),
        aiAnalysis,
        strengthAreas: aiAnalysis.strengths,
        weaknessAreas: aiAnalysis.weaknesses
      }).returning();

      // Update user progress with AI insights
      await db.update(userProgress)
        .set({
          completedQuestions: userProgress.completedQuestions + answers.length,
          correctAnswers: userProgress.correctAnswers + answers.filter(a => a.correct).length,
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

      // Get AI study recommendations based on progress
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
        attempts.flatMap(a => a.answers as any[])
      );

      res.json({
        attempts,
        progress,
        analysis: overallAnalysis,
        summary: {
          totalAttempts: attempts.length,
          averageScore: attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length || 0,
          strengths: overallAnalysis.strengths,
          weaknesses: overallAnalysis.weaknesses,
          confidence: overallAnalysis.confidence
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // AI Help endpoint
  app.post("/api/ai-help", async (req, res) => {
    try {
      const { section, context } = req.body;
      const help = await getPharmacologyHelp(section, context);
      res.json(help);
    } catch (error) {
      res.status(500).json({ message: "Failed to get AI help" });
    }
  });

  // Generate case endpoint (Simplified from original)
  app.post("/api/generate-case", async (req, res) => {
    try {
      const { caseId } = req.body;

      if (caseId) {
        // Return the specific pre-integrated case if requested
        const requestedCase = preIntegratedCases.find(c => c.id === caseId);
        if (requestedCase) {
          return res.json(requestedCase);
        }
      }

      // If no specific case requested or not found, return the first case
      return res.json(preIntegratedCases[0]);
    } catch (error) {
      console.error("Case generation error:", error);
      res.status(500).json({ message: "Failed to generate case study" });
    }
  });


  // Track case completion and progress
  app.post("/api/case-completion", async (req, res) => {
    try {
      const { userId, caseId, answers } = req.body;

      // Analyze answers and provide feedback
      const analysis = await analyzePerformance(answers);

      // Update user progress
      await db.update(userProgress)
        .set({
          completedCases: db.fn.array_append("completedCases", caseId),
          performanceMetrics: analysis
        })
        .where(eq(userProgress.userId, userId));

      res.json({
        success: true,
        analysis,
        nextSteps: preIntegratedCases.find(c => c.id === caseId)?.nextCaseHints || []
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to record case completion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
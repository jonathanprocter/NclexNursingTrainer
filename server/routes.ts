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

// Pre-integrated case studies
const preIntegratedCases = [
  {
    id: "case1",
    title: "Complex Heart Failure Management",
    description: "Elderly patient presenting with acute decompensated heart failure and multiple comorbidities.",
    difficulty: "intermediate",
    type: "cardiology",
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
    `
  },
  {
    id: "case2",
    title: "Sepsis with Multiorgan Dysfunction",
    description: "Young adult presenting with severe sepsis and developing organ dysfunction.",
    difficulty: "advanced",
    type: "critical_care",
    content: `
      <h3>Patient Information</h3>
      <p>28-year-old male presents with fever, confusion, and hypotension. History of recent dental procedure.</p>

      <h3>Current Presentation</h3>
      <ul>
        <li>Vitals: BP 82/45, HR 125, RR 28, Temp 39.8°C</li>
        <li>Glasgow Coma Scale: 13</li>
        <li>Delayed capillary refill</li>
        <li>Mottled skin on extremities</li>
      </ul>

      <h3>Laboratory Data</h3>
      <ul>
        <li>WBC: 22,000 with 18% bands</li>
        <li>Lactate: 4.8 mmol/L</li>
        <li>Creatinine: 2.1 mg/dL</li>
        <li>Platelets: 95,000</li>
      </ul>
    `
  },
  {
    id: "case3",
    title: "Acute Respiratory Distress",
    description: "Middle-aged patient with rapidly progressing respiratory symptoms.",
    difficulty: "intermediate",
    type: "pulmonology",
    content: `
      <h3>Patient Information</h3>
      <p>45-year-old female with asthma presents with acute onset of severe dyspnea and chest tightness.</p>

      <h3>Current Presentation</h3>
      <ul>
        <li>Vitals: BP 142/88, HR 118, RR 32, O2 sat 88% on RA</li>
        <li>Using accessory muscles</li>
        <li>Diffuse wheezing with prolonged expiration</li>
        <li>Unable to speak in full sentences</li>
      </ul>

      <h3>Laboratory Data</h3>
      <ul>
        <li>ABG: pH 7.32, pCO2 48, pO2 58</li>
        <li>Peak flow: 35% of personal best</li>
        <li>Chest X-ray: Hyperinflation</li>
      </ul>
    `
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

  // Enhanced case generation endpoint
  app.post("/api/generate-case", async (req, res) => {
    try {
      // First, return a pre-integrated case if available and not seen
      const seenCases = req.body.seenCases || [];
      const availablePreIntegrated = preIntegratedCases.filter(c => !seenCases.includes(c.id));

      if (availablePreIntegrated.length > 0) {
        const randomCase = availablePreIntegrated[Math.floor(Math.random() * availablePreIntegrated.length)];
        return res.json(randomCase);
      }

      // If all pre-integrated cases have been seen, generate a new one using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a medical educator generating detailed clinical case studies for nursing students. Include patient history, current presentation, vital signs, and relevant laboratory data."
          },
          {
            role: "user",
            content: "Generate a detailed clinical case study with realistic vital signs and lab values. Include patient presentation, history, and current status."
          }
        ],
        max_tokens: 1000,
      });

      const generatedContent = completion.choices[0]?.message?.content;
      if (!generatedContent) {
        throw new Error("Failed to generate case content");
      }

      // Format the generated case
      const generatedCase = {
        id: `gen_${Date.now()}`,
        title: "Complex Clinical Scenario",
        description: "AI-generated clinical case for advanced practice",
        difficulty: "advanced",
        type: "generated",
        content: generatedContent
      };

      res.json(generatedCase);
    } catch (error) {
      console.error("Case generation error:", error);
      res.status(500).json({ message: "Failed to generate case study" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
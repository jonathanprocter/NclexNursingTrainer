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
        explanation: "Focus on identifying cardinal symptoms and relating them to pathophysiology."
      },
      {
        type: "analysis",
        question: "How do the laboratory values support your clinical findings?",
        explanation: "Connect laboratory data with clinical presentation."
      },
      {
        type: "planning",
        question: "What immediate nursing interventions are priorities for this patient?",
        explanation: "Consider both immediate safety needs and underlying causes."
      }
    ],
    nextCaseHints: ["Consider how comorbidities affect heart failure management"]
  },
  {
    id: "case2",
    title: "Complex Heart Failure Management",
    description: "Building on basic heart failure concepts with comorbidity management",
    difficulty: "intermediate",
    type: "cardiology",
    prerequisites: ["case1"],
    content: `
      <h3>Patient Information</h3>
      <p>Same patient returns after 3 months with worsening symptoms despite medication adjustment. New onset atrial fibrillation noted.</p>

      <h3>Current Presentation</h3>
      <ul>
        <li>Vitals: BP 145/88, HR 110 irregular, RR 26, O2 sat 89% on RA</li>
        <li>Increased work of breathing</li>
        <li>4+ peripheral edema</li>
        <li>New onset confusion</li>
      </ul>

      <h3>Laboratory Data</h3>
      <ul>
        <li>BNP: 2200 pg/mL</li>
        <li>Creatinine: 2.1 mg/dL</li>
        <li>Potassium: 5.2 mEq/L</li>
        <li>INR: 1.1</li>
      </ul>
    `,
    questions: [
      {
        type: "analysis",
        question: "How has the patient's condition changed from the previous presentation?",
        explanation: "Compare current findings with previous case to identify deterioration patterns."
      },
      {
        type: "synthesis",
        question: "What are the potential interactions between the patient's heart failure and new onset atrial fibrillation?",
        explanation: "Analyze the relationship between multiple cardiac conditions."
      },
      {
        type: "evaluation",
        question: "Develop a comprehensive care plan that addresses both acute and chronic management needs.",
        explanation: "Integrate multiple aspects of care into a cohesive plan."
      }
    ],
    nextCaseHints: ["Consider advanced heart failure management strategies"]
  },
  {
    id: "case3",
    title: "Advanced Heart Failure Complications",
    description: "Complex case involving multiple system complications",
    difficulty: "advanced",
    type: "cardiology",
    prerequisites: ["case1", "case2"],
    content: `
      <h3>Patient Information</h3>
      <p>Patient now presents with signs of cardiorenal syndrome and requiring advanced heart failure management consideration.</p>

      <h3>Current Presentation</h3>
      <ul>
        <li>Vitals: BP 132/84, HR 96 irregular, RR 28, O2 sat 87% on 2L NC</li>
        <li>Bilateral pleural effusions</li>
        <li>Hepatomegaly</li>
        <li>Decreased urine output</li>
      </ul>

      <h3>Laboratory Data</h3>
      <ul>
        <li>BNP: 3500 pg/mL</li>
        <li>Creatinine: 2.8 mg/dL</li>
        <li>GFR: 25 mL/min</li>
        <li>Liver function tests: elevated</li>
      </ul>
    `,
    questions: [
      {
        type: "synthesis",
        question: "Analyze the pathophysiological relationships between cardiac and renal dysfunction in this patient.",
        explanation: "Demonstrate understanding of complex system interactions."
      },
      {
        type: "evaluation",
        question: "What factors would you consider in determining if this patient needs advanced heart failure therapies?",
        explanation: "Evaluate criteria for advanced interventions."
      },
      {
        type: "creation",
        question: "Develop a comprehensive transition of care plan for this patient.",
        explanation: "Create a detailed plan incorporating all aspects of care."
      }
    ],
    nextCaseHints: ["Consider palliative care integration in advanced heart failure"]
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
      const { userId, completedCases = [] } = req.body;

      // Find the next appropriate case based on user's progress
      const availableCases = preIntegratedCases.filter(c => {
        // Check if user meets prerequisites
        if (c.prerequisites.length === 0) return true;
        return c.prerequisites.every(prereq => completedCases.includes(prereq));
      });

      if (availableCases.length > 0) {
        // Return the most appropriate case based on difficulty progression
        const nextCase = availableCases.find(c => !completedCases.includes(c.id)) || availableCases[0];
        return res.json(nextCase);
      }

      // If all pre-integrated cases completed, generate a new advanced case
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a medical educator generating advanced clinical case studies for nursing students who have completed fundamental cases. Include:
              - Complex patient scenarios with multiple comorbidities
              - Detailed vital signs and laboratory values
              - Progressive complexity building on previous knowledge
              - Integration of multiple system pathophysiology
              - Structured analysis questions that promote critical thinking`
          },
          {
            role: "user",
            content: "Generate an advanced clinical case study with follow-up questions that test deeper understanding and synthesis skills."
          }
        ],
        max_tokens: 1500,
      });

      const generatedContent = completion.choices[0]?.message?.content;
      if (!generatedContent) {
        throw new Error("Failed to generate case content");
      }

      // Format the generated case with structured questions
      const generatedCase = {
        id: `gen_${Date.now()}`,
        title: "Advanced Clinical Integration",
        description: "AI-generated complex case for advanced practice",
        difficulty: "advanced",
        type: "integrated",
        prerequisites: preIntegratedCases.map(c => c.id),
        content: generatedContent,
        questions: [
          {
            type: "synthesis",
            question: "Analyze the complex interactions between multiple system pathologies in this case.",
            explanation: "Demonstrate advanced understanding of system interactions."
          },
          {
            type: "evaluation",
            question: "Evaluate the effectiveness of current interventions and propose evidence-based alternatives.",
            explanation: "Show critical thinking in treatment evaluation."
          },
          {
            type: "creation",
            question: "Develop a comprehensive care plan that addresses all identified issues.",
            explanation: "Create an integrated care approach."
          }
        ]
      };

      res.json(generatedCase);
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
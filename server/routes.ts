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

// Practice exercise templates
const practiceExercises = {
  pattern: [
    {
      id: "pattern-1",
      type: "pattern",
      title: "Vital Signs Pattern Recognition",
      description: "Identify patterns in vital sign changes that indicate clinical deterioration",
      content: "Review the following vital sign trends over 24 hours and identify concerning patterns:\n\nBP: 120/80 → 110/70 → 90/60\nHR: 80 → 95 → 110\nRR: 16 → 20 → 24\nTemp: 37.0°C → 37.5°C → 38.2°C",
      options: ["Early signs of sepsis", "Medication side effect", "Volume depletion", "Anxiety response"]
    },
    // Add more pattern exercises
  ],
  hypothesis: [
    {
      id: "hypothesis-1",
      type: "hypothesis",
      title: "Clinical Hypothesis Formation",
      description: "Develop and test clinical hypotheses based on patient presentation",
      content: "Patient presents with sudden onset chest pain, shortness of breath, and anxiety. Recent long flight from Europe. No cardiac history.",
      options: ["Pulmonary embolism", "Acute coronary syndrome", "Panic attack", "Pneumothorax"]
    },
    // Add more hypothesis exercises
  ],
  decision: [
    {
      id: "decision-1",
      type: "decision",
      title: "Clinical Decision Making",
      description: "Make evidence-based clinical decisions in complex scenarios",
      content: "elderly patient with UTI symptoms shows signs of confusion. History of chronic kidney disease. Current medications include ACE inhibitor and diuretic.",
      options: ["Start empiric antibiotics", "Adjust current medications", "Order additional tests", "Immediate hospitalization"]
    },
    // Add more decision exercises
  ],
  documentation: [
    {
      id: "documentation-1",
      type: "documentation",
      title: "Clinical Documentation Practice",
      description: "Practice clear and accurate clinical documentation",
      content: "Document your assessment and plan for a patient admitted with diabetic ketoacidosis, including relevant lab values, current treatment, and monitoring parameters.",
    },
    // Add more documentation exercises
  ]
};

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
      },
      {
        type: "planning",
        question: "What is the most appropriate initial nursing intervention for this patient?",
        options: [
          {
            text: "Administer scheduled medications and document vital signs",
            correct: false,
            explanation: "While medication administration is important, the patient's current condition requires more immediate interventions to address respiratory distress.",
            topics: ["Medication Administration", "Documentation"]
          },
          {
            text: "Position patient in high Fowler's position and administer oxygen therapy",
            correct: true,
            explanation: "This intervention directly addresses the patient's respiratory distress by optimizing breathing mechanics and oxygenation, which are immediate priorities.",
            topics: ["Respiratory Management", "Patient Positioning", "Oxygen Therapy"]
          },
          {
            text: "Draw blood for additional laboratory tests",
            correct: false,
            explanation: "While additional testing might be needed, it's not the priority when the patient is experiencing respiratory distress.",
            topics: ["Laboratory Testing", "Clinical Priority Setting"]
          },
          {
            text: "Begin patient education about medication compliance",
            correct: false,
            explanation: "Education is important but should be delayed until the acute symptoms are stabilized.",
            topics: ["Patient Education", "Medication Compliance"]
          }
        ],
        keyTopics: ["Clinical Prioritization", "Acute Intervention", "Respiratory Support"]
      },
      {
        type: "evaluation",
        question: "Which assessment finding would best indicate that the interventions are effective?",
        options: [
          {
            text: "Decrease in blood pressure to 130/80",
            correct: false,
            explanation: "While improved, blood pressure alone is not the best indicator of successful heart failure management.",
            topics: ["Vital Signs", "Treatment Response"]
          },
          {
            text: "Improved oxygen saturation and decreased work of breathing",
            correct: true,
            explanation: "These changes directly reflect improved gas exchange and reduced fluid overload, indicating effective intervention.",
            topics: ["Respiratory Assessment", "Treatment Effectiveness", "Clinical Monitoring"]
          },
          {
            text: "Patient reports feeling better",
            correct: false,
            explanation: "Subjective improvement is important but should be corroborated with objective findings.",
            topics: ["Patient Assessment", "Subjective Data"]
          },
          {
            text: "Reduced peripheral edema",
            correct: false,
            explanation: "While important, peripheral edema takes longer to resolve and is not the best immediate indicator of improvement.",
            topics: ["Edema Assessment", "Treatment Timeline"]
          }
        ],
        keyTopics: ["Treatment Evaluation", "Clinical Monitoring", "Outcome Assessment"]
      },
      {
        type: "synthesis",
        question: "What is the most important long-term management strategy for this patient?",
        options: [
          {
            text: "Daily weight monitoring and strict fluid restriction",
            correct: false,
            explanation: "While important, these alone don't address the underlying compliance issues.",
            topics: ["Weight Monitoring", "Fluid Management"]
          },
          {
            text: "Comprehensive medication compliance plan with cost consideration",
            correct: true,
            explanation: "This addresses the root cause of the exacerbation by developing a sustainable plan that considers the patient's financial barriers to compliance.",
            topics: ["Medication Compliance", "Financial Planning", "Care Coordination"]
          },
          {
            text: "Weekly clinic visits for vital sign monitoring",
            correct: false,
            explanation: "Regular monitoring is important but doesn't address the fundamental compliance issue.",
            topics: ["Follow-up Care", "Vital Signs Monitoring"]
          },
          {
            text: "Referral to cardiac rehabilitation",
            correct: false,
            explanation: "While beneficial, rehabilitation alone doesn't address the primary issue of medication non-compliance due to cost.",
            topics: ["Cardiac Rehabilitation", "Exercise Tolerance"]
          }
        ],
        keyTopics: ["Long-term Management", "Patient Education", "Resource Management"]
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

  // Add new route for generating practice exercises
  app.post("/api/generate-exercise", async (req, res) => {
    try {
      const { type } = req.body;

      if (!type || !practiceExercises[type as keyof typeof practiceExercises]) {
        return res.status(400).json({ message: "Invalid exercise type" });
      }

      const exercises = practiceExercises[type as keyof typeof practiceExercises];
      const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];

      res.json(randomExercise);
    } catch (error) {
      console.error("Exercise generation error:", error);
      res.status(500).json({ message: "Failed to generate exercise" });
    }
  });

  // Add route for submitting exercises
  app.post("/api/submit-exercise", async (req, res) => {
    try {
      const { exerciseId, type, response } = req.body;

      // Here we would typically validate the response and provide feedback
      // For now, we'll just acknowledge the submission
      res.json({
        success: true,
        feedback: "Exercise submitted successfully. Keep practicing to improve your clinical reasoning skills!"
      });
    } catch (error) {
      console.error("Exercise submission error:", error);
      res.status(500).json({ message: "Failed to submit exercise" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from 'ws';
import { db } from "./db/index.js";
import { eq, desc } from "drizzle-orm";
import studyGuideRouter from './routes/study-guide.js';
import OpenAI from "openai";
import { studyBuddyChats, modules, questions, quizAttempts, userProgress, type QuizAttempt } from "./db/schema.js";

// Type definitions for practice questions
interface QuestionOption {
  id: string;
  text: string;
}

interface PracticeQuestion {
  id: string;
  text: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
}

interface PerformanceData {
  topic: string;
  score: number;
  timeSpent: number;
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper functions
function difficultyToNumber(difficulty: string): number {
  const difficultyMap: Record<string, number> = {
    'Easy': 1,
    'Medium': 2,
    'Hard': 3
  };
  return difficultyMap[difficulty] || 2;
}

function generateBackupQuestions(): PracticeQuestion[] {
  return [
    {
      id: `backup_${Date.now()}_1`,
      text: "What is the first step in the nursing process?",
      options: [
        { id: "a", text: "Assessment" },
        { id: "b", text: "Planning" },
        { id: "c", text: "Implementation" },
        { id: "d", text: "Evaluation" }
      ],
      correctAnswer: "a",
      explanation: "Assessment is always the first step in the nursing process.",
      category: "Nursing Process",
      difficulty: "Easy"
    }
  ];
}

async function generateNewQuestions(userId: number, examType: string): Promise<PracticeQuestion> {
  try {
    const backupQuestion = generateBackupQuestions()[0];
    return backupQuestion;
  } catch (error) {
    console.error("Error generating questions:", error);
    return generateBackupQuestions()[0];
  }
}

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Initialize WebSocket with proper error handling
  const wss = new WebSocketServer({ 
    noServer: true,
    clientTracking: true,
    perMessageDeflate: false
  });

  // Handle WebSocket upgrade with proper error handling
  httpServer.on('upgrade', (request, socket, head) => {
    if (request.headers['sec-websocket-protocol'] === 'vite-hmr') {
      return;
    }

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      socket.destroy();
    });

    try {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.emit('connection', ws, request);
      });
    } catch (error) {
      console.error('WebSocket upgrade error:', error);
      socket.destroy();
    }
  });

  // Study guide routes
  app.use('/api/study-guide', studyGuideRouter);

  // Error handling middleware
  app.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  // Modules routes with proper error handling
  app.get("/api/modules", async (req: Request, res: Response) => {
    try {
      const allModules = await db.select().from(modules);

      if (!allModules || allModules.length === 0) {
        return res.status(404).json({ message: "No modules found" });
      }

      res.json(allModules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ 
        message: "Failed to fetch modules",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  // Study buddy chat endpoints
  app.post("/api/study-buddy/start", async (req: Request, res: Response) => {
    try {
      const { studentId, tone, topic } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a knowledgeable and ${tone} NCLEX tutor. Help nursing students understand complex topics and prepare for their exam.`
          },
          {
            role: "user",
            content: `Start a tutoring session about ${topic || 'NCLEX preparation'}.`
          }
        ]
      });

      const message = completion.choices[0]?.message?.content;
      if (!message) {
        throw new Error("Failed to generate initial message");
      }

      const sessionId = `session_${Date.now()}`;

      // Store chat in database
      await db.insert(studyBuddyChats).values({
        userId: studentId,
        sessionId,
        role: 'assistant',
        content: message,
        tone
      });

      res.json({
        sessionId,
        message
      });
    } catch (error) {
      console.error("Error starting study session:", error);
      res.status(500).json({
        message: "Failed to start study session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/study-buddy/chat", async (req: Request, res: Response) => {
    try {
      const { studentId, sessionId, message, context } = req.body;

      // Store user message
      await db.insert(studyBuddyChats).values({
        userId: studentId,
        sessionId,
        role: 'user',
        content: message,
        tone: context.tone
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a ${context.tone} NCLEX tutor. Consider recent messages for context and maintain a consistent teaching approach.
            Previous context: ${JSON.stringify(context.recentMessages)}`
          },
          {
            role: "user",
            content: message
          }
        ]
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("Failed to generate response");
      }

      // Store assistant response
      await db.insert(studyBuddyChats).values({
        userId: studentId,
        sessionId,
        role: 'assistant',
        content: response,
        tone: context.tone
      });

      res.json({ message: response });
    } catch (error) {
      console.error("Error in study buddy chat:", error);
      res.status(500).json({
        message: "Failed to process message",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });


  // Clinical Judgment AI endpoint
  app.post("/api/chat/clinical-judgment", async (req: Request, res: Response) => {
    const { topic, context, question, type } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert nursing educator specializing in clinical judgment and critical thinking.
            Focus on the NCSBN Clinical Judgment Measurement Model (NCJMM) and its application in nursing practice.
            Provide detailed, practical guidance that helps nurses develop their clinical reasoning skills.`
          },
          {
            role: "user",
            content: question || `Explain key considerations for ${topic} in clinical judgment.`
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
      console.error("Error in Clinical Judgment AI endpoint:", error);
      res.status(500).json({
        message: "Failed to get AI assistance",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Pathophysiology AI help endpoint
  app.post("/api/ai-help", async (req: Request, res: Response) => {
    const { topic, context, question } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert pathophysiology educator helping nursing students understand complex disease processes and body systems. Provide detailed explanations with clinical correlations."
          },
          {
            role: "user",
            content: question || `Explain ${topic} in pathophysiology${context ? `. Context: ${context}` : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("No response generated");
      }

      res.json({ content: response });
    } catch (error) {
      console.error("Error in AI help endpoint:", error);
      res.status(500).json({
        message: "Failed to get AI assistance",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Help endpoint with enhanced safety measures context
  app.post("/api/chat/risk-reduction", async (req: Request, res: Response) => {
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
  // Drug calculation generation endpoint
  app.post("/api/generate-calculation", async (req: Request, res: Response) => {
    try {
      const { difficulty } = req.body;

      // Generate a sample calculation problem based on difficulty
      const problem = {
        id: `calc_${Date.now()}`,
        type: ['dosage', 'rate', 'conversion', 'concentration'][Math.floor(Math.random() * 4)],
        difficulty,
        question: "Calculate the correct dosage for a patient weighing 70kg who needs 5mg/kg of medication X.",
        givens: {
          "Patient Weight": "70 kg",
          "Required Dose": "5 mg/kg",
          "Available Concentration": "100 mg/mL"
        },
        answer: 3.5,
        unit: "mL",
        explanation: "To calculate the volume needed: (70 kg × 5 mg/kg) ÷ 100 mg/mL = 3.5 mL",
        hints: [
          "First calculate the total dose needed in mg",
          "Then convert to volume using the available concentration"
        ]
      };

      res.json(problem);
    } catch (error) {
      console.error("Error generating calculation:", error);
      res.status(500).json({ message: "Failed to generate calculation problem" });
    }
  });

  app.get("/api/questions/:moduleId", async (req: Request, res: Response) => {
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
  app.post("/api/quiz-attempts", async (req: Request, res: Response) => {
    try {
      const { userId, moduleId, answers } = req.body;

      // Calculate score
      const score = answers.filter((a: {correct: boolean}) => a.correct).length / answers.length * 100;

      const [newAttempt] = await db.insert(quizAttempts).values({
        userId,
        moduleId,
        score,
        answers,
        startedAt: new Date()
      }).returning();

      // Update user progress
      await db.update(userProgress)
        .set({
          completedQuestions: userProgress.completedQuestions + answers.length,
          correctAnswers: userProgress.correctAnswers + answers.filter((a: {correct: boolean}) => a.correct).length,
          lastAttempt: new Date()
        })
        .where(eq(userProgress.userId, userId));

      res.json(newAttempt);
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
      res.status(500).json({ message: "Failed to save quiz attempt" });
    }
  });

  // User progress routes with AI recommendations
  app.get("/api/progress/:userId", async (req: Request, res: Response) => {
    try {
      const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, parseInt(req.params.userId)),
        with: {
          module: true,
        },
      });

      // Get AI study recommendations
      const performanceData = progress.map(p => ({
        topic: p.module?.title || "",
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

  // Analytics routes with improved error handling
  app.get("/api/analytics/user/:userId", async (req: Request, res: Response) => {
    try {
      console.log(`Fetching analytics for user ${req.params.userId}`);

      if (!req.params.userId || isNaN(parseInt(req.params.userId))) {
        return res.status(400).json({
          message: "Invalid user ID provided",
          success: false
        });
      }

      const userId = parseInt(req.params.userId);

      const attempts = await db.query.quizAttempts.findMany({
        where: eq(quizAttempts.userId, userId),
        orderBy: (quizAttempts, { desc }) => [desc(quizAttempts.startedAt)],
      });

      const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, userId),
      });

      if (!attempts && !progress) {
        console.log('No data found for user');
        return res.status(404).json({
          message: "No analytics data found for user",
          success: false
        });
      }

      // Analyze overall performance
      const overallAnalysis = await analyzePerformance(
        attempts?.flatMap(attempt => attempt.answers || []) || []
      );

      console.log('Successfully generated analytics response');

      // Format the response data with defaults
      const analyticsResponse = {
        success: true,
        data: {
          attempts: attempts || [],
          progress: progress || [],
          analysis: overallAnalysis || {
            strengths: [],
            weaknesses: [],
            confidence: 0,
            recommendedTopics: []
          },
          summary: {
            totalAttempts: attempts?.length || 0,
            averageScore: attempts?.reduce((acc, curr) => acc + (curr.score || 0), 0) / (attempts?.length || 1) || 0,
            strengths: overallAnalysis?.strengths || [],
            weaknesses: overallAnalysis?.weaknesses || [],
            confidence: overallAnalysis?.confidence || 0
          },
        }
      };

      res.json(analyticsResponse);
    } catch (error) {
      console.error("Error in analytics endpoint:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Quiz question generation endpoint
  app.post("/api/generate-questions", async (req: Request, res: Response) => {
    try {
      const { topic, previousQuestionIds, userPerformance } = req.body;
      const MIN_QUESTIONS = 20;

      // Generate unique questions based on user performance
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate NCLEX-style questions in valid JSON array format. Focus on areas where the user needs improvement."
          },
          {
            role: "user",
            content: `Generate ${MIN_QUESTIONS} unique nursing questions${topic ? ` for ${topic}` : ''} in a JSON array. Each question should have: text, options (array of {id, text}), correctAnswer, explanation, category, and difficulty fields.
            Previous question IDs: ${previousQuestionIds?.join(', ') || 'none'}
            User performance: ${JSON.stringify(userPerformance)}`
          }
        ],
        temperature: 0.7,
      });

      let generatedQuestions;
      try {
        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("No content received from OpenAI");

        // Try to extract JSON if wrapped in markdown code blocks
        const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
        generatedQuestions = JSON.parse(jsonContent);

        if (!Array.isArray(generatedQuestions)) {
          throw new Error("Generated content is not an array");
        }
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", parseError);
        // Fallback to default questions
        generatedQuestions = generateBackupQuestions();
      }

      // Ensure questions are unique and properly formatted
      const formattedQuestions = generatedQuestions.map((q: any, index: number) => ({
        id: `gen_${Date.now()}_${index}`,
        text: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        category: topic || 'General',
        difficulty: q.difficulty || 'Medium'
      }));

      res.json(formattedQuestions);
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({
        message: "Failed to generate questions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add exam question endpoint
  app.post("/api/exam/:type/question", async (req: Request, res: Response) => {
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

  // Update the prevention questions endpoint
  app.post("/api/exam/prevention/questions", async (req: Request, res: Response) => {
    try {
      console.log('Received request for more prevention questions');
      const { previousQuestions } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Generate 3 NCLEX-style questions focused on nursing prevention strategies and risk reduction. 
            Each question should be in this format:
            [
              {
                "id": "unique_string_id",
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
                    { "title": "concept title", "description": "concept description" }
                  ]
                }
              }
            ]`
          },
          {
            role: "user",
            content: `Generate 3 new prevention-focused questions. Previous question IDs to avoid: ${previousQuestions?.join(", ") || "none"}`
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
        const jsonStr = response.replace(/```json\n?|\n?```/g, '').trim();
        const questions = JSON.parse(jsonStr);
        console.log('Parsed questions:', questions);

        if (!Array.isArray(questions)) {
          throw new Error("Response is not an array");
        }

        res.json(questions);
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        console.log("Raw response:", response);
        // If parsing fails, use backup questions
        res.json(generateBackupQuestions());
      }
    } catch (error) {
      console.error("Error generating prevention questions:", error);
      res.status(500).json({
        message: "Failed to generate questions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Patient Scenarios Routes
  app.post("/api/scenarios/generate", async (req: Request, res: Response) => {
    const { difficulty, previousScenarios } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert nursing educator creating detailed patient scenarios for NCLEX preparation.
            Generate realistic, complex scenarios that test clinical judgment and decision-making skills.
            Include comprehensive vital signs, detailed symptoms, relevant medical history, medications, and current presentation.
            Focus on common NCLEX topics and real-world nursing situations.
            Return your response as a JSON object with the following format:
            {
              "id": "unique_string",
              "title": "scenario title",
              "description": "detailed patient presentation including chief complaint and relevant history",
              "vitalSigns": {
                "Temperature": "string",
                "HeartRate": "string",
                "RespiratoryRate": "string",
                "BloodPressure": "string",
                "O2Saturation": "string",
                "Pain": "string"
              },
              "medicalHistory": ["detailed past medical conditions"],
              "currentMedications": ["list of current medications with dosages"],
              "allergies": ["list of allergies"],
              "currentSymptoms": ["detailed current symptoms"],
              "labResults": {"test": "result with normal ranges"},
              "requiredAssessments": ["specific assessment tasks"],
              "expectedInterventions": ["detailed nursing interventions"],
              "rationales": {
                "assessmentRationales": {"assessment": "why this is important"},
                "interventionRationales": {"intervention": "why this is appropriate"}
              },
              "criticalThinkingPoints": ["key points to consider"],
              "nursingSensitivities": ["cultural or special considerations"],
              "difficulty": "Easy|Medium|Hard"
            }`
          },
          {
            role: "user",
            content: `Generate a ${difficulty || 'Medium'} difficulty nursing scenario with comprehensive details and return it as a JSON object. Previous scenario IDs to avoid: ${previousScenarios?.join(', ') || 'none'}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const scenarioContent = completion.choices[0]?.message?.content;
      if (!scenarioContent) {
        throw new Error("Failed to generate scenario");
      }

      const scenario = JSON.parse(scenarioContent);
      res.json(scenario);
    } catch (error) {
      console.error("Error generating scenario:", error);
      res.status(500).json({
        message: "Failed to generate scenario",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/scenarios/evaluate", async (req: Request, res: Response) => {
    const { scenarioId, actions, assessments } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert nursing educator evaluating student performance in patient scenarios.
            Analyze the student's actions and assessments against expected nursing interventions using the NCLEX Clinical Judgment Measurement Model.
            Provide detailed, educational feedback focusing on clinical reasoning and patient safety.
            Return your response as a JSON object with the following format:
            {
              "score": number (0-100),
              "feedback": {
                "strengths": ["specific positive actions taken"],
                "areasForImprovement": ["specific areas needing improvement"],
                "missedCriticalActions": ["important actions that were missed"],
                "incorrectActions": ["actions that were inappropriate"]
              },
              "criticalThinkingAnalysis": "detailed analysis of clinical judgment",
              "clinicalReasoning": {
                "recognizeClues": "analysis of cue recognition",
                "analyzeInformation": "analysis of information interpretation",
                "prioritizeConcerns": "analysis of prioritization skills"
              },
              "patientSafetyImpact": "analysis of how decisions affected patient safety",
              "recommendedStudyTopics": ["specific topics to review"],
              "suggestedResources": ["specific learning resources"],
              "nextStepsGuidance": "guidance for improvement"
            }`
          },
          {
            role: "user",
            content: `Evaluate these nursing actions and assessments for scenario ${scenarioId} and return a comprehensive evaluation as a JSON object:
            Actions Taken: ${JSON.stringify(actions)}
            Assessments Performed: ${JSON.stringify(assessments)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const evaluationContent = completion.choices[0]?.message?.content;
      if (!evaluationContent) {
        throw new Error("Failed to evaluate scenario");
      }

      const evaluation = JSON.parse(evaluationContent);
      res.json(evaluation);
    } catch (error) {
      console.error("Error evaluating scenario:", error);
      res.status(500).json({
        message: "Failed to evaluate scenario",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/scenarios/hint", async (req: Request, res: Response) => {
    const { scenarioId, currentState } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert nursing educator providing guidance during patient scenarios.
            Offer hints that promote critical thinking and clinical reasoning without giving away answers directly.
            Focus on helping students recognize important clinical cues and relationships.
            Return your response as a JSON object with the following format:
            {
              "hint": "detailed guidance that promotes thinking",
              "relevantConcepts": ["key nursing concepts to consider"],
              "thingsToConsider": ["specific aspects to think about"],
              "clinicalConnections": ["related clinical concepts"],
              "patientSafetyConsiderations": ["safety aspects to consider"],
              "prioritizationGuidance": "tips for prioritizing actions"
            }`
          },
          {
            role: "user",
            content: `Provide a hint for scenario ${scenarioId} based on the current state and return it as a JSON object. Current state: ${JSON.stringify(currentState)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const hintContent = completion.choices[0]?.message?.content;
      if (!hintContent) {
        throw new Error("Failed to generate hint");
      }

      const hint = JSON.parse(hintContent);
      res.json(hint);
    } catch (error) {
      console.error("Error generating hint:", error);
      res.status(500).json({
        message: "Failed to generate hint",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return httpServer;
}

// Export types and interfaces
export type { PracticeQuestion, QuestionOption };

// Helper functions with proper typing
async function getStudyRecommendations(performanceData: PerformanceData[]): Promise<any[]> {
  // Implement your AI recommendation logic here
  return [];
}

async function analyzePerformance(answers: Array<{correct: boolean}>): Promise<{
  strengths: string[];
  weaknesses: string[];
  confidence: number;
  recommendedTopics: string[];
}> {
  // Implement your performance analysis logic here
  return {
    strengths: [],
    weaknesses: [],
    confidence: 0,
    recommendedTopics: []
  };
}
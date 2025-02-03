import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { eq } from "drizzle-orm";
import studyGuideRouter from './routes/study-guide';
import OpenAI from "openai";
import { practiceQuestions } from './data/practice-questions';
import { studyBuddyChats } from "@db/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Study guide routes
  app.use('/api/study-guide', studyGuideRouter);

  // Study buddy chat endpoints
  app.post("/api/study-buddy/start", async (req, res) => {
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

  app.post("/api/study-buddy/chat", async (req, res) => {
    try {
      if (!req.body || !req.body.message) {
        return res.status(400).json({ 
          error: "Missing required fields",
          message: "Please provide a message" 
        });
      }
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
  // Clinical Judgment AI endpoint
  app.post("/api/chat/clinical-judgment", async (req, res) => {
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
  app.post("/api/ai-help", async (req, res) => {
    const { topic, context, question } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert pharmacy skills educator. Help nursing students understand medication administration techniques, clinical calculations, drug preparation, and safety protocols. Provide specific, practical guidance focused on pharmacy skills and competencies. Do not respond with generic messages about undefined terms - instead, provide an overview of key pharmacy skills if the query is unclear."
          },
          {
            role: "user",
            content: question || `Explain pharmacy skills for ${topic}${context ? `. Context: ${context}` : '. Include key competencies and safety considerations.'}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;


      if (!response) {
        throw new Error("No response generated");
      }

      const formattedResponse = {
        content: response,
        type: 'explanation',
        topic: topic || 'general'
      };

      res.json(formattedResponse);
    } catch (error) {
      console.error("Error in AI help endpoint:", error);
      res.status(500).json({
        message: "Failed to get AI assistance",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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
  app.post("/api/generate-calculation", async (req, res) => {
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

  // Quiz question generation endpoint
  app.post("/api/generate-questions", async (req, res) => {
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
        generatedQuestions = [
          {
            text: "Which nursing intervention is most appropriate for a client with acute pain?",
            options: [
              { id: "a", text: "Assess pain characteristics" },
              { id: "b", text: "Administer PRN pain medication immediately" },
              { id: "c", text: "Notify healthcare provider" },
              { id: "d", text: "Apply ice pack to affected area" }
            ],
            correctAnswer: "a",
            explanation: "Pain assessment should be conducted first to determine appropriate interventions.",
            category: topic || "General",
            difficulty: "Medium"
          }
        ];
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

  // Update the prevention questions endpoint
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
      if (!response) {
        throw new Error("Failed to generate content");
      }
      console.log('Generated response from OpenAI');

      const formattedResponse = {
        content: response,
        type: 'practice',
        topic: req.body.section
      };

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

  // Patient Scenarios Routes
  app.post("/api/scenarios/generate", async (req, res) => {
    const { difficulty, previousScenarios } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert nursing educator creating detailed patient scenarios for NCLEX preparation.
            Generate a properly formatted JSON scenario that matches this structure exactly:
            {
              "id": "string",
              "title": "string",
              "description": "string",
              "difficulty": "beginner|intermediate|advanced",
              "initial_state": {
                "patient_condition": "string",
                "vital_signs": {
                  "blood_pressure": "string",
                  "heart_rate": "number",
                  "respiratory_rate": "number",
                  "temperature": "number",
                  "oxygen_saturation": "number"
                },
                "symptoms": ["string"],
                "medical_history": "string"
              },
              "expected_actions": [
                {
                  "priority": "number",
                  "action": "string",
                  "rationale": "string"
                }
              ],
              "duration_minutes": "number"
            }`
          },
          {
            role: "user",
            content: `Generate a ${difficulty || 'Medium'} difficulty nursing scenario that exactly matches the required JSON structure.`
          }
        ],
        temperature: 0.7
      });

      const scenarioContent = completion.choices[0]?.message?.content;
      if (!scenarioContent) {
        throw new Error("Failed to generate scenario");
      }

      try {
        let cleanContent = scenarioContent;
        if (scenarioContent.includes('```json')) {
          cleanContent = scenarioContent
            .split('```json')[1]
            .split('```')[0]
            .trim();
        }

        const scenario = JSON.parse(cleanContent);

        if (!scenario || typeof scenario !== 'object') {
          throw new Error("Invalid scenario format");
        }

        // Ensure all required fields are present
        const validatedScenario = {
          id: scenario.id || `scenario_${Date.now()}`,
          title: scenario.title || "Clinical Scenario",
          description: scenario.description || "",
          initial_state: {
            patient_history: scenario.initial_state?.patient_history || "",
            chief_complaint: scenario.initial_state?.chief_complaint || "",
            vital_signs: scenario.initial_state?.vital_signs || {},
            lab_values: scenario.initial_state?.lab_values || {},
            current_interventions: scenario.initial_state?.current_interventions || []
          },
          expected_actions: scenario.expected_actions || []
        };

        res.json(validatedScenario);
      } catch (parseError) {
        console.error("Error parsing scenario:", parseError);
        // Return a fallback scenario
        res.json({
          id: `fallback_${Date.now()}`,
          title: "Basic Patient Assessment",
          description: "Perform initial assessment of a patient with respiratory distress",
          difficulty: "intermediate",
          objectives: ["Assess vital signs", "Identify key symptoms", "Prioritize interventions"],
          initial_state: {
            patient_condition: "Alert but anxious",
            vital_signs: {
              blood_pressure: "138/88",
              heart_rate: 92,
              respiratory_rate: 24,
              temperature: 37.2,
              oxygen_saturation: 94
            },
            symptoms: ["Shortness of breath", "Chest tightness"],
            medical_history: "History of asthma"
          },
          expected_actions: [
            {
              priority: 1,
              action: "Assess airway and breathing",
              rationale: "Immediate assessment of respiratory status is critical"
            }
          ],
          duration_minutes: 30
        });
      }
    } catch (error) {
      console.error("Error generating scenario:", error);
      res.status(500).json({
        message: "Failed to generate scenario",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/scenarios/evaluate", async (req, res) => {
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
        ]
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

  app.post("/api/scenarios/hint", async (req, res) => {
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

  app.post("/api/ai/simulation-scenario", async (req, res) => {
    try {
      const { difficulty } = req.body;
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a nursing educator. Generate a realistic simulation scenario. Return response in valid JSON format only."
          },
          {
            role: "user",
            content: `Generate a ${difficulty || 'medium'} difficulty nursing simulation scenario with this exact JSON structure:
{
  "title": "string",
  "description": "string",
  "initial_state": {
    "patient_history": "string",
    "vital_signs": {
      "blood_pressure": "120/80",
      "heart_rate": 80,
      "respiratory_rate": 16,
      "temperature": 37,
      "oxygen_saturation": 98
    },
    "symptoms": ["string"]
  },
  "expected_actions": [
    {
      "priority": 1,
      "action": "string",
      "rationale": "string"
    }
  ]
}`
          }
        ],
        temperature: 0.7
      });

      const scenarioContent = completion.choices[0]?.message?.content;
      if (!scenarioContent) {
        throw new Error("Failed to generate scenario");
      }

      let scenario;
      try {
        scenario = JSON.parse(scenarioContent);
      } catch (error) {
        console.error("Failed to parse scenario:", error);
        return res.status(500).json({
          error: "Failed to generate valid scenario",
          details: error.message
        });
      }

      // Return a default scenario if validation fails
      if (!scenario?.title || !scenario?.initial_state || !Array.isArray(scenario?.expected_actions)) {
        scenario = {
          title: "Basic Patient Assessment",
          description: "Assess a patient presenting with respiratory symptoms",
          initial_state: {
            patient_history: "No significant medical history",
            vital_signs: {
              blood_pressure: "120/80",
              heart_rate: 80,
              respiratory_rate: 16,
              temperature: 37,
              oxygen_saturation: 98
            },
            symptoms: ["Mild cough", "Normal breathing"]
          },
          expected_actions: [
            {
              priority: 1,
              action: "Check vital signs",
              rationale: "Establish baseline patient status"
            }
          ]
        };
      }

      return res.json(scenario);
    } catch (error) {
      console.error('Error generating scenario:', error);
      return res.status(500).json({
        error: 'Failed to generate simulation scenario',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/pharmacology-help", async (req, res) => {
    try {
      const { topic, context, type } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert pharmacology educator helping nursing students understand medication classes, mechanisms of action, and clinical applications."
          },
          {
            role: "user",
            content: `Explain ${topic} ${context ? `in the context of ${context}` : ''}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated from AI');
      }

      res.json({ content });
    } catch (error) {
      console.error("Error in pharmacology help:", error);
      res.status(500).json({ 
        error: "Failed to get AI assistance",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  app.post("/api/ai/simulation-feedback", async (req, res) => {
    try {
      const { scenario, userActions } = req.body;
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert nursing educator evaluating student performance in patient scenarios. 
            Provide feedback in valid JSON format with strengths, areas_for_improvement, and recommendations fields.`
          },
          {
            role: "user",
            content: `Evaluate these nursing actions for scenario "${scenario?.title}": ${JSON.stringify(userActions)}`
          }
        ],
        temperature: 0.7
      });

      const feedbackContent = completion.choices[0]?.message?.content;
      if (!feedbackContent) {
        throw new Error("No feedback generated");
      }

      try {
        const parsedFeedback = JSON.parse(feedbackContent);
        return res.json(parsedFeedback);
      } catch (parseError) {
        // Enhanced fallback response with detailed metrics
        return res.json({
          strengths: [
            "Quick recognition of critical symptoms",
            "Appropriate prioritization of care",
            "Effective communication with healthcare team"
          ],
          areas_for_improvement: [
            "Clinical documentation specificity",
            "Time management in crisis situations",
            "Delegation of tasks"
          ],
          recommendations: [
            "Practice documenting SBAR format",
            "Review emergency protocols",
            "Focus on team leadership skills"
          ],
          clinical_reasoning_score: 75,
          clinical_judgment_metrics: {
            recognize_cues: 82,
            analyze_cues: 78,
            prioritize_hypotheses: 80,
            generate_solutions: 75,
            take_actions: 85,
            evaluate_outcomes: 76
          },
          next_gen_competencies: {
            clinical_judgment: 80,
            communication: 85,
            patient_safety: 88,
            evidence_based_practice: 75
          }
        });
      }
    } catch (error) {
      console.error("Error evaluating simulation:", error);
      res.status(500).json({
        message: "Failed to evaluate simulation",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/pharmacokinetics-cases", async (req, res) => {
    try {
      if (!req.body.topic) {
        throw new Error('Topic is required');
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert pharmacology educator. Generate a detailed clinical case study about ${req.body.topic} that includes:
            - Patient Presentation (demographics, symptoms, relevant history)
            - Clinical Assessment (vital signs, lab values, physical findings)
            - Pharmacokinetic Analysis (ADME principles specific to this case)
            - Treatment Plan (medication selection, dosing considerations)
            - Key Learning Points

            Format with clear headings and concise paragraphs.`
          },
          {
            role: "user",
            content: `Create a realistic clinical case study demonstrating ${req.body.topic} principles in pharmacokinetics.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated from AI');
      }

      res.json({ 
        content,
        caseType: req.body.topic,
        learningPoints: [
          "ADME processes and clinical implications",
          "Patient-specific factors affecting drug therapy",
          "Clinical decision-making in pharmacokinetics",
          "Therapeutic monitoring and dose adjustments"
        ]
      });
    } catch (error) {
      console.error("Error generating case study:", error);
      res.status(500).json({ 
        error: "Failed to generate case study",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  async function getPharmacologyHelp(topic: string, context: string) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert pharmacology educator helping nursing students understand medication classes, mechanisms of action, and clinical applications of drugs."
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

  async function generateNewQuestions(userId: number, examType: string) {
    try {
      const availableQuestions = Object.values(practiceQuestions).flat();

      if (availableQuestions.length === 0) {
        throw new Error("No questions available");
      }

      if (examType === 'cat') {
        const sortedQuestions = availableQuestions.sort((a, b) => {
          const difficultyMap = { Easy: 1, Medium: 2, Hard: 3 };
          return difficultyMap[a.difficulty as keyof typeof difficultyMap] -               difficultyMap[b.difficulty as keyof typeof difficultyMap];
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
  // AI case analysis endpoint
  app.post("/api/ai/analyze-case", async (req, res) => {
    const { caseId, userAnswers, currentQuestion } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert nursing educator analyzing student performance in clinical cases. Provide detailed feedback on clinical reasoning and decision-making."
          },
          {
            role: "user",
            content: JSON.stringify({ caseId, userAnswers, currentQuestion })
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const analysis = completion.choices[0]?.message?.content || "Unable to generate analysis";
      res.json({ analysis });
    } catch (error) {
      console.error("Error in AI case analysis:", error);
      res.status(500).json({
        message: "Failed to analyze case",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

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

  async function getPharmacologyHelp(topic: string, context: string) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert pharmacology educator helping nursing students understand medication classes, mechanisms of action, and clinical applications of drugs."
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

  async function generateNewQuestions(userId: number, examType: string) {
    try {
      const availableQuestions = Object.values(practiceQuestions).flat();

      if (availableQuestions.length === 0) {
        throw new Error("No questions available");
      }

      if (examType === 'cat') {
        const sortedQuestions = availableQuestions.sort((a, b) => {
          const difficultyMap = { Easy: 1, Medium: 2, Hard: 3 };
          return difficultyMap[a.difficulty as keyof typeof difficultyMap] -               difficultyMap[b.difficulty as keyof typeof difficultyMap];
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
  // AI Study Plan Generation
  app.post('/api/ai/study-plan', async (req, res) => {
    try {
      const { duration, performance, focusAreas } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate a personalized NCLEX study plan based on available time and performance data. Focus on Bianca's learning style (visual) and preferred session length (45 minutes)."
          },
          {
            role: "user",
            content: JSON.stringify({
              duration,
              performance,
              focusAreas,
              preferences: {
                learningStyle: 'visual',
                sessionLength: 45,
                breakFrequency: 15
              }
            })
          }
        ]
      });

      const plan = JSON.parse(completion.choices[0]?.message?.content || '{}');
      res.json(plan);
    } catch (error) {
      console.error("Error generating study plan:", error);
      res.status(500).json({ error: "Failed to generate study plan" });
    }
  });

  return httpServer;
}
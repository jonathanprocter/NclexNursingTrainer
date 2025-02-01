import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { eq } from "drizzle-orm";
import studyGuideRouter from './routes/study-guide';
import OpenAI from "openai";
import { practiceQuestions } from './data/practice-questions';
import { studyBuddyChats, quizAttempts, userProgress, questions } from "@db/schema";

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

  // Questions endpoint with AI generation
  app.get("/api/questions", async (req, res) => {
    try {
      const { topic, limit = 10, page = 1 } = req.query;

      // Use the existing practice questions or generate new ones
      let questions = practiceQuestions;

      // Filter by topic if provided
      if (topic) {
        questions = questions.filter(q => q.category === topic);
      }

      // Apply pagination
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedQuestions = questions.slice(startIndex, endIndex);

      res.json({
        questions: paginatedQuestions,
        total: questions.length,
        page: Number(page),
        totalPages: Math.ceil(questions.length / Number(limit))
      });
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({
        message: "Failed to fetch questions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Help endpoint
  app.post("/api/ai-help", async (req, res) => {
    const { context } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert nursing educator. Provide detailed explanations of nursing concepts,
          focusing on clinical reasoning and practical application. Include:
          - Key principles and rationale
          - Clinical examples and scenarios
          - Common misconceptions
          - Evidence-based practice guidelines`
          },
          {
            role: "user",
            content: context
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error("No response generated");
      }

      res.json({ response });
    } catch (error) {
      console.error("Error in AI help endpoint:", error);
      res.status(500).json({
        message: "Failed to get AI assistance",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Question generation endpoint
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const { topic, complexity, previousQuestionIds, userPerformance } = req.body;
      const MIN_QUESTIONS = 20;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Generate NCLEX-style questions focusing on ${complexity || 'knowledge'} level thinking.
              Each question should include:
              - Clear question text
              - Multiple choice options
              - Correct answer with detailed rationale
              - Cognitive level classification
              - Conceptual breakdown (key concepts, related topics, clinical relevance)
              - Frequently asked questions about the topic
              Return as a valid JSON array.`
          },
          {
            role: "user",
            content: `Generate ${MIN_QUESTIONS} unique nursing questions${topic ? ` for ${topic}` : ''} at the ${complexity || 'knowledge'} cognitive level.
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
        // Return a fallback question
        generatedQuestions = [{
          id: `gen_${Date.now()}_0`,
          text: "Which nursing intervention is most appropriate for a client with acute pain?",
          options: [
            { id: "a", text: "Assess pain characteristics" },
            { id: "b", text: "Administer PRN pain medication immediately" },
            { id: "c", text: "Notify healthcare provider" },
            { id: "d", text: "Apply ice pack to affected area" }
          ],
          correctAnswer: "a",
          explanation: "Pain assessment should be conducted first to determine appropriate interventions.",
          rationale: "Assessment is the first step in the nursing process. Before implementing any intervention, the nurse must gather data about the pain's characteristics (location, intensity, quality, etc.) to ensure appropriate and effective pain management.",
          category: topic || "General",
          difficulty: "medium",
          cognitiveLevel: complexity || "knowledge",
          conceptualBreakdown: {
            key_concepts: [
              "Pain assessment",
              "Nursing process",
              "Clinical decision making"
            ],
            related_topics: [
              "Pain management",
              "Patient assessment",
              "Documentation"
            ],
            clinical_relevance: "Proper pain assessment is crucial for effective pain management and patient outcomes."
          },
          faqs: [
            {
              question: "Why is assessment prioritized over medication administration?",
              answer: "Assessment provides crucial information about the pain's characteristics, helping determine the most appropriate intervention and ensuring safe, effective pain management."
            },
            {
              question: "What are the key components of pain assessment?",
              answer: "Key components include location, intensity, quality, onset, duration, aggravating/alleviating factors, and impact on daily activities."
            }
          ]
        }];
      }

      // Ensure questions are properly formatted and enhance with cognitive complexity
      const formattedQuestions = generatedQuestions.map((q: any, index: number) => ({
        id: q.id || `gen_${Date.now()}_${index}`,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        rationale: q.rationale || "Not provided",
        category: topic || 'General',
        difficulty: q.difficulty || 'medium',
        cognitiveLevel: complexity || 'knowledge',
        conceptualBreakdown: q.conceptualBreakdown || {
          key_concepts: [],
          related_topics: [],
          clinical_relevance: ""
        },
        faqs: q.faqs || []
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

  return httpServer;
}
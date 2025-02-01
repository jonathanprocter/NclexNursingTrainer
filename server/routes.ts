import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { eq, and, asc } from "drizzle-orm";
import studyGuideRouter from './routes/study-guide';
import OpenAI from "openai";
import { questions, studyBuddyChats } from "@db/schema";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Study guide routes
  app.use('/api/study-guide', studyGuideRouter);

  // Get questions endpoint
  app.get('/api/questions', async (req, res) => {
    try {
      const { category } = req.query;
      let query = db.select().from(questions);

      if (category) {
        query = query.where(eq(questions.type, category as string));
      }

      const questionList = await query.orderBy(asc(questions.id));

      // Transform the data to match the client's expected format
      const formattedQuestions = questionList.map(q => ({
        id: q.id.toString(),
        text: q.text,
        options: q.options as { id: string; text: string }[],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        category: q.type,
        difficulty: q.difficulty === 1 ? 'Easy' : q.difficulty === 2 ? 'Medium' : 'Hard',
        tags: q.topicTags as string[] || []
      }));

      res.json(formattedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });

  // Study buddy chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, chatId } = req.body;

      // Add user message and session ID
      const sessionId = req.sessionID || Date.now().toString();

      if (chatId) {
        // For existing chats, add new message
        await db.insert(studyBuddyChats).values({
          userId: null, // TODO: Add user authentication
          sessionId,
          role: 'user',
          content: message,
          tone: 'professional'
        });
      }

      // Get OpenAI response
      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: message }],
        model: "gpt-3.5-turbo",
      });

      const aiMessage = completion.choices[0].message;

      // Save AI response
      await db.insert(studyBuddyChats).values({
        userId: null,
        sessionId,
        role: 'assistant',
        content: aiMessage.content || '',
        tone: 'professional'
      });

      res.json({
        message: aiMessage.content,
        chatId: sessionId
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to get chat response' });
    }
  });

  return httpServer;
}
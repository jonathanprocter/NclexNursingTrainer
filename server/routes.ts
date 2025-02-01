import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { eq } from "drizzle-orm";
import studyGuideRouter from './routes/study-guide';
import OpenAI from "openai";
import { studyBuddyChats, quizAttempts, userProgress, questions } from "@db/schema";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Register original routes
  app.use('/api/study-guide', studyGuideRouter);

  // Questions endpoint
  app.get('/api/questions', async (req, res) => {
    try {
      const questionList = await db.select().from(questions);
      const formattedQuestions = questionList.map(q => ({
        id: q.id,
        text: q.text || '',
        options: JSON.parse(q.options || '[]'),
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
        category: q.category || 'General',
        difficulty: q.difficulty || 'Medium'
      }));
      res.json({ questions: formattedQuestions });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });

  // Study buddy chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, chatId } = req.body;
      let chatHistory = [];
      if (chatId) {
        const existingChat = await db.select().from(studyBuddyChats).where(eq(studyBuddyChats.id, chatId));
        if (existingChat.length > 0) {
          chatHistory = existingChat[0].messages;
        }
      }

      chatHistory.push({ role: "user", content: message });

      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        messages: chatHistory,
        model: "gpt-3.5-turbo",
      });

      const aiMessage = completion.choices[0].message;
      chatHistory.push({ role: "assistant", content: aiMessage.content });

      if (chatId) {
        await db.update(studyBuddyChats).set({ messages: chatHistory }).where(eq(studyBuddyChats.id, chatId));
      } else {
        const result = await db.insert(studyBuddyChats).values({ messages: chatHistory }).returning();
        chatId = result[0].id;
      }

      res.json({ message: aiMessage.content, chatId });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to get chat response' });
    }
  });

  return httpServer;
}
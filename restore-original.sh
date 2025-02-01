#!/bin/bash
set -e

echo "Starting complete restoration process..."

# 1. First, let's back up any existing files just in case
if [ -f server/routes.ts ]; then
  cp server/routes.ts server/routes.ts.backup
  echo "Created backup of routes.ts"
fi

# 2. Clean up all added files
echo "Removing all added files..."

# Remove question-related files
rm -f server/data/practice-questions.ts
rm -f server/attached_assets/question-routes.ts
rm -f server/routes/questions.ts

# Remove empty directories
rm -rf server/data 2>/dev/null || true
rm -rf server/attached_assets 2>/dev/null || true

# 3. Restore original routes.ts
echo "Restoring original routes.ts configuration..."
cat << 'EOF' > server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { eq } from "drizzle-orm";
import studyGuideRouter from './routes/study-guide';
import OpenAI from "openai";
import { studyBuddyChats, quizAttempts, userProgress } from "@db/schema";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Study guide routes
  app.use('/api/study-guide', studyGuideRouter);

  // Study buddy chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, chatId } = req.body;

      // Get chat history if chatId provided
      let chatHistory = [];
      if (chatId) {
        const existingChat = await db.select().from(studyBuddyChats).where(eq(studyBuddyChats.id, chatId));
        if (existingChat.length > 0) {
          chatHistory = existingChat[0].messages;
        }
      }

      // Add user message to history
      chatHistory.push({
        role: "user",
        content: message
      });

      // Get OpenAI response
      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        messages: chatHistory,
        model: "gpt-3.5-turbo",
      });

      const aiMessage = completion.choices[0].message;

      // Add AI response to history
      chatHistory.push({
        role: "assistant",
        content: aiMessage.content
      });

      // Save chat history
      if (chatId) {
        await db
          .update(studyBuddyChats)
          .set({ messages: chatHistory })
          .where(eq(studyBuddyChats.id, chatId));
      } else {
        const result = await db
          .insert(studyBuddyChats)
          .values({ messages: chatHistory })
          .returning();
        chatId = result[0].id;
      }

      res.json({
        message: aiMessage.content,
        chatId
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Failed to get chat response' });
    }
  });

  return httpServer;
}
EOF

# 4. Modify server/index.ts if it exists to remove any question route references
if [ -f server/index.ts ]; then
  sed -i '/question/d' server/index.ts
  echo "Cleaned up server/index.ts"
fi

echo "Restoration complete. Please restart your server."
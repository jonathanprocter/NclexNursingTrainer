#!/bin/bash

# Restore the original server/index.ts
cat << 'EOF' > server/index.ts
import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@db";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
const server = registerRoutes(app);

// Run migrations
async function main() {
  await migrate(db, {
    migrationsFolder: "./drizzle",
  });

  const port = process.env.PORT || 5001;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
EOF

# Your vite.config.ts appears correct, no changes needed there

# Now let's also ensure routes.ts is clean
cat << 'EOF' > server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { eq } from "drizzle-orm";
import studyGuideRouter from './routes/study-guide';
import OpenAI from "openai";
import { studyBuddyChats } from "@db/schema";

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

# Remove any leftover question-related files
rm -rf server/attached_assets 2>/dev/null || true
rm -rf server/data 2>/dev/null || true
rm -f server/routes/questions.ts 2>/dev/null || true

echo "Files have been restored. Please:"
echo "1. Stop your server"
echo "2. Run: npm install"
echo "3. Start your server again with: npm run dev"
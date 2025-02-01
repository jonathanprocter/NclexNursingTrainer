#!/bin/bash
set -e

echo "Starting cleanup process..."

# Remove the created files and directories carefully
echo "Removing added files..."

# Remove the practice questions file if it exists
if [ -f server/data/practice-questions.ts ]; then
  rm server/data/practice-questions.ts
  echo "Removed practice-questions.ts"
fi

# Remove the questions route file if it exists
if [ -f server/attached_assets/question-routes.ts ]; then
  rm server/attached_assets/question-routes.ts
  echo "Removed question-routes.ts"
fi

# Remove empty directories only if they exist and are empty
if [ -d server/attached_assets ] && [ -z "$(ls -A server/attached_assets)" ]; then
  rmdir server/attached_assets
  echo "Removed empty attached_assets directory"
fi

if [ -d server/data ] && [ -z "$(ls -A server/data)" ]; then
  rmdir server/data
  echo "Removed empty data directory"
fi

# Restore the original routes.ts if it was modified
if [ -f server/routes.ts ]; then
  cat << 'EOF' > server/routes.ts
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

  return httpServer;
}
EOF
  echo "Restored original routes.ts"
fi

echo "Cleanup complete. Your application should now be restored to its original state."
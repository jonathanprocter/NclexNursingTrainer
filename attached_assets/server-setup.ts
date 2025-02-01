// src/server.ts
import express from "express";
import { createServer } from "http";
import questionRouter from "./routes/questions";
import studyGuideRouter from './routes/study-guide';

export function registerRoutes(app: express.Express) {
  const httpServer = createServer(app);

  // API Routes
  app.use('/api/questions', questionRouter);
  app.use('/api/study-guide', studyGuideRouter);

  // Serve static files for the frontend
  app.use(express.static('public'));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Skip this handler for API routes
    if (req.path.startsWith('/api/')) {
      return;
    }
    res.sendFile('index.html', { root: 'public' });
  });

  return httpServer;
}

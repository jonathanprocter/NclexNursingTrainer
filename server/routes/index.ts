import express from 'express';
import analyticsRouter from './analytics.js';
import questionsRouter from './questions.js';
import practiceRouter from './practice.js';
import simulationsRouter from './simulations.js';

export function registerRoutes() {
  const router = express.Router();

  // Register all routes
  router.use('/analytics', analyticsRouter);
  router.use('/questions', questionsRouter);
  router.use('/practice', practiceRouter);
  router.use('/simulations', simulationsRouter);

  // Add error handling middleware
  router.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  return router;
}
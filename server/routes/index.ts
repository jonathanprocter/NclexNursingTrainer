import express from 'express';
import analyticsRouter from './analytics.js';
import questionsRouter from './questions.js';
import practiceRouter from './practice.js';
import simulationsRouter from './simulations.js';
import { healthCheck } from './health.js';

const router = express.Router();

// Health check endpoint
router.get('/health', healthCheck);

// Register all routes
router.use('/analytics', analyticsRouter);
router.use('/questions', questionsRouter);
router.use('/practice', practiceRouter);
router.use('/simulations', simulationsRouter);

// Error handling middleware
router.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Export the router
export { router };

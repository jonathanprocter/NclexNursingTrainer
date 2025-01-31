
import express from 'express';
import analyticsRouter from './analytics';
import questionsRouter from './questions';
import practiceRouter from './practice';
import simulationsRouter from './simulations';

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

export default router;

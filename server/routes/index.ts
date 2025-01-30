import express from 'express';
import analyticsRouter from './analytics';
import questionsRouter from './questions';
import practiceRouter from './practice';
import simulationsRouter from './simulations';

const router = express.Router();

// Register all routes with /api prefix
router.use('/api/analytics', analyticsRouter);
router.use('/api/questions', questionsRouter);
router.use('/api/practice', practiceRouter);
router.use('/api/simulations', simulationsRouter);

export default router;
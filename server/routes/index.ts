
import express from 'express';
import analyticsRouter from './analytics';
import questionsRouter from './questions';
import practiceRouter from './practice';
import simulationsRouter from './simulations';
import { healthCheck } from './health';

const router = express.Router();

// Health check endpoint
router.get('/health', healthCheck);

// Register all routes
router.use('/analytics', analyticsRouter);
router.use('/questions', questionsRouter);
router.use('/practice', practiceRouter);
router.use('/simulations', simulationsRouter);

export default router;

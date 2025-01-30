import { Router } from 'express';
import { z } from 'zod';
import cors from 'cors';
import { analyticsDataSchema } from '../../src/types/analytics.js';

const router = Router();

// Configure CORS for all origins in development
router.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Sample data - in a real app, this would be fetched from a database
const mockAnalyticsData = {
  performanceData: [
    { domain: "Clinical Judgment", mastery: 75 },
    { domain: "Patient Safety", mastery: 80 },
    { domain: "Care Management", mastery: 65 },
    { domain: "Health Promotion", mastery: 70 }
  ],
  totalStudyTime: "24",
  questionsAttempted: 150,
  averageScore: 78
};

router.get('/:userId', async (req, res) => {
  try {
    // Parse and validate query parameters
    const queryParamsSchema = z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    });

    const { from, to } = queryParamsSchema.parse(req.query);

    // Validate mock data against schema
    const validatedData = analyticsDataSchema.parse(mockAnalyticsData);

    // Enable CORS for all origins in development
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.json(validatedData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;
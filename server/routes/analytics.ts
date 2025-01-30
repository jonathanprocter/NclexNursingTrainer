import { Router } from 'express';
import { z } from 'zod';
import cors from 'cors';

const router = Router();

// Configure CORS for the analytics routes
router.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://0.0.0.0:3000',
      'http://localhost:4003',
      'http://0.0.0.0:4003'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Analytics data schema for validation
const analyticsDataSchema = z.object({
  performanceData: z.array(z.object({
    domain: z.string(),
    mastery: z.number().min(0).max(100)
  })),
  totalStudyTime: z.string(),
  questionsAttempted: z.number(),
  averageScore: z.number().min(0).max(100)
});

// Query parameters schema
const queryParamsSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

router.get('/:userId', async (req, res) => {
  try {
    // Validate and parse query parameters
    const { from, to } = queryParamsSchema.parse(req.query);

    // Sample data - in a real app, this would be fetched from a database
    const analyticsData = {
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

    // Validate data against schema
    const validatedData = analyticsDataSchema.parse(analyticsData);

    res.json(validatedData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;
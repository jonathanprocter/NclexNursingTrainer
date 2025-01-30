import { Router } from 'express';
import { z } from 'zod';
import cors from 'cors';

const router = Router();

// Configure CORS for the analytics routes
router.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

    // Add CORS headers explicitly for clarity
    res.header('Access-Control-Allow-Credentials', 'true');

    // Validate data against schema
    const validatedData = analyticsDataSchema.parse(analyticsData);

    res.json(validatedData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;
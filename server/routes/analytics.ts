import { Router } from 'express';
import { z } from 'zod';
import cors from 'cors';
import { analyticsDataSchema } from '@/types/analytics';

const router = Router();

// Configure CORS for all origins in development
router.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
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

// Main analytics endpoint
router.get('/', async (req, res) => {
  try {
    console.log('Fetching analytics data');

    // Parse and validate query parameters
    const queryParamsSchema = z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    });

    const { from, to } = queryParamsSchema.parse(req.query);

    // Validate mock data against schema
    const validatedData = mockAnalyticsData;

    if (!validatedData) {
      throw new Error('No analytics data available');
    }

    res.json({ 
      success: true, 
      data: validatedData 
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(error instanceof Error && error.message.includes('No analytics') ? 404 : 500).json({ 
      success: false, 
      error: 'Failed to fetch analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/progress', async (req, res) => {
  try {
    const progressData = req.body;

    // Here you would typically save to database
    // For now, just validate and return success
    res.json({ 
      success: true, 
      data: progressData
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(400).json({ 
      success: false,
      error: 'Invalid progress data',
      details: error instanceof Error ? error.message : undefined
    });
  }
});

export default router;
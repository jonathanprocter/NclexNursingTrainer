import { Router } from 'express';
import { z } from 'zod';
import cors from 'cors';
import { analyticsDataSchema, progressDataSchema } from '@/types/analytics';

const router = Router();

// Configure CORS for all origins in development
router.use(cors({
  origin: [
    'http://localhost:3000',
    'http://0.0.0.0:3000',
    /\.replit\.dev$/,
    /\.repl\.co$/,
    /^http:\/\/localhost:\d+$/
  ],
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

router.get('/', async (req, res) => {
  try {
    // Remove userId requirement since we're just returning mock data
    console.log('Fetching analytics data');
    
    console.log(`Fetching analytics data for user ${userId}`);

    // Parse and validate query parameters
    const queryParamsSchema = z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    });

    const { from, to } = queryParamsSchema.parse(req.query);

    // Validate mock data against schema
    const validatedData = analyticsDataSchema.parse(mockAnalyticsData);

    // Set explicit CORS headers for the response
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

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

router.post('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progressData = progressDataSchema.parse(req.body);

    // Here you would typically save to database
    // For now, just validate and return success
    res.json({ 
      success: true, 
      data: { userId, ...progressData }
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
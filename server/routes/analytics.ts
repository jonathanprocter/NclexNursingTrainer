import { Router } from 'express';
import cors from 'cors';

const router = Router();

router.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

router.get('/', async (req, res) => {
  try {
    const analyticsData = {
      performanceData: [
        { domain: "Clinical Judgment", mastery: 75 },
        { domain: "Patient Safety", mastery: 80 },
        { domain: "Care Management", mastery: 65 },
        { domain: "Health Promotion", mastery: 70 }
      ],
      totalStudyTime: "24h",
      questionsAttempted: 150,
      averageScore: 78
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;

import { Router } from 'express';

const router = Router();

router.get('/user/:id', async (req, res) => {
  try {
    // Mock data for now - replace with actual database query later
    const analyticsData = {
      performanceData: [
        { module: "Pharmacology", score: 85 },
        { module: "Pathophysiology", score: 75 },
        { module: "Med-Surg", score: 78 },
        { module: "Mental Health", score: 82 }
      ],
      totalStudyTime: "45.5",
      questionsAttempted: 428,
      averageScore: 82
    };
    
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;

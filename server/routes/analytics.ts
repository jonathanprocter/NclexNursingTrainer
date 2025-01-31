
import express from 'express';
const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const analyticsData = {
      data: {
        performanceData: [
          { domain: "Pharmacology", mastery: 85 },
          { domain: "Medical-Surgical", mastery: 78 },
          { domain: "Pediatrics", mastery: 92 }
        ],
        totalStudyTime: "24",
        questionsAttempted: 150,
        averageScore: 85
      }
    };
    
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;

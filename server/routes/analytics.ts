
import { Router } from 'express';

const router = Router();

router.get('/:userId', async (req, res) => {
  try {
    // Provide default analytics data for now
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
    
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;

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

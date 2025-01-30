import { Router } from 'express';
import { z } from 'zod';

const router = Router();

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

router.get('/:userId', async (req, res) => {
  try {
    // Provide validated analytics data
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

// Remove duplicate route to avoid conflicts
router.get('/performance/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const performanceData = {
      userId: userId,
      performanceData: [
        { module: "Pharmacology", mastery: 85 },
        { module: "Pathophysiology", mastery: 75 },
        { module: "Med-Surg", mastery: 78 },
        { module: "Mental Health", mastery: 82 }
      ],
      totalStudyTime: "45.5",
      questionsAttempted: 428,
      averageScore: 82
    };

    res.json(performanceData);
  } catch (error) {
    console.error('Performance data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

export default router;
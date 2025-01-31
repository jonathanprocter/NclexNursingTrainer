
import express from 'express';
const router = express.Router();

router.get('/', async (req, res, next) => {
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
    
    res.json(analyticsData);
  } catch (error) {
    next(error);
  }
});

export default router;

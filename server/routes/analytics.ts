
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  // Mock data for testing dashboard
  const analyticsData = {
    data: {
      performanceData: [
        { domain: "Pharmacology", mastery: 85 },
        { domain: "Medical-Surgical", mastery: 78 },
        { domain: "Pediatrics", mastery: 92 }
      ],
      totalStudyTime: "24h",
      questionsAttempted: 150,
      averageScore: 85
    }
  };
  
  res.json(analyticsData);
});

export default router;

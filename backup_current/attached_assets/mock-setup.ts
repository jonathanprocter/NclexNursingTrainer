import { setupWorker, rest } from 'msw';

const mockAnalytics = {
  performanceData: [
    { domain: "Pharmacology", mastery: 85 },
    { domain: "Medical-Surgical", mastery: 78 },
    { domain: "Pediatrics", mastery: 92 },
    { domain: "Mental Health", mastery: 88 },
    { domain: "Maternal Care", mastery: 82 }
  ],
  totalStudyTime: "24",
  questionsAttempted: 150,
  averageScore: 85
};

export const worker = setupWorker(
  rest.get('/api/analytics', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockAnalytics)
    );
  })
);

// Start the worker
worker.start();
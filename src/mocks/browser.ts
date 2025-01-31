import { http, HttpResponse, delay } from 'msw'
import { setupWorker } from 'msw/browser'
import type { AnalyticsData } from '@/types/analytics';

const mockAnalytics: AnalyticsData = {
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

// Create MSW worker instance
export const worker = setupWorker(
  http.get('/api/analytics', async () => {
    console.log('MSW intercepted /api/analytics request');
    await delay(500); // Add a small delay to simulate network latency
    return HttpResponse.json(mockAnalytics);
  })
);

// Initialize MSW
if (import.meta.env.DEV) {
  console.log('Starting MSW worker');
  worker.start({
    onUnhandledRequest: 'bypass',
  }).catch(console.error);
}
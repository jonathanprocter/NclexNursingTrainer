import { setupWorker } from 'msw/browser';
import { http, HttpResponse, delay } from 'msw';
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

const handlers = [
  http.get('/api/analytics', async () => {
    try {
      console.log('🔶 MSW intercepting /api/analytics request');
      await delay(500);
      console.log('🔶 MSW returning mock data:', mockAnalytics);
      return HttpResponse.json(mockAnalytics);
    } catch (error) {
      console.error('❌ MSW handler error:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),
];

export const worker = setupWorker(...handlers);

export async function setupMockServiceWorker() {
  if (import.meta.env.DEV) {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      console.log('✅ Mock Service Worker started successfully');
    } catch (error) {
      console.error('❌ Mock Service Worker initialization failed:', error);
      throw error;
    }
  }
}
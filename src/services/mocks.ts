import { worker } from '@/mocks/browser';

export async function setupMocks() {
  if (import.meta.env.DEV) {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      console.log('🔶 MSW initialized successfully');
    } catch (error) {
      console.error('❌ MSW initialization failed:', error);
    }
  }
}

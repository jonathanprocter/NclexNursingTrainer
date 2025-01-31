import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';

async function initializeMockServiceWorker() {
  if (import.meta.env.DEV) {
    console.log('Initializing MSW...');
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
      });
      console.log('MSW initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MSW:', error);
    }
  }
}

// Initialize Query Client with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('status: 4')) {
          return false; // Don't retry client errors
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Initialize MSW and then render the app
initializeMockServiceWorker().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
});
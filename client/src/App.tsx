import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import Dashboard from './Dashboard'; // Assuming Dashboard component exists

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 max-w-sm bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <pre className="text-sm overflow-auto">{error.message}</pre>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gray-100">
            <h1>NCLEX Prep</h1>
            <Route path="/dashboard">
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </Route>
            {/* Rest of your application */}
          </div>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
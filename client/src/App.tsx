import React, { Component }
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again.</h1>;
    }
    return this.props.children;
  }
}, { Component }
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again.</h1>;
    }
    return this.props.children;
  }
} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import Dashboard from '@/pages/Dashboard';
import { Toaster } from '@/components/ui/toaster';

// Initialize Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Error Fallback Component
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
      <ErrorBoundary><ErrorBoundary><Router>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-background">
            <ErrorBoundary><ErrorBoundary><Routes>
              <ErrorBoundary><ErrorBoundary><Route 
                path="/" 
                element={
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Dashboard />
                  </ErrorBoundary>
                } 
              />
              <ErrorBoundary><ErrorBoundary><Route 
                path="/dashboard" 
                element={
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Dashboard />
                  </ErrorBoundary>
                } 
              />
            </Routes>
          </div>
          <Toaster />
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
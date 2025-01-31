import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { ErrorBoundary } from 'react-error-boundary';
import Dashboard from './pages/Dashboard';
import { Toaster } from '@/components/ui/toaster';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import NavBar from '@/components/layout/NavBar';

// Initialize Query Client with proper config
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

function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('🔷 App component mounted');
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-6 max-w-sm">
            <h2 className="text-xl font-bold text-destructive mb-4">Something went wrong</h2>
            <pre className="text-sm overflow-auto mb-4">{error.message}</pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try again
            </button>
          </Card>
        </div>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-foreground">
          <NavBar />
          <main className="container mx-auto px-4 py-6">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route>
                <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
                  <Card className="p-6 max-w-sm">
                    <h2 className="text-xl font-bold text-destructive mb-4">Page not found</h2>
                    <p className="text-muted-foreground mb-4">
                      The page you're looking for doesn't exist.
                    </p>
                    <a 
                      href="/"
                      className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    >
                      Go back home
                    </a>
                  </Card>
                </div>
              </Route>
            </Switch>
          </main>
          <Toaster />
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
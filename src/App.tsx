import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import Dashboard from './pages/Dashboard';
import { Toaster } from './components/ui/toaster';
import NavBar from './components/layout/NavBar';
import { Card } from './components/ui/card';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-6 max-w-sm">
        <h2 className="text-xl font-bold text-destructive mb-4">Something went wrong</h2>
        <pre className="text-sm overflow-auto">{error.message}</pre>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </Card>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <NavBar />
          <main className="container mx-auto px-4 py-6">
            <Suspense fallback={<LoadingSpinner />}>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/dashboard" component={Dashboard} />
                <Route>
                  <div className="min-h-screen flex items-center justify-center">
                    <Card className="p-6 max-w-sm">
                      <h2 className="text-xl font-bold text-destructive mb-4">Page not found</h2>
                      <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
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
            </Suspense>
          </main>
        </div>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
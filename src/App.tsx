import { Route, Switch } from 'wouter';
import { ErrorBoundary } from 'react-error-boundary';
import Dashboard from './pages/Dashboard';
import { Toaster } from './components/ui/toaster';
import NavBar from './components/layout/NavBar';
import { Card } from './components/ui/card';

// Error Fallback Component
function ErrorFallback({ error }: { error: Error }) {
  return (
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
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-6">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/dashboard/analytics" component={Dashboard} />
            <Route path="/dashboard/performance" component={Dashboard} />
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
        </ErrorBoundary>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
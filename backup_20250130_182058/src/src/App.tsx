import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import Dashboard from './pages/Dashboard';
import { Toaster } from './components/ui/toaster';
import NavBar from './components/layout/NavBar';
import InstructorDashboard from './components/dashboard/InstructorDashboard';

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
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <NavBar />
          <main className="container mx-auto px-4 py-6">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/dashboard/instructor" component={InstructorDashboard} />
              <Route>
                <ErrorFallback error={new Error('Page not found')} />
              </Route>
            </Switch>
          </main>
        </div>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
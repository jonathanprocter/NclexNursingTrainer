import { Route } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import NavBar from "@/components/layout/NavBar";
import Dashboard from "@/pages/Dashboard";
import Questions from "@/pages/Questions";
import QuestionBank from "@/pages/QuestionBank";
import Modules from "@/pages/Modules";
import StudyGuide from "@/pages/StudyGuide";
import AICompanion from "@/pages/tools/AICompanion";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 max-w-sm bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-destructive mb-4">Something went wrong</h2>
        <pre className="text-sm overflow-auto bg-muted p-2 rounded">
          {error.message}
        </pre>
        <button
          onClick={() => {
            resetErrorBoundary();
            toast({
              title: "Reset",
              description: "Attempting to recover from error",
            });
          }}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="container mx-auto py-6">
          <Route path="/" component={Dashboard} />
          <Route path="/questions" component={Questions} />
          <Route path="/question-bank" component={QuestionBank} />
          <Route path="/modules" component={Modules} />
          <Route path="/study-guide" component={StudyGuide} />
          <Route path="/tools/ai-companion" component={AICompanion} />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
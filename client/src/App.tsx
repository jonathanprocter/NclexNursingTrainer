import Questions from '@/pages/Questions';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Analytics from "@/components/dashboard/Analytics";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <Switch>
          {/* Use a more specific route for Questions */}
          <Route path="/questions" component={Questions} />
          {/* Make dashboard the home route */}
          <Route path="/" component={Analytics} />
          <Route path="/dashboard" component={Analytics} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
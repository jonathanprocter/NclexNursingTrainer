import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/layout/NavBar";
import QuestionBank from "@/pages/QuestionBank";
import { FloatingStudyBuddy } from "@/components/FloatingStudyBuddy";


function Router() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          {/* Root route redirects to questions */}
          <Route path="/">
            <QuestionBank />
          </Route>

          {/* Explicit questions route */}
          <Route path="/questions">
            <QuestionBank />
          </Route>

          {/* Fallback 404 */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </main>
      <FloatingStudyBuddy />
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
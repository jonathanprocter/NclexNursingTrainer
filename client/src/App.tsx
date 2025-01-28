import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/layout/NavBar";
import Home from "@/pages/Home";
import Modules from "@/pages/Modules";
import MockExams from "@/pages/practice/MockExams";
import Exam from "@/pages/practice/Exam";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          {/* Home Route */}
          <Route path="/" component={Home} />

          {/* Study Routes */}
          <Route path="/modules" component={Modules} />

          {/* Practice Routes */}
          <Route path="/practice/mock-exams" component={MockExams} />
          <Route path="/practice/exam/:type" component={Exam} />

          {/* Fallback to 404 */}
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
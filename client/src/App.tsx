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
import Quizzes from "@/pages/practice/Quizzes";
import PatientScenarios from "@/pages/practice/PatientScenarios";
import Simulation from "@/pages/practice/Simulation";
import StudyGuide from "@/pages/StudyGuide";

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
          <Route path="/study-guide" component={StudyGuide} />

          {/* Practice Routes */}
          <Route path="/practice/mock-exams" component={MockExams} />
          <Route path="/practice/exam/:type" component={Exam} />
          <Route path="/practice/quizzes" component={Quizzes} />
          <Route path="/practice/scenarios" component={PatientScenarios} />
          <Route path="/practice/simulation" component={Simulation} />

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
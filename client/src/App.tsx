import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/layout/NavBar";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";

// Dashboard Components
import Analytics from "@/components/dashboard/Analytics";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";

// Learning Module Components
import Pharmacology from "@/pages/modules/Pharmacology";
import ClinicalAnalysis from "@/pages/modules/ClinicalAnalysis";
import RiskReduction from "@/pages/modules/RiskReduction";
import ClinicalJudgment from "@/pages/modules/ClinicalJudgment";
import Calculations from "@/pages/modules/Calculations";
import Pathophysiology from "@/pages/modules/Pathophysiology";

// Practice Components
import Quizzes from "@/pages/practice/Quizzes";
import MockExams from "@/pages/practice/MockExams";
import PatientScenarios from "@/pages/practice/PatientScenarios";
import Simulation from "@/pages/practice/Simulation";

// Study Tools Components
import AICompanion from "@/pages/tools/AICompanion";
import SpacedRepetition from "@/pages/tools/SpacedRepetition";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          {/* Home Route */}
          <Route path="/" component={Home} />
          
          {/* Dashboard Route */}
          <Route path="/dashboard" component={Dashboard} />
          
          {/* Dashboard Sub-Routes */}
          <Route path="/dashboard/analytics" component={Analytics} />
          <Route path="/dashboard/performance" component={PerformanceMetrics} />
          <Route path="/dashboard/instructor" component={InstructorDashboard} />

          {/* Learning Module Routes */}
          <Route path="/modules/pharmacology" component={Pharmacology} />
          <Route path="/modules/clinical-analysis" component={ClinicalAnalysis} />
          <Route path="/modules/risk-reduction" component={RiskReduction} />
          <Route path="/modules/clinical-judgment" component={ClinicalJudgment} />
          <Route path="/modules/calculations" component={Calculations} />
          <Route path="/modules/pathophysiology" component={Pathophysiology} />

          {/* Practice Routes */}
          <Route path="/practice/quizzes" component={Quizzes} />
          <Route path="/practice/mock-exams" component={MockExams} />
          <Route path="/practice/scenarios" component={PatientScenarios} />
          <Route path="/practice/simulation" component={Simulation} />

          {/* Study Tools Routes */}
          <Route path="/tools/ai-companion" component={AICompanion} />
          <Route path="/tools/spaced-repetition" component={SpacedRepetition} />

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
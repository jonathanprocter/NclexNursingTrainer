import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/layout/NavBar";
import Home from "@/pages/Home";
import TopicDetail from "@/components/nclex/TopicDetail";
import { FloatingStudyBuddy } from "@/components/FloatingStudyBuddy";
import Analytics from "@/components/dashboard/Analytics";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import AICompanion from "@/pages/tools/AICompanion";
import SpacedRepetition from "@/pages/tools/SpacedRepetition";
import StudyGuide from "@/pages/StudyGuide";

function Router() {
  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard/analytics" component={Analytics} />
          <Route path="/dashboard/performance" component={PerformanceMetrics} />
          <Route path="/dashboard/instructor" component={InstructorDashboard} />
          <Route path="/study-guide/topic/:id" component={TopicDetail} />
          <Route path="/study-guide" component={StudyGuide} />
          <Route path="/tools/ai-companion" component={AICompanion} />
          <Route path="/tools/spaced-repetition" component={SpacedRepetition} />
          <Route component={NotFound} />
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
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Analytics from "@/components/dashboard/Analytics";
import PracticeHistory from "@/components/dashboard/PracticeHistory";
import ProgressDisplay from "@/components/dashboard/ProgressDisplay";
import { useQuery } from "@tanstack/react-query";
import type { AnalyticsData } from "@/types/analytics";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <nav className="flex items-center space-x-4">
            <Link href="/practice">
              <a className="text-sm font-medium hover:text-primary">Practice Questions</a>
            </Link>
            <Link href="/simulations">
              <a className="text-sm font-medium hover:text-primary">Simulations</a>
            </Link>
          </nav>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="practice">Practice History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <ProgressDisplay
                  title="Overall Progress"
                  value={analytics?.averageScore || 0}
                  subtitle="Based on all practice sessions"
                  variant={
                    analytics?.averageScore >= 80 ? 'success' :
                    analytics?.averageScore >= 65 ? 'warning' : 'danger'
                  }
                />
                <ProgressDisplay
                  title="Questions Attempted"
                  value={analytics?.questionsAttempted || 0}
                  target={500}
                  showPercentage={false}
                />
                <ProgressDisplay
                  title="Study Time"
                  value={parseInt(analytics?.totalStudyTime || '0')}
                  target={40}
                  subtitle="Hours spent studying"
                  showPercentage={false}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Analytics />
                <PracticeHistory />
              </div>

              {children}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="p-6">
              <Analytics />
            </Card>
          </TabsContent>

          <TabsContent value="practice">
            <Card className="p-6">
              <PracticeHistory />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
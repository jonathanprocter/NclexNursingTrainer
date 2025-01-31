import { Link } from "wouter";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Analytics from "../dashboard/Analytics";
import PracticeHistory from "../dashboard/PracticeHistory";
import ProgressDisplay from "../dashboard/ProgressDisplay";
import { useQuery } from "@tanstack/react-query";
import type { AnalyticsData } from "../../types/analytics";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    staleTime: 30000
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <nav className="flex items-center space-x-4">
              <Link href="/practice">
                <span className="text-sm font-medium hover:text-primary cursor-pointer">
                  Practice Questions
                </span>
              </Link>
              <Link href="/simulations">
                <span className="text-sm font-medium hover:text-primary cursor-pointer">
                  Simulations
                </span>
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
              {children}
            </TabsContent>

            <TabsContent value="performance">
              <Card className="p-6">
                {analytics && <Analytics analytics={analytics} />}
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
    </div>
  );
}
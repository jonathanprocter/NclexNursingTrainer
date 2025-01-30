import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Progress } from "../components/ui/progress";
import Analytics from "../components/dashboard/Analytics";
import PerformanceMetrics from "../components/dashboard/PerformanceMetrics";
import InstructorDashboard from "../components/dashboard/InstructorDashboard";
import { useQuery } from "@tanstack/react-query";
import { useBreakpoint } from "../hooks/use-mobile";
import { fetchAnalytics } from "../lib/ai-services";
import type { AnalyticsData } from "../types/analytics";
import { memo } from "react";

const LoadingSkeleton = () => (
  <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6 lg:p-8 animate-pulse">
    <Card>
      <CardHeader>
        <div className="h-6 bg-muted rounded w-1/3"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ErrorDisplay = memo(({ error }: { error: Error }) => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center space-y-4">
      <p className="text-destructive">
        {error.message}
      </p>
      <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
    </div>
  </div>
));

const PerformanceOverview = memo(({ analytics }: { analytics: AnalyticsData }) => (
  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl">Performance Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-medium">{analytics.averageScore}%</span>
        </div>
        <Progress value={analytics.averageScore} className="h-2" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Study Time</p>
            <p className="text-lg font-semibold">{analytics.totalStudyTime}h</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Questions</p>
            <p className="text-lg font-semibold">{analytics.questionsAttempted}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
));

export default function Dashboard() {
  const { isMobile, isTablet } = useBreakpoint();

  const { data: analytics, isError, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics", "1"],
    queryFn: () => fetchAnalytics('1'),
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('status: 4')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError && error instanceof Error) {
    return <ErrorDisplay error={error} />;
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6 lg:p-8">
      <PerformanceOverview analytics={analytics} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Domain Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: isMobile ? 250 : isTablet ? 300 : 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.performanceData}
                  margin={{
                    top: 5,
                    right: isMobile ? 10 : 20,
                    bottom: isMobile ? 60 : 40,
                    left: isMobile ? 30 : 40
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="domain"
                    angle={isMobile ? -45 : -30}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: isMobile ? 8 : 10 }}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  />
                  <Bar
                    dataKey="mastery"
                    fill="hsl(var(--primary))"
                    name="Domain Mastery"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="w-full flex flex-wrap md:flex-nowrap">
          <TabsTrigger value="analytics" className="flex-1">Detailed Analytics</TabsTrigger>
          <TabsTrigger value="performance" className="flex-1">Performance Metrics</TabsTrigger>
          <TabsTrigger value="instructor" className="flex-1">Instructor View</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Analytics data={analytics} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMetrics data={analytics} />
        </TabsContent>

        <TabsContent value="instructor">
          <InstructorDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
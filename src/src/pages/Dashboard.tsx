import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useBreakpoint } from "../hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import Analytics from "../components/dashboard/Analytics";
import type { AnalyticsData } from "../types/analytics";
import { fetchAnalytics } from "../lib/ai-services";
import { memo } from "react";

const PerformanceOverview = memo(({ analytics }: { analytics: AnalyticsData }) => (
  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl">Performance Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">Study Time</p>
          <p className="text-lg font-semibold">{analytics.totalStudyTime}h</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Questions</p>
          <p className="text-lg font-semibold">{analytics.questionsAttempted}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Average Score</p>
          <p className="text-lg font-semibold">{analytics.averageScore}%</p>
        </div>
      </div>
    </CardContent>
  </Card>
));

function Dashboard() {
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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-destructive/10 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-destructive mb-4">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
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
      <Analytics analytics={analytics} />
    </div>
  );
}

export default memo(Dashboard);
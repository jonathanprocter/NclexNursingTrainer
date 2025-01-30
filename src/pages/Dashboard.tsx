import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Analytics from "@/components/dashboard/Analytics";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { memo } from "react";
import type { AnalyticsData } from "@/types/analytics";

interface PerformanceOverviewProps {
  analytics: AnalyticsData;
}

const PerformanceOverview = memo(({ analytics }: PerformanceOverviewProps) => (
  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl">Performance Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">Study Time</p>
          <p className="text-lg font-semibold">{analytics.totalStudyTime}</p>
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

const PerformanceOverviewSkeleton = () => (
  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

function Dashboard() {
  const apiUrl = `http://${window.location.hostname}:4004`;

  const { data: analytics, isError, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      try {
        const response = await axios.get<AnalyticsData>(`${apiUrl}/api/analytics`, {
          withCredentials: true,
          timeout: 5000
        });
        return response.data;
      } catch (err) {
        console.error('Error fetching analytics:', err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 30000
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6 lg:p-8">
        <PerformanceOverviewSkeleton />
        <div className="h-[400px] bg-muted/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-destructive/10 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Error loading dashboard</h2>
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

PerformanceOverview.displayName = "PerformanceOverview";
PerformanceOverviewSkeleton.displayName = "PerformanceOverviewSkeleton";

export default memo(Dashboard);
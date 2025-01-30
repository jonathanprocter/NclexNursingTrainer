import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Analytics from "@/components/dashboard/Analytics";
import { AnalyticsData } from "@/types/analytics";
import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

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
  const { data: analyticsResponse, isError, isLoading, error } = useQuery({
    queryKey: ["analytics", "user", "1"], // Using a static userId for now
    queryFn: async () => {
      try {
        console.log('Fetching analytics data...');
        const baseUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:4005`;
        console.log('Using API URL:', baseUrl);

        const response = await axios.get<{ success: boolean; data: AnalyticsData; error?: string }>(
          `${baseUrl}/api/analytics/1`
        );

        console.log('Received analytics response:', response.data);

        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch analytics');
        }

        return response.data.data;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
      }
    }
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
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (!analyticsResponse) {
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
      <PerformanceOverview analytics={analyticsResponse} />
      <Analytics analytics={analyticsResponse} />
    </div>
  );
}

PerformanceOverview.displayName = "PerformanceOverview";
PerformanceOverviewSkeleton.displayName = "PerformanceOverviewSkeleton";

export default memo(Dashboard);
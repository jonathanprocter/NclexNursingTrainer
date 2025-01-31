import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Analytics from "@/components/dashboard/Analytics";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsData } from "@/types/analytics";
import { memo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "react-error-boundary";

const PerformanceOverview = memo(({ analytics }: { analytics: AnalyticsData }) => {
  useEffect(() => {
    console.log('🔷 PerformanceOverview mounted with analytics:', analytics);
  }, [analytics]);

  return (
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
  );
});

function DashboardContent() {
  useEffect(() => {
    console.log('🔷 DashboardContent mounted');
  }, []);

  const { data: analytics, isError, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      console.log('🔷 Starting analytics fetch');
      try {
        const response = await fetch('/api/analytics', {
          headers: {
            'Accept': 'application/json',
          },
        });
        console.log('🔷 Response status:', response.status);
        if (!response.ok) {
          console.error('🔷 API error:', response.status, response.statusText);
          throw new Error(`Failed to fetch analytics: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('🔷 Successfully received analytics data:', data);
        return data;
      } catch (err) {
        console.error('🔷 Error fetching analytics:', err);
        throw err;
      }
    },
  });

  useEffect(() => {
    console.log('🔷 DashboardContent state updated:', { isLoading, isError, analytics, error });
  }, [isLoading, isError, analytics, error]);

  if (isLoading) {
    console.log('🔷 Rendering loading state');
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    console.error('🔷 Rendering error state:', error);
    return (
      <Card className="bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load dashboard"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    console.log('🔷 No analytics data available');
    return null;
  }

  console.log('🔷 Rendering dashboard with analytics');
  return (
    <div className="space-y-4 sm:space-y-6">
      <PerformanceOverview analytics={analytics} />
      <Analytics analytics={analytics} />
    </div>
  );
}

export default function Dashboard() {
  useEffect(() => {
    console.log('🔷 Dashboard page mounted');
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => {
        console.error('🔷 Dashboard Error Boundary caught error:', error);
        return (
          <div className="p-4 bg-destructive/10 rounded-md">
            <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
            <p className="text-sm text-destructive">{error.message}</p>
          </div>
        );
      }}
    >
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ErrorBoundary>
  );
}

PerformanceOverview.displayName = "PerformanceOverview";
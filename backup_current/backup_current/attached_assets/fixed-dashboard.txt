import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Analytics from "@/components/dashboard/Analytics";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsData } from "@/types/analytics";
import { memo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "react-error-boundary";

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

function DashboardContent() {
  const { data: analytics, isError, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
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
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PerformanceOverview analytics={analytics} />
      <Analytics analytics={analytics} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <div className="p-4 bg-destructive/10 rounded-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      )}
    >
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ErrorBoundary>
  );
}

PerformanceOverview.displayName = "PerformanceOverview";
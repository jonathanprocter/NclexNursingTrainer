import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Analytics from "@/components/dashboard/Analytics";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsData } from "@/types/analytics";
import { memo } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const PerformanceOverview = memo(({ analytics }: { analytics: AnalyticsData }) => (
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

function DashboardContent() {
  // Mock analytics data for initial development
  const mockAnalytics: AnalyticsData = {
    performanceData: [
      { domain: "Pharmacology", mastery: 85 },
      { domain: "Medical-Surgical", mastery: 78 },
      { domain: "Pediatrics", mastery: 92 },
      { domain: "Mental Health", mastery: 88 },
      { domain: "Maternal Care", mastery: 82 }
    ],
    totalStudyTime: "24h",
    questionsAttempted: 150,
    averageScore: 85
  };

  const { data: analytics, isError, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return mockAnalytics; // Fallback to mock data if API fails
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000
  });

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-4 sm:space-y-6 p-4 md:p-6 lg:p-8">
        <PerformanceOverviewSkeleton />
        <div className="h-[400px] bg-muted/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (isError && !analytics) {
    return (
      <div className="container mx-auto p-4">
        <div className="p-4 bg-destructive/10 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Error loading dashboard</h2>
          <p className="text-sm text-destructive mb-4">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayData = analytics || mockAnalytics;

  return (
    <div className="container mx-auto space-y-4 sm:space-y-6 p-4 md:p-6 lg:p-8">
      <PerformanceOverview analytics={displayData} />
      <Analytics analytics={displayData} />
    </div>
  );
}

PerformanceOverview.displayName = "PerformanceOverview";
PerformanceOverviewSkeleton.displayName = "PerformanceOverviewSkeleton";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <DashboardContent />
      </ErrorBoundary>
    </DashboardLayout>
  );
}
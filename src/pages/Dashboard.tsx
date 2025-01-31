import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Analytics from "../components/dashboard/Analytics";
import { Skeleton } from "../components/ui/skeleton";
import type { AnalyticsData } from "../types/analytics";
import { memo } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";

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

function DashboardContent() {
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
    queryFn: () => Promise.resolve(mockAnalytics),
    staleTime: 30000
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-[200px] w-full" /></div>;
  }

  if (isError) {
    return (
      <div className="p-4 bg-destructive/10 rounded-md">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load dashboard"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PerformanceOverview analytics={analytics || mockAnalytics} />
      <Analytics analytics={analytics || mockAnalytics} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}

PerformanceOverview.displayName = "PerformanceOverview";
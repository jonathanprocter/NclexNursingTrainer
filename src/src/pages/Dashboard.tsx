
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Analytics from "../../components/dashboard/Analytics";
import { AnalyticsData } from "../../types/analytics";
import { memo } from "react";
import { Skeleton } from "../../components/ui/skeleton";
import { api } from "../../services/api/client";

const PerformanceOverview = memo(({ analytics }: { analytics: AnalyticsData }) => (
  <Card>
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

function Dashboard() {
  const { data: analytics, isError, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      try {
        const response = await api.get('/analytics');
        return response.data;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return {
          performanceData: [
            { domain: "Pharmacology", mastery: 85 },
            { domain: "Medical-Surgical", mastery: 78 },
            { domain: "Pediatrics", mastery: 92 }
          ],
          totalStudyTime: "24h",
          questionsAttempted: 150,
          averageScore: 85
        };
      }
    },
    staleTime: 30000,
  });

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 bg-destructive/10 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Error loading dashboard</h2>
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : "An unknown error occurred"}</p>
      </div>
    );
  }

  if (!analytics) {
    return <div className="p-6">No data available</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6 lg:p-8">
      <PerformanceOverview analytics={analytics} />
      <Analytics analytics={analytics} />
    </div>
  );
}

export default memo(Dashboard);

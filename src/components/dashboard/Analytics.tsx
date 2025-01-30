
import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AnalyticsData } from "../../types/analytics";

function Analytics() {
  const { data: analytics, isError, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="w-full h-[400px] animate-pulse">
        <CardHeader>
          <div className="h-6 w-1/3 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error Loading Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load analytics data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics?.performanceData) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="domain" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="mastery" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(Analytics);

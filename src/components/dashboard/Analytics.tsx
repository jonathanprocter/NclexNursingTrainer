import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ErrorBoundary } from "react-error-boundary";
import type { AnalyticsData } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceChartProps {
  data: AnalyticsData['performanceData'];
}

const PerformanceChart = memo(({ data }: PerformanceChartProps) => {
  if (!data?.length) return null;

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="domain" 
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: number) => [`${value}%`, "Mastery"]}
            labelStyle={{ color: 'var(--foreground)' }}
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="mastery" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

interface AnalyticsProps {
  analytics: AnalyticsData;
}

function Analytics({ analytics }: AnalyticsProps) {
  if (!analytics?.performanceData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Start practicing to see your performance analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Analytics Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive mb-4">{error.message}</p>
            <button
              onClick={resetErrorBoundary}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      )}
      onReset={() => window.location.reload()}
    >
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="breakdown">Domain Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={analytics.performanceData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Domain Mastery Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.performanceData.map((item) => (
                  <div key={item.domain} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.domain}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 ease-in-out"
                          style={{ width: `${item.mastery}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium min-w-[3rem] text-right">
                        {item.mastery}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ErrorBoundary>
  );
}

PerformanceChart.displayName = "PerformanceChart";

export default memo(Analytics);
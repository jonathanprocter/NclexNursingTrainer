import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { memo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { AnalyticsData } from "../../types/analytics";

interface AnalyticsProps {
  analytics: AnalyticsData;
}

function Analytics({ analytics }: AnalyticsProps) {
  if (!analytics?.performanceData) {
    return <div>Loading analytics data...</div>;
  }

  return (
    <div className="space-y-4">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          window.location.reload();
        }}
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
        </Tabs>
      </ErrorBoundary>
    </div>
  );
}

const ErrorFallback = memo(({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="p-4 bg-destructive/10 rounded-md">
    <h2 className="text-lg font-semibold mb-2">Something went wrong:</h2>
    <p className="text-sm text-destructive mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
    >
      Try again
    </button>
  </div>
));

const PerformanceChart = memo(({ data }: { data: AnalyticsData['performanceData'] }) => (
  <div className="h-[400px] w-full">
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="domain" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line type="monotone" dataKey="mastery" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
));

function Analytics({ analytics }: AnalyticsProps) {
  if (!analytics) {
    return <div>Loading analytics data...</div>;
  }
  return (
    <div className="space-y-4">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          window.location.reload();
        }}
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
                            className="h-full bg-primary"
                            style={{ width: `${item.mastery}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.mastery}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ErrorBoundary>
    </div>
  );
}

ErrorFallback.displayName = "ErrorFallback";
PerformanceChart.displayName = "PerformanceChart";

export default memo(Analytics);
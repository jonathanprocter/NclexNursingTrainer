import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useBreakpoint } from "../../hooks/use-mobile";
import { fetchAnalytics } from "@/lib/ai-services";
import { useQuery } from "@tanstack/react-query";
import type { AnalyticsData } from "@/types/analytics";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "react-error-boundary";

const DEFAULT_ANALYTICS: AnalyticsData = {
  performanceData: [
    { domain: "Clinical Judgment", mastery: 75 },
    { domain: "Patient Safety", mastery: 80 },
    { domain: "Care Management", mastery: 65 },
    { domain: "Health Promotion", mastery: 70 }
  ],
  totalStudyTime: "0",
  questionsAttempted: 0,
  averageScore: 0
};

interface AnalyticsProps {
  data?: AnalyticsData;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
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
  );
}

function AnalyticsContent({ data: propsData }: AnalyticsProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const { toast } = useToast();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['analytics', 'user', '1'],
    queryFn: () => fetchAnalytics('1'),
    retry: (failureCount, err) => {
      if (err instanceof Error && err.message.includes('status: 4')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 30000,
    gcTime: 300000,
    onError: (err) => {
      toast({
        title: "Error loading analytics",
        description: err instanceof Error ? err.message : "Failed to load analytics data",
        variant: "destructive",
      });
    }
  });

  const analyticsData = propsData || fetchedData || DEFAULT_ANALYTICS;
  const chartHeight = isMobile ? 250 : isTablet ? 300 : 350;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 animate-pulse">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !propsData) {
    return (
      <div className="p-4 bg-destructive/10 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Error loading analytics</h2>
        <p className="text-sm text-destructive mb-4">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Module Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: chartHeight }} className={isMobile ? '-mx-2 sm:-mx-4' : ''}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.performanceData}
                margin={{ 
                  top: 5, 
                  right: isMobile ? 10 : 20, 
                  bottom: isMobile ? 60 : 40, 
                  left: isMobile ? 5 : 0 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="domain" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  angle={isMobile ? -45 : -30}
                  textAnchor="end"
                  height={isMobile ? 80 : 60}
                  interval={0}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: isMobile ? 12 : 14 }}
                  width={40}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Mastery Level']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Bar
                  dataKey="mastery"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Mastery Level"
                  aria-label="Module mastery level"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Study Time</p>
              <p className="text-2xl font-bold">{analyticsData.totalStudyTime} hours</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Questions Attempted</p>
              <p className="text-2xl font-bold">{analyticsData.questionsAttempted}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{analyticsData.averageScore}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Analytics(props: AnalyticsProps) {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Refetch data when the user clicks "Try again"
        window.location.reload();
      }}
    >
      <AnalyticsContent {...props} />
    </ErrorBoundary>
  );
}
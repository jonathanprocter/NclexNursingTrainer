import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { memo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { AnalyticsData } from "../../types/analytics";
import AnalyticsContent from "./AnalyticsContent";
import PerformanceMetrics from "./PerformanceMetrics";
import InstructorDashboard from "./InstructorDashboard";

interface AnalyticsProps {
  analytics: AnalyticsData;
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

function Analytics({ analytics }: AnalyticsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          window.location.reload();
        }}
      >
        <AnalyticsContent data={analytics} />
      </ErrorBoundary>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="w-full flex flex-wrap md:flex-nowrap">
          <TabsTrigger value="performance" className="flex-1">Performance Details</TabsTrigger>
          <TabsTrigger value="instructor" className="flex-1">Instructor View</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceMetrics data={analytics} />
        </TabsContent>

        <TabsContent value="instructor">
          <InstructorDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default memo(Analytics);

const Dashboard = () => {
  const { isMobile, isTablet } = useBreakpoint();

  const { data: analytics, isError, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics", "1"],
    queryFn: () => fetchAnalytics('1'),
    retry: (failureCount, error) => {
      //Improved retry logic:  Only retry if the error is not a 4xx client error
      if (error instanceof Error && error.message.includes('status: 4')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><p>Loading...</p></div>; //Simple loading indicator
  }

  if (isError) {
    return (
      <div className="p-4 bg-destructive/10 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Something went wrong:</h2>
        <p className="text-sm text-destructive mb-4">{error?.message || "An unknown error occurred"}</p>
      </div>
    );
  }

  if (!analytics) {
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
      <PerformanceOverview analytics={analytics} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Domain Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: isMobile ? 250 : isTablet ? 300 : 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.performanceData}
                  margin={{
                    top: 5,
                    right: isMobile ? 10 : 20,
                    bottom: isMobile ? 60 : 40,
                    left: isMobile ? 30 : 40
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="domain"
                    angle={isMobile ? -45 : -30}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: isMobile ? 8 : 10 }}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  />
                  <Bar
                    dataKey="mastery"
                    fill="hsl(var(--primary))"
                    name="Domain Mastery"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Analytics analytics={analytics} />
    </div>
  );
};

export default Dashboard;

//Improved fetchAnalytics function with error handling and better retry strategy
const fetchAnalytics = async (id: string): Promise<AnalyticsData> => {
  try {
    const response = await fetch(`/api/analytics/${id}`); // Replace with your actual API endpoint
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed with status ${response.status}: ${errorData.message || "Unknown error"}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`); //re-throw for better error handling in useQuery
    } else {
      throw new Error("An unknown error occurred while fetching analytics.");
    }
  }
};

const PerformanceOverview = ({ analytics }: { analytics: AnalyticsData }) => {
  return <div>Performance Overview</div>;
};
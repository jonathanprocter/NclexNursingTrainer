import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Analytics from "../components/dashboard/Analytics";
import PerformanceMetrics from "../components/dashboard/PerformanceMetrics";
import InstructorDashboard from "../components/dashboard/InstructorDashboard";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Progress } from "../components/ui/progress";
import { useBreakpoint } from "../hooks/use-mobile";

interface AnalyticsData {
  performanceData: {
    domain: string;
    mastery: number;
  }[];
  totalStudyTime: string;
  questionsAttempted: number;
  averageScore: number;
}

export default function Dashboard() {
  const { isMobile, isTablet } = useBreakpoint();

  const { data: analytics, isError, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://0.0.0.0:4002'
        : '';

      try {
        const response = await fetch(`${baseUrl}/api/analytics/user/1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
          performanceData: data?.performanceData || studentProgress.nclexDomains,
          totalStudyTime: data?.totalStudyTime || "0",
          questionsAttempted: data?.questionsAttempted || 0,
          averageScore: data?.averageScore || studentProgress.predictedPassRate,
        };
      } catch (error) {
        console.error("Analytics fetch error:", error);
        throw new Error("Failed to fetch analytics data");
      }
    },
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const studentProgress = {
    name: "Bianca",
    strengths: ["Clinical Judgment", "Patient Safety"],
    areasForGrowth: ["Pharmacology", "Risk Management"],
    predictedPassRate: 85,
    recentProgress: [
      { week: "Week 1", score: 72 },
      { week: "Week 2", score: 78 },
      { week: "Week 3", score: 83 },
      { week: "Week 4", score: 85 },
    ],
    nclexDomains: [
      { domain: "Clinical Judgment", mastery: 88 },
      { domain: "Patient Safety", mastery: 85 },
      { domain: "Pharmacology", mastery: 72 },
      { domain: "Risk Management", mastery: 75 },
      { domain: "Care Management", mastery: 82 },
      { domain: "Health Promotion", mastery: 80 },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <p className="text-destructive">
            {error instanceof Error ? error.message : 'Failed to load dashboard data'}
          </p>
          <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const chartHeight = isMobile ? 250 : isTablet ? 300 : 350;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl lg:text-3xl">Welcome back, {studentProgress.name}! 🌟</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
              You're making excellent progress! Your strengths in {studentProgress.strengths.join(" and ")} are really showing.
              Let's focus on strengthening {studentProgress.areasForGrowth.join(" and ")} to boost your overall performance.
            </p>

            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-sm md:text-base lg:text-lg">Today's AI Study Plan:</h3>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>Review {studentProgress.areasForGrowth[0]} fundamentals (45 mins)</li>
                <li>Practice {studentProgress.areasForGrowth[1]} scenarios (30 mins)</li>
                <li>Quick review of your strong areas to maintain mastery (15 mins)</li>
              </ul>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm md:text-base">Predicted NCLEX Pass Rate</span>
                <span className="text-green-600 dark:text-green-400 font-bold">
                  {studentProgress.predictedPassRate}%
                </span>
              </div>
              <Progress value={studentProgress.predictedPassRate} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Progress Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: chartHeight }} className={isMobile ? '-mx-4' : ''}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentProgress.recentProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: isMobile ? 12 : 14 }} 
                    height={40}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                    width={40}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    name="Weekly Score"
                    strokeWidth={2}
                    dot={{ strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">NCLEX Domain Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: chartHeight }} className={isMobile ? '-mx-4' : ''}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentProgress.nclexDomains}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="domain" 
                    angle={isMobile ? -45 : -30} 
                    textAnchor="end" 
                    height={100}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    interval={0}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: isMobile ? 12 : 14 }}
                    width={40}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="mastery" 
                    fill="hsl(var(--primary))" 
                    name="Domain Mastery"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="w-full flex flex-wrap md:flex-nowrap">
          <TabsTrigger value="analytics" className="flex-1">Detailed Analytics</TabsTrigger>
          <TabsTrigger value="performance" className="flex-1">Performance Metrics</TabsTrigger>
          <TabsTrigger value="instructor" className="flex-1">Instructor View</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Analytics data={analytics} />
        </TabsContent>

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
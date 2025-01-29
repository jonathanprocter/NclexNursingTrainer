import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Analytics from "../components/dashboard/Analytics";
import PerformanceMetrics from "../components/dashboard/PerformanceMetrics";
import InstructorDashboard from "../components/dashboard/InstructorDashboard";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Progress } from "../components/ui/progress";

export default function Dashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/user/1"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/user/1");
      return response.json();
    }
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
      { week: "Week 4", score: 85 }
    ],
    nclexDomains: [
      { domain: "Clinical Judgment", mastery: 88 },
      { domain: "Patient Safety", mastery: 85 },
      { domain: "Pharmacology", mastery: 72 },
      { domain: "Risk Management", mastery: 75 },
      { domain: "Care Management", mastery: 82 },
      { domain: "Health Promotion", mastery: 80 }
    ]
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back, {studentProgress.name}! 🌟</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You're making excellent progress! Your strengths in {studentProgress.strengths.join(" and ")} are really showing.
              Let's focus on strengthening {studentProgress.areasForGrowth.join(" and ")} to boost your overall performance.
            </p>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Today's AI Study Plan:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Review {studentProgress.areasForGrowth[0]} fundamentals (45 mins)</li>
                <li>Practice {studentProgress.areasForGrowth[1]} scenarios (30 mins)</li>
                <li>Quick review of your strong areas to maintain mastery (15 mins)</li>
              </ul>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Predicted NCLEX Pass Rate</span>
                <span className="text-green-600 font-bold">{studentProgress.predictedPassRate}%</span>
              </div>
              <Progress value={studentProgress.predictedPassRate} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progress Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentProgress.recentProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>NCLEX Domain Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentProgress.nclexDomains}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="mastery" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="instructor">Instructor View</TabsTrigger>
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
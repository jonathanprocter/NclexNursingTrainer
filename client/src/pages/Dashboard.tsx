
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Analytics from "@/components/dashboard/Analytics";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/user/1"],
  });

  const studentProgress = {
    name: "Bianca",
    strengths: ["Critical Care", "Pharmacology"],
    areasForGrowth: ["Med-Surg", "Mental Health"],
    predictedPassRate: 88,
    progressData: [
      { date: "Week 1", score: 75 },
      { date: "Week 2", score: 82 },
      { date: "Week 3", score: 85 },
      { date: "Week 4", score: 88 }
    ],
    domainProgress: [
      { domain: "Patient Care", current: 85, previous: 80 },
      { domain: "Safety & Infection", current: 78, previous: 72 },
      { domain: "Health Promotion", current: 92, previous: 88 },
      { domain: "Psychosocial", current: 70, previous: 65 },
      { domain: "Basic Care", current: 88, previous: 82 },
      { domain: "Risk Reduction", current: 82, previous: 75 }
    ]
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back, {studentProgress.name}! 🌟</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Your dedication is showing results! You're excelling in {studentProgress.strengths.join(" and ")}.
            Focus on strengthening your knowledge in {studentProgress.areasForGrowth.join(" and ")} to boost your overall performance.
          </p>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">AI Study Planner Recommendations:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prioritize {studentProgress.areasForGrowth[0]} practice questions</li>
              <li>Review {studentProgress.areasForGrowth[1]} core concepts</li>
              <li>Continue excelling in {studentProgress.strengths[0]}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentProgress.progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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

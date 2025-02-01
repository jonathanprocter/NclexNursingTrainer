import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsProps {
  data?: any;
}

export default function Analytics({ data }: AnalyticsProps) {
  // Use provided data or fallback to mock data
  const performanceData = data?.modulePerformance || [
    { module: "Pharmacology", score: 85 },
    { module: "Pathophysiology", score: 75 },
    { module: "Assessment", score: 90 },
    { module: "Fundamentals", score: 82 },
    { module: "Psychiatric", score: 88 },
    { module: "Med-Surg", score: 78 },
  ];

  const studyStats = data?.studyStats || {
    totalStudyTime: "45.5 hours",
    questionsAttempted: 428,
    averageScore: "82%"
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Module Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="module" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" />
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
              <p className="text-2xl font-bold">{studyStats.totalStudyTime}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Questions Attempted</p>
              <p className="text-2xl font-bold">{studyStats.questionsAttempted}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{studyStats.averageScore}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsProps {
  data?: {
    performanceData?: Array<{ module: string; score: number }>;
    totalStudyTime?: string;
    questionsAttempted?: number;
    averageScore?: number;
  };
}

export default function Analytics({ data }: AnalyticsProps) {
  const mockPerformanceData = [
    { module: "Pharmacology", score: 85 },
    { module: "Pathophysiology", score: 75 },
    { module: "Med-Surg", score: 78 },
    { module: "Mental Health", score: 82 }
  ];

  const performanceData = data?.performanceData || mockPerformanceData;

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
              <p className="text-2xl font-bold">{data?.totalStudyTime || "45.5"} hours</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Questions Attempted</p>
              <p className="text-2xl font-bold">{data?.questionsAttempted || "428"}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{data?.averageScore || "82"}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

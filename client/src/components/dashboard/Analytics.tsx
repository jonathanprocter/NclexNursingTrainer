
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsData {
  module: string;
  score: number;
}

interface AnalyticsProps {
  data?: {
    performanceData?: AnalyticsData[];
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

  const performanceData = data?.performanceData?.length ? data.performanceData : mockPerformanceData;
  const totalStudyTime = data?.totalStudyTime || "45.5";
  const questionsAttempted = data?.questionsAttempted || 428;
  const averageScore = data?.averageScore || 82;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Module Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="module" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
              <p className="text-2xl font-bold">{totalStudyTime} hours</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Questions Attempted</p>
              <p className="text-2xl font-bold">{questionsAttempted}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{averageScore}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

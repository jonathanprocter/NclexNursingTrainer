import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsProps {
  data: any;
}

export default function Analytics({ data }: AnalyticsProps) {
  const mockPerformanceData = [
    { module: "Pharmacology", score: 85 },
    { module: "Pathophysiology", score: 75 },
    { module: "Assessment", score: 90 },
    { module: "Fundamentals", score: 82 },
    { module: "Psychiatric", score: 88 },
    { module: "Med-Surg", score: 78 },
  ];

  const analyticsData = data?.performanceData || mockPerformanceData;
  const studyTime = data?.totalStudyTime || "45.5";
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
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="module" 
                  tick={{ fontSize: 12 }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Score']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Bar
                  dataKey="score"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="Score"
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
              <p className="text-2xl font-bold">{studyTime} hours</p>
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'

interface PerformanceData {
  domain: string;
  mastery: number;
}

interface AnalyticsData {
  performanceData: PerformanceData[];
  totalStudyTime: string;
  questionsAttempted: number;
  averageScore: number;
}

interface AnalyticsProps {
  data?: AnalyticsData;
}

export default function Analytics({ data }: AnalyticsProps) {
  if (!data) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Module Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Study Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted animate-pulse h-20 rounded-lg"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performanceData = data.performanceData || [
    { domain: "Pharmacology", mastery: 85 },
    { domain: "Pathophysiology", mastery: 75 },
    { domain: "Med-Surg", mastery: 78 },
    { domain: "Mental Health", mastery: 82 },
  ];

  const totalStudyTime = data.totalStudyTime ?? "45.5"
  const questionsAttempted = data.questionsAttempted ?? 428
  const averageScore = data.averageScore ?? 82

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Module Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="mastery"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
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
  )
}
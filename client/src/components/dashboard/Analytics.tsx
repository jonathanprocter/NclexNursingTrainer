import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useBreakpoint } from "../../hooks/use-mobile";

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

export default function Analytics({ data }: AnalyticsProps) {
  const { isMobile, isTablet } = useBreakpoint();

  // Use default data if not provided or if there's an error
  const analyticsData = data || DEFAULT_ANALYTICS;
  const chartHeight = isMobile ? 250 : isTablet ? 300 : 350;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Module Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: chartHeight }} className={isMobile ? '-mx-4' : ''}>
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
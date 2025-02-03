import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PerformanceMetricsProps {
  data: any;
}

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const mockMetrics = [
    {
      category: "Clinical Judgment",
      score: 85,
      status: "Strong",
      details: ["Strong cue recognition", "Effective hypothesis generation"],
    },
    {
      category: "Practice Readiness",
      score: 78,
      status: "Good",
      details: ["Safe medication practices", "Strong patient advocacy"],
    },
    {
      category: "Next-Gen Item Types",
      score: 82,
      status: "Good",
      details: ["Excels in case studies", "Strong in extended multiple choice"],
    },
    {
      category: "Decision Making",
      score: 88,
      status: "Excellent",
      details: ["Strong prioritization", "Effective care planning"],
    },
    {
      category: "Time Management",
      score: 75,
      status: "Needs Work",
      details: ["Average question pace", "Review timing strategies"],
    }
  ];

  return (
    <div className="space-y-6">
      {mockMetrics.map((metric) => (
        <Card key={metric.category}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              {metric.category}
            </CardTitle>
            <Badge variant={metric.score >= 85 ? "default" : "secondary"}>
              {metric.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Performance Score</span>
                  <span className="font-medium">{metric.score}%</span>
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>
              <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                {metric.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PerformanceMetricsProps {
  data: any;
}

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const mockMetrics = [
    {
      category: "Critical Thinking",
      score: 85,
      status: "Strong",
      details: ["Excellent problem solving", "Good clinical reasoning"],
    },
    {
      category: "Content Knowledge",
      score: 78,
      status: "Good",
      details: ["Strong in fundamentals", "Needs review in pharmacology"],
    },
    {
      category: "Test-Taking Strategy",
      score: 90,
      status: "Excellent",
      details: ["Effective time management", "Strong question analysis"],
    },
    {
      category: "Clinical Judgment",
      score: 82,
      status: "Good",
      details: ["Good prioritization", "Solid assessment skills"],
    },
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

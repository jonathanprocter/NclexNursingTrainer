
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsProps {
  data: any;
}

export default function Analytics({ data }: AnalyticsProps) {
  const nclexDomains = [
    { domain: "Management of Care", score: 82 },
    { domain: "Safety & Infection Control", score: 78 },
    { domain: "Clinical Judgment", score: 85 },
    { domain: "Health Promotion", score: 76 },
    { domain: "Psychosocial Integrity", score: 80 },
    { domain: "Basic Care & Comfort", score: 88 }
  ];

  const clinicalJudgmentMetrics = [
    { metric: "Recognize Cues", score: 85 },
    { metric: "Analyze Information", score: 78 },
    { metric: "Prioritize Hypotheses", score: 82 },
    { metric: "Generate Solutions", score: 75 },
    { metric: "Take Actions", score: 88 },
    { metric: "Evaluate Outcomes", score: 80 }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>NCLEX Domain Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nclexDomains}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" angle={-45} textAnchor="end" height={100} />
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
          <CardTitle>Clinical Judgment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clinicalJudgmentMetrics.map((metric) => (
              <div key={metric.metric} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{metric.metric}</span>
                  <span className="font-medium">{metric.score}%</span>
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

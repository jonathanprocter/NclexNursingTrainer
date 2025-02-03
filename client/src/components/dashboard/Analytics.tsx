import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsProps {
  data: any;
}

export default function Analytics({ data }: AnalyticsProps) {
  const nclexDomains = data?.nclexDomains || [
    { 
      domain: "Basic Care and Comfort",
      score: 82,
      metrics: {
        questions_attempted: 45,
        accuracy: 82,
        time_spent: 120,
        confidence_level: "high"
      }
    },
    { 
      domain: "Pharmacological and Parenteral Therapies",
      score: 78,
      metrics: {
        questions_attempted: 38,
        accuracy: 78,
        time_spent: 90,
        confidence_level: "medium"
      }
    },
    { 
      domain: "Reduction of Risk Potential",
      score: 85,
      metrics: {
        questions_attempted: 52,
        accuracy: 85,
        time_spent: 150,
        confidence_level: "high"
      }
    },
    { 
      domain: "Physiological Adaptation",
      score: 76,
      metrics: {
        questions_attempted: 42,
        accuracy: 76,
        time_spent: 110,
        confidence_level: "medium"
      }
    },
    { 
      domain: "Psychosocial Integrity",
      score: 80,
      metrics: {
        questions_attempted: 35,
        accuracy: 80,
        time_spent: 95,
        confidence_level: "high"
      }
    },
    { 
      domain: "Safe and Effective Care Environment",
      score: 88,
      metrics: {
        questions_attempted: 48,
        accuracy: 88,
        time_spent: 130,
        confidence_level: "high"
      }
    }
  ];

  const clinicalJudgmentMetrics = data?.clinicalJudgmentMetrics || [
    { metric: "Recognize Cues", score: 85 },
    { metric: "Analyze Information", score: 78 },
    { metric: "Prioritize Hypotheses", score: 82 },
    { metric: "Generate Solutions", score: 75 },
    { metric: "Take Actions", score: 88 },
    { metric: "Evaluate Outcomes", score: 80 }
  ];

  if (!data) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2"> {/* Added responsiveness */}
      <Card>
        <CardHeader>
          <CardTitle>NCLEX Domain Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nclexDomains} width={500} height={300}> {/* Added width and height for better responsiveness */}
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
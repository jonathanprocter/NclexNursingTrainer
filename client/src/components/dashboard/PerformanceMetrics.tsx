
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DomainMetrics {
  domain: string;
  score: number;
  questionsAttempted: number;
  timeSpent: number;
  mockExamScore: number;
  practiceQuizScore: number;
  contentCompletion: number;
  status: "Strong" | "Good" | "Needs Work";
  details: string[];
}

interface PerformanceMetricsProps {
  data: {
    domainMetrics: DomainMetrics[];
  };
}

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const domains = data?.domainMetrics || [
    {
      domain: "Clinical Judgment",
      score: 85,
      questionsAttempted: 120,
      timeSpent: 180,
      mockExamScore: 82,
      practiceQuizScore: 88,
      contentCompletion: 75,
      status: "Strong",
      details: ["Strong case analysis", "Effective prioritization"]
    },
    {
      domain: "Patient Care Management",
      score: 78,
      questionsAttempted: 95,
      timeSpent: 150,
      mockExamScore: 76,
      practiceQuizScore: 80,
      contentCompletion: 65,
      status: "Good",
      details: ["Good delegation skills", "Care planning proficiency"]
    },
    {
      domain: "Safety & Infection Control",
      score: 82,
      questionsAttempted: 110,
      timeSpent: 165,
      mockExamScore: 84,
      practiceQuizScore: 80,
      contentCompletion: 85,
      status: "Strong",
      details: ["Strong protocol adherence", "Effective risk assessment"]
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {domains.map((domain) => (
            <Card key={domain.domain} className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {domain.domain}
                </CardTitle>
                <Badge variant={domain.score >= 85 ? "default" : "secondary"}>
                  {domain.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Performance</span>
                      <span className="font-medium">{domain.score}%</span>
                    </div>
                    <Progress value={domain.score} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Questions</p>
                      <p className="font-medium">{domain.questionsAttempted}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Spent</p>
                      <p className="font-medium">{Math.floor(domain.timeSpent / 60)}h {domain.timeSpent % 60}m</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Content</p>
                      <p className="font-medium">{domain.contentCompletion}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Activity Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={domains}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" />
                  <YAxis />
                  <Tooltip />
                  <Bar name="Mock Exams" dataKey="mockExamScore" fill="#8884d8" />
                  <Bar name="Practice Quizzes" dataKey="practiceQuizScore" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Content Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domains.map((domain) => (
                  <div key={`progress-${domain.domain}`} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{domain.domain}</span>
                      <span>{domain.contentCompletion}%</span>
                    </div>
                    <Progress value={domain.contentCompletion} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

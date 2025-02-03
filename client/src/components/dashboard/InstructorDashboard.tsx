
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzePerformance, generateStudyPath } from "@/lib/ai-services";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InstructorDashboard() {
  const { data: biancaInteractions } = useQuery({
    queryKey: ["/api/analytics/interactions/bianca"],
    staleTime: 1000 * 60 * 5,
  });

  const { data: aiAnalysis } = useQuery({
    queryKey: ["/api/analytics/ai/bianca"],
    queryFn: () => analyzePerformance(biancaInteractions?.answers || []),
    enabled: !!biancaInteractions?.answers,
  });

  const nclexDomains = [
    { name: "Clinical Judgment", progress: biancaInteractions?.domainScores?.clinicalJudgment || 0 },
    { name: "Professional Standards", progress: biancaInteractions?.domainScores?.professionalStandards || 0 },
    { name: "Patient Care", progress: biancaInteractions?.domainScores?.patientCare || 0 },
    { name: "Evidence-Based Practice", progress: biancaInteractions?.domainScores?.evidenceBased || 0 },
    { name: "Communication", progress: biancaInteractions?.domainScores?.communication || 0 },
    { name: "Technology", progress: biancaInteractions?.domainScores?.technology || 0 }
  ];

  const strengthAreas = aiAnalysis?.strengths || [];
  const improvementAreas = aiAnalysis?.weaknesses || [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{biancaInteractions?.engagementMetrics?.weeklyActive || 0}%</div>
                <p className="text-xs text-muted-foreground">Past 7 days activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{biancaInteractions?.totalStudyHours || 0}h</div>
                <p className="text-xs text-muted-foreground">Total study hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Practice Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{biancaInteractions?.questionsAttempted || 0}</div>
                <p className="text-xs text-muted-foreground">Questions completed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>NCLEX Domain Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nclexDomains.map((domain) => (
                  <div key={domain.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{domain.name}</span>
                      <span className="font-medium">{domain.progress}%</span>
                    </div>
                    <Progress value={domain.progress} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={biancaInteractions?.performanceTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Strength Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {strengthAreas.map((area, index) => (
                    <Badge key={index} className="mr-2 bg-green-100 text-green-800">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {improvementAreas.map((area, index) => (
                    <Badge key={index} className="mr-2 bg-red-100 text-red-800">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI-Generated Study Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Focus Area</TableHead>
                    <TableHead>Recommended Actions</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aiAnalysis?.recommendations?.map((rec, index) => (
                    <TableRow key={index}>
                      <TableCell>{rec.area}</TableCell>
                      <TableCell>{rec.action}</TableCell>
                      <TableCell>
                        <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

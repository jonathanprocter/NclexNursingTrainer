
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { analyzePerformance, generateStudyPath } from "@/lib/ai-services";

export default function InstructorDashboard() {
  const { data: biancaInteractions } = useQuery({
    queryKey: ["/api/analytics/interactions/bianca"],
    staleTime: 1000 * 60 * 5,
  });

  const { data: aiAnalysis } = useQuery({
    queryKey: ["/api/analytics/ai/bianca"],
    queryFn: () => analyzePerformance(biancaInteractions?.answers || null),
    enabled: !!biancaInteractions?.answers,
  });

  const { data: studyPath } = useQuery({
    queryKey: ["/api/analytics/study-path/bianca"],
    queryFn: () => generateStudyPath(biancaInteractions?.recentTopics || []),
    enabled: !!biancaInteractions?.recentTopics,
  });

  const nclexDomains = [
    { name: "Clinical Judgment", progress: aiAnalysis?.conceptualUnderstanding?.clinicalJudgment || 75 },
    { name: "Professional Standards", progress: aiAnalysis?.conceptualUnderstanding?.professionalStandards || 70 },
    { name: "Patient Care", progress: aiAnalysis?.conceptualUnderstanding?.patientCare || 80 },
    { name: "Evidence-Based Practice", progress: aiAnalysis?.conceptualUnderstanding?.evidenceBased || 75 },
    { name: "Communication", progress: aiAnalysis?.conceptualUnderstanding?.communication || 85 },
    { name: "Technology", progress: aiAnalysis?.conceptualUnderstanding?.technology || 72 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Profile - Bianca</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learning Style</TableHead>
                <TableHead>Engagement Level</TableHead>
                <TableHead>Progress Rate</TableHead>
                <TableHead>AI Predicted Success</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="capitalize">{aiAnalysis?.learningStyle || "visual"}</TableCell>
                <TableCell>{biancaInteractions?.engagementScore || "85"}%</TableCell>
                <TableCell>{biancaInteractions?.progressRate || "92"}%</TableCell>
                <TableCell>{aiAnalysis?.predictedPerformance || 88}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Focus Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {aiAnalysis?.weaknesses?.map((area) => (
              <Badge key={area} variant="secondary">
                {area}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>AI-Recommended Study Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studyPath?.recommendedTopics?.map((topic, index) => (
              <div key={topic} className="flex items-center gap-2">
                <Badge variant="outline">{index + 1}</Badge>
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mastered Concepts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {aiAnalysis?.conceptualUnderstanding?.strong?.map((concept) => (
              <Badge key={concept} variant="default">
                {concept}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

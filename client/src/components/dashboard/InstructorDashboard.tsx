
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
    queryFn: () => analyzePerformance(biancaInteractions?.answers || []),
    enabled: !!biancaInteractions?.answers,
  });

  const { data: studyPath } = useQuery({
    queryKey: ["/api/analytics/study-path/bianca"],
    queryFn: () => generateStudyPath(biancaInteractions?.recentTopics || []),
    enabled: !!biancaInteractions?.recentTopics,
  });

  const nclexDomains = [
    { name: "Clinical Judgment", progress: biancaInteractions?.domainScores?.clinicalJudgment || 0 },
    { name: "Professional Standards", progress: biancaInteractions?.domainScores?.professionalStandards || 0 },
    { name: "Patient Care", progress: biancaInteractions?.domainScores?.patientCare || 0 },
    { name: "Evidence-Based Practice", progress: biancaInteractions?.domainScores?.evidenceBased || 0 },
    { name: "Communication", progress: biancaInteractions?.domainScores?.communication || 0 },
    { name: "Technology", progress: biancaInteractions?.domainScores?.technology || 0 }
  ];

  const recentTopics = biancaInteractions?.recentTopics || [];
  const masteredConcepts = biancaInteractions?.masteredConcepts || [];
  const recommendedTopics = studyPath?.recommendedTopics || [];

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
                <TableHead>Platform Engagement</TableHead>
                <TableHead>Course Progress</TableHead>
                <TableHead>AI Predicted Success</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="capitalize">{aiAnalysis?.learningStyle || "Analyzing..."}</TableCell>
                <TableCell>{biancaInteractions?.engagementMetrics?.weeklyActive || 0}%</TableCell>
                <TableCell>{biancaInteractions?.courseProgress || 0}%</TableCell>
                <TableCell>{aiAnalysis?.predictedSuccess || 0}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Focus Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {recentTopics.map((topic, index) => (
              <Badge key={`${topic}-${index}`} variant="secondary">
                {topic}
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
          <CardTitle>AI Study Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendedTopics.map((topic, index) => (
              <div key={`${topic}-${index}`} className="flex items-center gap-2">
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
            {masteredConcepts.map((concept, index) => (
              <Badge key={`${concept}-${index}`} variant="default">
                {concept}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

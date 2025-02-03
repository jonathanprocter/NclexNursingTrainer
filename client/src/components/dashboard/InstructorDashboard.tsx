
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { generateStudyPath, type BiancaProfile } from "@/lib/ai-services";

export default function InstructorDashboard() {
  const { data: biancaProfile } = useQuery<BiancaProfile>({
    queryKey: ["/api/analytics/student/bianca/profile"],
    staleTime: 1000 * 60 * 5,
  });

  const { data: performanceData } = useQuery({
    queryKey: ["/api/analytics/student/bianca/performance"],
    staleTime: 1000 * 60 * 5,
  });

  const { data: studyPath } = useQuery({
    queryKey: ["/api/analytics/student/bianca/study-path"],
    queryFn: () => generateStudyPath(performanceData?.recentTopics || []),
    enabled: !!performanceData?.recentTopics,
  });

  const nclexDomains = [
    { name: "Clinical Judgment & Decision Making", progress: performanceData?.clinicalJudgment || 75 },
    { name: "Professional Standards", progress: performanceData?.professionalStandards || 70 },
    { name: "Patient Care Management", progress: performanceData?.patientCare || 80 },
    { name: "Evidence-Based Practice", progress: performanceData?.evidenceBased || 75 },
    { name: "Communication & Documentation", progress: performanceData?.communication || 85 },
    { name: "Technology & Informatics", progress: performanceData?.technology || 72 }
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
                <TableHead>Study Session Length</TableHead>
                <TableHead>Break Frequency</TableHead>
                <TableHead>Preferred Study Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="capitalize">{biancaProfile?.learningStyle || "visual"}</TableCell>
                <TableCell>{biancaProfile?.studyPreferences.sessionLength || 45} minutes</TableCell>
                <TableCell>Every {biancaProfile?.studyPreferences.breakFrequency || 25} minutes</TableCell>
                <TableCell>{biancaProfile?.studyPreferences.timeOfDay || "Morning"}</TableCell>
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
            {biancaProfile?.focusAreas?.map((area) => (
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
          <CardTitle>Recommended Study Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studyPath?.recommendedTopics.map((topic, index) => (
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
          <CardTitle>Strength Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {biancaProfile?.strengthAreas?.map((area) => (
              <Badge key={area} variant="default">
                {area}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

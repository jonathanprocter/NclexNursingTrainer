
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function InstructorDashboard() {
  const { data: biancaData } = useQuery({
    queryKey: ["/api/analytics/student/bianca"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const nclexDomains = [
    { name: "Clinical Judgment & Decision Making", progress: biancaData?.clinicalJudgment || 75 },
    { name: "Professional Standards & Best Practices", progress: biancaData?.professionalStandards || 70 },
    { name: "Patient Care Management & Safety", progress: biancaData?.patientCare || 80 },
    { name: "Evidence-Based Practice", progress: biancaData?.evidenceBased || 75 },
    { name: "Communication & Documentation", progress: biancaData?.communication || 85 },
    { name: "Technology & Informatics", progress: biancaData?.technology || 72 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Overview - Bianca</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Overall Progress</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Study Time Today</TableHead>
                <TableHead>Focus Areas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{biancaData?.overallProgress || 75}%</TableCell>
                <TableCell>{new Date().toLocaleDateString()}</TableCell>
                <TableCell>{biancaData?.studyTimeToday || 2}h</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {biancaData?.focusAreas?.map((area: string) => (
                      <Badge key={area} variant="outline">
                        {area}
                      </Badge>
                    )) || ["Clinical Judgment", "Professional Standards"].map(area => (
                      <Badge key={area} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">NCLEX Next Gen Domain Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nclexDomains.map((domain) => (
              <div key={domain.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{domain.name}</span>
                  <span className="font-medium">{domain.progress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${domain.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI-Generated Insights for Bianca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Based on Bianca's latest performance data and learning patterns:
            </p>
            <ul className="space-y-2 text-sm">
              {biancaData?.aiInsights?.map((insight: string, index: number) => (
                <li key={index}>• {insight}</li>
              )) || [
                "• Strong performance in patient care scenarios",
                "• Recommended focus on clinical judgment exercises",
                "• Consider more practice with prioritization questions",
                "• Excellent progress in evidence-based practice topics"
              ].map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

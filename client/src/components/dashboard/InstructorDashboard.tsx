
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function InstructorDashboard() {
  const studentData = {
    id: 1,
    name: "Bianca",
    progress: 75,
    lastActive: new Date().toISOString().split('T')[0],
    status: "On Track",
    weakAreas: ["Clinical Judgment", "Professional Standards"],
    nclexDomains: [
      { name: "Clinical Judgment", progress: 65 },
      { name: "Professional Standards", progress: 70 },
      { name: "Patient Care Management", progress: 80 },
      { name: "Evidence-Based Practice", progress: 75 },
      { name: "Communication & Documentation", progress: 85 },
      { name: "Healthcare Technology", progress: 72 }
    ]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Overall Progress</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Areas for Focus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{studentData.name}</TableCell>
                <TableCell>{studentData.progress}%</TableCell>
                <TableCell>{studentData.lastActive}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{studentData.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {studentData.weakAreas.map((area) => (
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">NCLEX Next Gen Domain Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentData.nclexDomains.map((domain) => (
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
            <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Based on Bianca's performance data and learning patterns, here are the AI-recommended focus areas:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Strengthen clinical judgment through case-based scenarios</li>
                <li>• Review professional standards documentation</li>
                <li>• Continue strong performance in patient care management</li>
                <li>• Practice more technology-based assessment questions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

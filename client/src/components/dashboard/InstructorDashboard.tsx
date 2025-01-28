import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function InstructorDashboard() {
  const mockStudents = [
    {
      id: 1,
      name: "Sarah Johnson",
      progress: 75,
      lastActive: "2024-01-27",
      status: "On Track",
      weakAreas: ["Pharmacology", "Critical Care"],
    },
    {
      id: 2,
      name: "Michael Chen",
      progress: 60,
      lastActive: "2024-01-28",
      status: "Needs Review",
      weakAreas: ["Med-Surg", "Mental Health"],
    },
    {
      id: 3,
      name: "Emily Davis",
      progress: 90,
      lastActive: "2024-01-28",
      status: "Excellent",
      weakAreas: ["None"],
    },
  ];

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
                <TableHead>Progress</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Areas for Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.progress}%</TableCell>
                  <TableCell>{student.lastActive}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.status === "Excellent"
                          ? "default"
                          : student.status === "On Track"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {student.weakAreas.map((area) => (
                        <Badge key={area} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">24</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">75%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">At-Risk Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

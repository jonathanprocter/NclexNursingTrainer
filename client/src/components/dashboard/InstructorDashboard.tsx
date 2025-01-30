import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Student {
  id: number;
  name: string;
  progress: number;
  lastActive: string;
  status: "Excellent" | "On Track" | "Needs Review";
  weakAreas: string[];
  recentScores: number[];
}

interface ClassStats {
  averageProgress: number;
  totalStudents: number;
  atRiskCount: number;
  topPerformers: number;
  completionRate: number;
  averageEngagement: number;
}

const InstructorDashboard: FC = () => {
  const mockStudents: Student[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      progress: 75,
      lastActive: "2024-01-27",
      status: "On Track",
      weakAreas: ["Pharmacology", "Critical Care"],
      recentScores: [85, 78, 92, 88, 75],
    },
    {
      id: 2,
      name: "Michael Chen",
      progress: 60,
      lastActive: "2024-01-28",
      status: "Needs Review",
      weakAreas: ["Med-Surg", "Mental Health"],
      recentScores: [65, 72, 68, 70, 60],
    },
    {
      id: 3,
      name: "Emily Davis",
      progress: 90,
      lastActive: "2024-01-28",
      status: "Excellent",
      weakAreas: ["None"],
      recentScores: [95, 88, 92, 90, 94],
    },
  ];

  const performanceData = mockStudents.map((student) => ({
    name: student.name,
    data: student.recentScores.map((score, i) => ({
      day: `Day ${i + 1}`,
      score: score,
    })),
  }));

  const classStats: ClassStats = {
    averageProgress: 75,
    totalStudents: 24,
    atRiskCount: 3,
    topPerformers: 5,
    completionRate: 68,
    averageEngagement: 82,
  };

  const getStatusVariant = (status: Student["status"]) => {
    switch (status) {
      case "Excellent":
        return "default";
      case "On Track":
        return "secondary";
      case "Needs Review":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(classStats).map(([key, value]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{value}{key.includes("Rate") || key.includes("Progress") || key.includes("Engagement") ? "%" : ""}</p>
                  <p className="text-sm text-muted-foreground">
                    {key === "totalStudents" ? "Active Enrollments" : 
                     key === "atRiskCount" ? "Need Attention" :
                     key === "topPerformers" ? "Above 90%" :
                     key === "completionRate" ? "Module Completion" :
                     "Overall Performance"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students">
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
                        <Badge variant={getStatusVariant(student.status)}>
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
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    {performanceData.map((student, index) => (
                      <Line
                        key={student.name}
                        data={student.data}
                        name={student.name}
                        dataKey="score"
                        stroke={`hsl(${index * 120}, 70%, 50%)`}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructorDashboard;
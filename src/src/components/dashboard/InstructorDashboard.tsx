import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const getStatusBadgeVariant = (status: Student["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Excellent":
        return "default";
      case "On Track":
        return "secondary";
      case "Needs Review":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(classStats).map(([key, value]) => (
              <Card key={key} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{value}{key.includes("Rate") || key.includes("Progress") || key.includes("Engagement") ? "%" : ""}</p>
                  <p className="text-sm text-muted-foreground mt-1">
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
              <div className="rounded-lg border">
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
                          <Badge variant={getStatusBadgeVariant(student.status)}>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
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
                        dot={true}
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
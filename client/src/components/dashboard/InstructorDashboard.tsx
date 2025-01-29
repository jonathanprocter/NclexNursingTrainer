import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function InstructorDashboard() {
  const mockStudents = [
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

  const classStats = {
    averageProgress: 75,
    totalStudents: 24,
    atRiskCount: 3,
    topPerformers: 5,
    completionRate: 68,
    averageEngagement: 82,
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{classStats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Active Enrollments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Class Average</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{classStats.averageProgress}%</p>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">At-Risk Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{classStats.atRiskCount}</p>
                <p className="text-sm text-muted-foreground">Need Attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{classStats.topPerformers}</p>
                <p className="text-sm text-muted-foreground">Above 90%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{classStats.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Module Completion</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{classStats.averageEngagement}%</p>
                <p className="text-sm text-muted-foreground">Average Activity</p>
              </CardContent>
            </Card>
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
                        <Badge
                          className={
                            student.status === "Excellent"
                              ? "bg-green-100 text-green-800"
                              : student.status === "On Track"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {student.weakAreas.map((area) => (
                            <Badge
                              key={area}
                              className="bg-gray-100 text-gray-800"
                            >
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
                    {performanceData?.map((student, index) => (
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
}
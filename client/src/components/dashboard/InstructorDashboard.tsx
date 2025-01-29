import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InstructorDashboard() {
  const studentData = {
    name: "Bianca",
    strengths: ["Critical Care", "Pharmacology"],
    areasForGrowth: ["Med-Surg", "Mental Health"],
    lastScore: 82,
    overallProgress: 75,
    predictedPassRate: 88,
    recentActivity: [
      { date: "Jan 25", score: 78 },
      { date: "Jan 26", score: 82 },
      { date: "Jan 27", score: 85 },
      { date: "Jan 28", score: 82 },
      { date: "Jan 29", score: 88 }
    ],
    domainProgress: [
      { domain: "Patient Care", score: 85 },
      { domain: "Safety & Infection", score: 78 },
      { domain: "Health Promotion", score: 92 },
      { domain: "Psychosocial", score: 70 },
      { domain: "Basic Care", score: 88 },
      { domain: "Risk Reduction", score: 82 }
    ]
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back, {studentData.name}! 🌟</CardTitle>
          <p className="text-muted-foreground mt-2">
            You're making excellent progress in {studentData.strengths.join(" and ")}. 
            Let's focus on strengthening {studentData.areasForGrowth.join(" and ")} today.
            Based on your recent performance, you have an {studentData.predictedPassRate}% predicted success rate for the NCLEX.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Study Planner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Recommended Study Plan</h3>
              <ul className="space-y-2">
                <li>• Focus on {studentData.areasForGrowth[0]} scenarios (2 hours)</li>
                <li>• Review {studentData.areasForGrowth[1]} concepts (1.5 hours)</li>
                <li>• Practice questions in strong areas to maintain mastery (1 hour)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progress Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studentData.recentActivity}>
                  <defs>
                    <linearGradient id="progressColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#0ea5e9" fill="url(#progressColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>NCLEX Domains Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentData.domainProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted rounded-lg text-center">
              <h3 className="text-sm font-medium mb-2">Current Progress</h3>
              <p className="text-3xl font-bold">{studentData.overallProgress}%</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <h3 className="text-sm font-medium mb-2">Latest Score</h3>
              <p className="text-3xl font-bold">{studentData.lastScore}%</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <h3 className="text-sm font-medium mb-2">Predicted Pass Rate</h3>
              <p className="text-3xl font-bold text-green-600">{studentData.predictedPassRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const scenarios = [
  {
    id: 1,
    title: "Post-operative Care",
    difficulty: "Medium",
    duration: "30 mins",
    skills: ["Assessment", "Critical Thinking", "Prioritization"],
    completed: false,
  },
  {
    id: 2,
    title: "Emergency Department Triage",
    difficulty: "Hard",
    duration: "45 mins",
    skills: ["Decision Making", "Time Management", "Clinical Judgment"],
    completed: false,
  },
  {
    id: 3,
    title: "Chronic Disease Management",
    difficulty: "Easy",
    duration: "20 mins",
    skills: ["Patient Education", "Care Planning", "Documentation"],
    completed: false,
  },
];

export default function PatientScenarios() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Virtual Patient Scenarios</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Practice clinical decision-making with realistic patient scenarios
        </p>
      </div>

      <div className="grid gap-6">
        {scenarios.map((scenario) => (
          <Card key={scenario.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg mb-2">{scenario.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      Difficulty: {scenario.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      Duration: {scenario.duration}
                    </Badge>
                  </div>
                </div>
                <Button disabled={scenario.completed}>
                  {scenario.completed ? "Completed" : "Start Scenario"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Skills Covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {scenario.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Completion</span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scenarios Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0/10</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills Mastered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0/8</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Time Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0h</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

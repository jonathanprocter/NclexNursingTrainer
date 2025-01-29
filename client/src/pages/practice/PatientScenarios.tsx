import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Brain, Heart, Activity, ClipboardCheck, HelpCircle } from "lucide-react";

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  vitalSigns: Record<string, string>;
  medicalHistory: string[];
  currentSymptoms: string[];
  requiredAssessments: string[];
  expectedInterventions: string[];
  criticalThinkingPoints: string[];
}

interface ScenarioEvaluation {
  score: number;
  feedback: {
    strengths: string[];
    areasForImprovement: string[];
  };
  criticalThinkingAnalysis: string;
  recommendedStudyTopics: string[];
}

export default function PatientScenarios() {
  const { toast } = useToast();
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<ScenarioEvaluation | null>(null);

  // Generate new scenario
  const generateScenario = useMutation({
    mutationFn: async ({ difficulty }: { difficulty: string }) => {
      const response = await fetch("/api/scenarios/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });
      if (!response.ok) throw new Error("Failed to generate scenario");
      return response.json();
    },
    onSuccess: (data) => {
      setActiveScenario(data);
      setIsScenarioOpen(true);
      setSelectedAssessments([]);
      setSelectedInterventions([]);
      setEvaluation(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate scenario",
        variant: "destructive",
      });
    },
  });

  // Evaluate scenario
  const evaluateScenario = useMutation({
    mutationFn: async () => {
      if (!activeScenario) throw new Error("No active scenario");

      const response = await fetch("/api/scenarios/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          assessments: selectedAssessments,
          actions: selectedInterventions,
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate scenario");
      return response.json();
    },
    onSuccess: (data) => {
      setEvaluation(data);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to evaluate scenario",
        variant: "destructive",
      });
    },
  });

  // Get hint
  const getHint = useMutation({
    mutationFn: async () => {
      if (!activeScenario) throw new Error("No active scenario");

      const response = await fetch("/api/scenarios/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          currentState: {
            selectedAssessments,
            selectedInterventions,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to get hint");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Hint",
        description: data.hint,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get hint",
        variant: "destructive",
      });
    },
  });

  const handleStartScenario = (difficulty: string) => {
    generateScenario.mutate({ difficulty });
  };

  const toggleAssessment = (assessment: string) => {
    setSelectedAssessments(prev =>
      prev.includes(assessment)
        ? prev.filter(a => a !== assessment)
        : [...prev, assessment]
    );
  };

  const toggleIntervention = (intervention: string) => {
    setSelectedInterventions(prev =>
      prev.includes(intervention)
        ? prev.filter(i => i !== intervention)
        : [...prev, intervention]
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Virtual Patient Scenarios</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Practice clinical decision-making with AI-powered realistic patient scenarios
        </p>
      </div>

      <div className="grid gap-6">
        {["Easy", "Medium", "Hard"].map((difficulty) => (
          <Card key={difficulty}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg mb-2">
                    {difficulty} Difficulty Scenarios
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      Difficulty: {difficulty}
                    </Badge>
                    <Badge variant="outline">
                      ~30 mins
                    </Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => handleStartScenario(difficulty)}
                  disabled={generateScenario.isPending}
                >
                  {generateScenario.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Start Scenario'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Skills Covered:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Patient Assessment",
                      "Clinical Judgment",
                      "Critical Thinking",
                      "Prioritization",
                    ].map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isScenarioOpen} onOpenChange={setIsScenarioOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{activeScenario?.title}</DialogTitle>
            <DialogDescription>
              Analyze the scenario and make appropriate nursing decisions
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-8rem)]">
            {activeScenario && (
              <div className="space-y-6 p-4">
                <Tabs defaultValue="scenario" className="w-full">
                  <TabsList>
                    <TabsTrigger value="scenario">Scenario</TabsTrigger>
                    <TabsTrigger value="assessment">Assessment</TabsTrigger>
                    <TabsTrigger value="intervention">Interventions</TabsTrigger>
                    {evaluation && <TabsTrigger value="feedback">Feedback</TabsTrigger>}
                  </TabsList>

                  <TabsContent value="scenario" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Patient Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {activeScenario.description}
                        </p>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h3 className="font-medium mb-2">Vital Signs</h3>
                            <ul className="space-y-2">
                              {Object.entries(activeScenario.vitalSigns).map(([key, value]) => (
                                <li key={key} className="text-sm flex justify-between">
                                  <span>{key}:</span>
                                  <span className="font-medium">{value}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h3 className="font-medium mb-2">Current Symptoms</h3>
                            <ul className="space-y-1">
                              {activeScenario.currentSymptoms.map((symptom, index) => (
                                <li key={index} className="text-sm">• {symptom}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="assessment" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Required Assessments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {activeScenario.requiredAssessments.map((assessment, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                              onClick={() => toggleAssessment(assessment)}
                            >
                              <Button
                                variant={selectedAssessments.includes(assessment) ? "default" : "outline"}
                                className="w-full justify-start"
                              >
                                <ClipboardCheck className="h-4 w-4 mr-2" />
                                {assessment}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="intervention" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Nursing Interventions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {activeScenario.expectedInterventions.map((intervention, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                              onClick={() => toggleIntervention(intervention)}
                            >
                              <Button
                                variant={selectedInterventions.includes(intervention) ? "default" : "outline"}
                                className="w-full justify-start"
                              >
                                <Activity className="h-4 w-4 mr-2" />
                                {intervention}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {evaluation && (
                    <TabsContent value="feedback" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Performance Evaluation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>Score</span>
                                <span>{evaluation.score}%</span>
                              </div>
                              <Progress value={evaluation.score} className="h-2" />
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Strengths</h4>
                                <ul className="space-y-1">
                                  {evaluation.feedback.strengths.map((strength, index) => (
                                    <li key={index} className="text-sm">• {strength}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Areas for Improvement</h4>
                                <ul className="space-y-1">
                                  {evaluation.feedback.areasForImprovement.map((area, index) => (
                                    <li key={index} className="text-sm">• {area}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </Tabs>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => getHint.mutate()}
                    disabled={getHint.isPending}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Get Hint
                  </Button>

                  <Button
                    onClick={() => evaluateScenario.mutate()}
                    disabled={evaluateScenario.isPending}
                  >
                    {evaluateScenario.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      'Submit for Evaluation'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
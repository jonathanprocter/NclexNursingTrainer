import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateSimulationScenario, getSimulationFeedback } from "@/lib/ai-services";
import { useMutation } from "@tanstack/react-query";
import type { SimulationScenario, SimulationFeedback } from "@/lib/ai-services";
import { Bot, Activity, Stethoscope } from "lucide-react";

type UserAction = {
  action: string;
  timestamp: string;
};

export default function Simulation() {
  const { toast } = useToast();
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userActions, setUserActions] = useState<UserAction[]>([]);

  const startSimulationMutation = useMutation({
    mutationFn: async ({ difficulty, focusAreas }: { difficulty: string; focusAreas?: string[] }) => {
      const scenario = await generateSimulationScenario(difficulty, focusAreas);
      return scenario;
    },
    onSuccess: (scenario) => {
      setActiveScenario(scenario);
      setIsSimulationActive(true);
      toast({
        title: "Simulation Started",
        description: "Your simulation scenario has been generated. Good luck!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start simulation",
        variant: "destructive",
      });
    },
  });

  const getFeedbackMutation = useMutation<SimulationFeedback, Error>({
    mutationFn: async () => {
      if (!activeScenario) throw new Error("No active scenario");
      return getSimulationFeedback(activeScenario, userActions);
    },
    onSuccess: () => {
      setShowFeedback(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartSimulation = (difficulty: string) => {
    startSimulationMutation.mutate({ 
      difficulty,
      focusAreas: ["patient assessment", "critical thinking", "clinical decision making"]
    });
  };

  const handleAction = (action: string | { action: string }) => {
    if (!action) return;
    setUserActions(prev => [...prev, {
      action: typeof action === 'string' ? action : action.action,
      timestamp: new Date().toISOString()
    }]);
  };

  const renderVitalSign = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === null) return null;
    return (
      <div key={key} className="bg-muted p-2 rounded">
        <p className="text-sm font-medium">{key.replace('_', ' ').toUpperCase()}</p>
        <p className="text-lg">{String(value)}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Simulation</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience complex clinical scenarios in an interactive learning environment
        </p>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-[400px] mx-auto">
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="skills">Skills Lab</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">Critical Care Simulation</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Advanced</Badge>
                      <Badge variant="outline">60 minutes</Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleStartSimulation('advanced')}
                    disabled={isSimulationActive || startSimulationMutation.isPending}
                  >
                    {startSimulationMutation.isPending ? "Generating..." : "Start Simulation"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage multiple critically ill patients in a simulated ICU environment.
                  Practice prioritization, delegation, and critical thinking skills.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Patient Assessment</Badge>
                  <Badge variant="outline">Critical Thinking</Badge>
                  <Badge variant="outline">Time Management</Badge>
                  <Badge variant="outline">Clinical Decision Making</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Virtual Skills Lab</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Practice specific nursing skills in a virtual environment before 
                attempting complex scenarios.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Basic Skills</h3>
                    <div className="space-y-2">
                      {[
                        { name: 'Patient Assessment', icon: <Stethoscope className="h-4 w-4" /> },
                        { name: 'Vital Signs Monitoring', icon: <Activity className="h-4 w-4" /> },
                        { name: 'Medication Administration', icon: <Pill className="h-4 w-4" /> },
                        { name: 'Documentation', icon: <FileText className="h-4 w-4" /> }
                      ].map((skill) => (
                        <Button
                          key={skill.name}
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => handleStartSkillPractice('basic', skill.name)}
                        >
                          {skill.icon}
                          {skill.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Advanced Skills</h3>
                    <div className="space-y-2">
                      {[
                        { name: 'Complex Procedures', icon: <Syringe className="h-4 w-4" /> },
                        { name: 'Emergency Interventions', icon: <AlertTriangle className="h-4 w-4" /> },
                        { name: 'Critical Care Monitoring', icon: <Heart className="h-4 w-4" /> },
                        { name: 'Team Leadership', icon: <Users className="h-4 w-4" /> }
                      ].map((skill) => (
                        <Button
                          key={skill.name}
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => handleStartSkillPractice('advanced', skill.name)}
                        >
                          {skill.icon}
                          {skill.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Competency</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Simulations Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/12</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skills Mastered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/15</p>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isSimulationActive} onOpenChange={(open) => {
        if (!open) {
          const shouldClose = window.confirm("Are you sure you want to end the simulation?");
          if (shouldClose) {
            setIsSimulationActive(false);
            setActiveScenario(null);
            setUserActions([]);
          }
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {activeScenario?.title || "Simulation in Progress"}
            </DialogTitle>
            <DialogDescription>
              {activeScenario?.description}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4">
            <div className="space-y-6 p-4">
              {activeScenario?.initial_state && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Critical Care Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Patient Background</h3>
                        <p className="text-sm mb-4">{activeScenario.initial_state.patient_history}</p>

                        <h3 className="font-medium mb-2">Chief Complaint</h3>
                        <p className="text-sm mb-4">{activeScenario.initial_state.chief_complaint}</p>

                        <h3 className="font-medium mb-2">Primary Assessment (ABCDE)</h3>
                        <div className="space-y-3">
                          {activeScenario.initial_state.airway_assessment && (
                            <div>
                              <h4 className="text-sm font-medium">Airway & Breathing</h4>
                              <p className="text-sm text-muted-foreground">
                                {activeScenario.initial_state.airway_assessment}
                              </p>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {activeScenario.initial_state.vital_signs && (
                                  <>
                                    {renderVitalSign('Respiratory Rate', activeScenario.initial_state.vital_signs.respiratory_rate)}
                                    {renderVitalSign('SpO2', activeScenario.initial_state.vital_signs.spo2)}
                                    {renderVitalSign('Work of Breathing', activeScenario.initial_state.vital_signs.work_of_breathing)}
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {activeScenario.initial_state.vital_signs && (
                            <div>
                              <h4 className="text-sm font-medium">Circulation</h4>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {renderVitalSign('Blood Pressure', activeScenario.initial_state.vital_signs.blood_pressure)}
                                {renderVitalSign('Heart Rate', activeScenario.initial_state.vital_signs.heart_rate)}
                                {renderVitalSign('MAP', activeScenario.initial_state.vital_signs.mean_arterial_pressure)}
                                {renderVitalSign('Peripheral Perfusion', activeScenario.initial_state.vital_signs.capillary_refill)}
                              </div>
                            </div>
                          )}

                          {activeScenario.initial_state.vital_signs && (
                            <div>
                              <h4 className="text-sm font-medium">Disability</h4>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {renderVitalSign('GCS', activeScenario.initial_state.vital_signs.gcs)}
                                {renderVitalSign('Pupils', activeScenario.initial_state.vital_signs.pupils)}
                                {renderVitalSign('Blood Glucose', activeScenario.initial_state.vital_signs.blood_glucose)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Secondary Assessment</h3>
                        <div className="space-y-3">
                          {activeScenario.initial_state.vital_signs && (
                            <div>
                              <h4 className="text-sm font-medium">Monitoring & Equipment</h4>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {renderVitalSign('CVP', activeScenario.initial_state.vital_signs.cvp)}
                                {renderVitalSign('EtCO2', activeScenario.initial_state.vital_signs.etco2)}
                                {renderVitalSign('Arterial Line', activeScenario.initial_state.vital_signs.art_line)}
                              </div>
                            </div>
                          )}

                          {activeScenario.initial_state.lab_values && (
                            <div>
                              <h4 className="text-sm font-medium">Lab Values</h4>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {Object.entries(activeScenario.initial_state.lab_values).map(([key, value]) => 
                                  renderVitalSign(key, value)
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {activeScenario.initial_state.current_interventions && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Current Interventions</h3>
                          <div className="space-y-2">
                            {activeScenario.initial_state.current_interventions.map((intervention, index) => (
                              <div key={index} className="text-sm">
                                • {intervention}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {activeScenario?.expected_actions?.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start"
                        onClick={() => handleAction(action)}
                      >
                        {action.action}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsSimulationActive(false);
                    setActiveScenario(null);
                  }}
                >
                  End Simulation
                </Button>
                <Button
                  onClick={() => getFeedbackMutation.mutate()}
                  disabled={getFeedbackMutation.isPending}
                >
                  Get Feedback
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Simulation Feedback
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4">
            <div className="space-y-4 p-4">
              {getFeedbackMutation.data && getFeedbackMutation.data.strengths && getFeedbackMutation.data.areas_for_improvement && (
                <>
                  <div>
                    <h3 className="font-medium mb-2">Strengths</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {getFeedbackMutation.data.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Areas for Improvement</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {getFeedbackMutation.data.areas_for_improvement.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {getFeedbackMutation.data.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
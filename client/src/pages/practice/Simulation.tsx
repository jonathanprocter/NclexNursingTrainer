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
import { Bot, Activity, Stethoscope, Pill, FileText, Syringe, AlertTriangle, Heart, Users } from "lucide-react";

interface SimulationState {
  patient_history?: string;
  chief_complaint?: string;
  airway_assessment?: string;
  vital_signs?: {
    respiratory_rate?: number;
    spo2?: number;
    work_of_breathing?: string;
    blood_pressure?: string;
    heart_rate?: number;
    mean_arterial_pressure?: number;
    capillary_refill?: string;
    gcs?: string;
    pupils?: string;
    blood_glucose?: number;
    cvp?: number;
    etco2?: number;
    art_line?: string;
  };
  lab_values?: Record<string, string | number>;
  current_interventions?: string[];
}

interface Action {
  action: string;
  feedback?: string;
  next_state?: Partial<SimulationState>;
}

type UserAction = {
  action: string;
  timestamp: string;
  response?: string;
};

export default function Simulation() {
  const { toast } = useToast();
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userActions, setUserActions] = useState<UserAction[]>([]);

  const startSimulationMutation = useMutation({
    mutationFn: async ({ difficulty, focusAreas }: { difficulty: string; focusAreas?: string[] }) => {
      console.log('Starting simulation with:', { difficulty, focusAreas });
      const scenario = await generateSimulationScenario(difficulty, focusAreas);
      console.log('Generated scenario:', scenario);
      return scenario;
    },
    onSuccess: (scenario) => {
      console.log('Successfully generated scenario:', scenario);
      if (!scenario.expected_actions || scenario.expected_actions.length === 0) {
        toast({
          title: "Error",
          description: "No actions available for this scenario",
          variant: "destructive",
        });
        return;
      }
      setActiveScenario(scenario);
      setIsSimulationActive(true);
      setUserActions([]);
      toast({
        title: "Simulation Started",
        description: "Your simulation scenario has been generated. Good luck!",
      });
    },
    onError: (error) => {
      console.error('Simulation generation error:', error);
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
      console.log('Getting feedback for actions:', userActions);
      return getSimulationFeedback(activeScenario, userActions);
    },
    onSuccess: (feedback) => {
      console.log('Received feedback:', feedback);
      setShowFeedback(true);
    },
    onError: (error) => {
      console.error('Feedback error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartSimulation = (difficulty: string) => {
    console.log('Starting simulation with difficulty:', difficulty);
    startSimulationMutation.mutate({
      difficulty,
      focusAreas: ["patient assessment", "critical thinking", "clinical decision making"]
    });
  };

  const handleAction = (action: Action | string) => {
    try {
      console.log('Action clicked:', action);

      if (!action) {
        console.error('Invalid action received');
        return;
      }

      const actionText = typeof action === 'string' ? action : action.action;
      console.log('Processing action:', actionText);

      const newAction: UserAction = {
        action: actionText,
        timestamp: new Date().toISOString()
      };

      setUserActions(prev => {
        console.log('Previous actions:', prev);
        console.log('Adding new action:', newAction);
        return [...prev, newAction];
      });

      if (typeof action === 'object' && action.feedback) {
        toast({
          title: "Action Feedback",
          description: action.feedback,
          duration: 3000,
        });
        newAction.response = action.feedback;
      }

      if (typeof action === 'object' && action.next_state && activeScenario) {
        console.log('Updating scenario state with:', action.next_state);
        setActiveScenario(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            initial_state: {
              ...prev.initial_state,
              ...action.next_state,
            },
          };
        });
      }

      console.log('Action processed successfully');
    } catch (error) {
      console.error('Error processing action:', error);
      toast({
        title: "Error",
        description: "Failed to process action",
        variant: "destructive",
      });
    }
  };

  const renderVitalSign = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === null) return null;

    // Format the vital sign value based on the key
    let displayValue = value;
    if (key.toLowerCase().includes('temperature')) {
      displayValue = `${value}°F`;
    } else if (key.toLowerCase().includes('pressure')) {
      displayValue = `${value} mmHg`;
    } else if (key.toLowerCase().includes('saturation') || key.toLowerCase().includes('spo2')) {
      displayValue = `${value}%`;
    }

    return (
      <div key={key} className="bg-muted p-2 rounded">
        <p className="text-sm font-medium">{key.replace(/_/g, ' ').toUpperCase()}</p>
        <p className="text-lg">{String(displayValue)}</p>
      </div>
    );
  };

  const generateBasicSkillsQuestions = () => {
    return [
      "What are the key components of a comprehensive patient assessment?",
      "Describe the procedure for measuring vital signs.",
      "Explain the steps involved in medication administration.",
      "How to accurately document patient information?"
    ];
  };

  const generateAdvancedSkillsQuestions = () => {
    return [
      "Describe a complex procedure and potential complications.",
      "Outline the steps for managing a specific emergency intervention.",
      "How to monitor critically ill patients?",
      "What are effective team leadership strategies in healthcare?"
    ];
  };


  const handleStartSkillPractice = (skillType: string, skillName: string) => {
      toast({
          title: "Skill Practice Started",
          description: `Starting ${skillType} skill practice for ${skillName}.`,
      });
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Basic Skills</h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Bot className="h-4 w-4" />
                    AI Help
                  </Button>
                </div>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Advanced Skills</h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Bot className="h-4 w-4" />
                    AI Help
                  </Button>
                </div>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
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
        if (!open && window.confirm("Are you sure you want to end the simulation?")) {
          setIsSimulationActive(false);
          setActiveScenario(null);
          setUserActions([]);
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

                          {activeScenario?.initial_state?.lab_values && Object.keys(activeScenario.initial_state.lab_values).length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium">Lab Values</h4>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {Object.entries(activeScenario.initial_state.lab_values || {}).map(([key, value]) => 
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
                    {Array.isArray(activeScenario?.expected_actions) ? (
                      activeScenario.expected_actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-start text-left w-full p-4 hover:bg-muted/80 active:scale-[0.98] transition-all"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Action button clicked:', action);
                            handleAction(action);
                          }}
                          disabled={getFeedbackMutation.isPending}
                        >
                          {typeof action === 'string' ? action : action.action}
                        </Button>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No actions available at this time.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to end the simulation?")) {
                      setIsSimulationActive(false);
                      setActiveScenario(null);
                      setUserActions([]);
                    }
                  }}
                >
                  End Simulation
                </Button>
                <Button
                  onClick={() => getFeedbackMutation.mutate()}
                  disabled={getFeedbackMutation.isPending || userActions.length === 0}
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
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Shield, 
  Brain, 
  ClipboardCheck, 
  Users, 
  BookOpen,
  Workflow,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";

interface RiskScenario {
  id: string;
  title: string;
  description: string;
  riskFactors: string[];
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export default function RiskReduction() {
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<RiskScenario | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      answer: "",
      riskAssessment: "",
    },
  });

  // Mock progress data - will be replaced with actual API call
  const progress = {
    scenariosCompleted: 0,
    totalScenarios: 20,
    correctResponses: 0,
    skillLevel: "Beginner",
  };

  // Mutation for generating new scenarios
  const generateScenarioMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/generate-risk-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to generate scenario");
      }

      return response.json();
    },
  });

  const handleGenerateScenario = async () => {
    setIsLoading(true);
    try {
      const result = await generateScenarioMutation.mutateAsync();
      setSelectedScenario(result);
      setShowExplanation(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate scenario. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAssessment = async (data: { riskAssessment: string }) => {
    // This would typically be validated against an API
    toast({
      title: "Assessment Submitted",
      description: "Your risk assessment has been recorded.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Risk Reduction</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn to identify and minimize patient safety risks in healthcare settings
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="safety">Safety Measures</TabsTrigger>
          <TabsTrigger value="prevention">Prevention Strategies</TabsTrigger>
          <TabsTrigger value="practice">Practice Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Management Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Core Components of Risk Reduction</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Risk Identification
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• Patient Assessment</li>
                          <li>• Environmental Hazards</li>
                          <li>• Medication Risks</li>
                          <li>• Procedural Risks</li>
                        </ul>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Prevention Strategies
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• Safety Protocols</li>
                          <li>• Communication Tools</li>
                          <li>• Preventive Measures</li>
                          <li>• Safety Barriers</li>
                        </ul>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          Critical Thinking
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• Risk Analysis</li>
                          <li>• Decision Making</li>
                          <li>• Outcome Evaluation</li>
                          <li>• Continuous Assessment</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Key Risk Areas in Healthcare</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Clinical Risks
                        </h4>
                        <ul className="text-sm space-y-2">
                          <li>• <span className="font-medium">Medication Errors:</span> Administration, dosing, and interaction risks</li>
                          <li>• <span className="font-medium">Patient Falls:</span> Assessment and prevention strategies</li>
                          <li>• <span className="font-medium">Infection Control:</span> Standard precautions and isolation protocols</li>
                          <li>• <span className="font-medium">Documentation:</span> Accurate and timely record-keeping</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Organizational Risks
                        </h4>
                        <ul className="text-sm space-y-2">
                          <li>• <span className="font-medium">Communication:</span> Handoff procedures and team coordination</li>
                          <li>• <span className="font-medium">Workflow:</span> Process improvement and efficiency</li>
                          <li>• <span className="font-medium">Resources:</span> Equipment and staffing management</li>
                          <li>• <span className="font-medium">Training:</span> Staff education and competency</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Your Progress</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Scenarios Completed</span>
                        <span>{progress.scenariosCompleted}/{progress.totalScenarios}</span>
                      </div>
                      <Progress 
                        value={(progress.scenariosCompleted / progress.totalScenarios) * 100} 
                        className="h-2" 
                      />
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Skill Level</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">{progress.skillLevel}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Success Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">
                              {progress.scenariosCompleted > 0
                                ? Math.round((progress.correctResponses / progress.scenariosCompleted) * 100)
                                : 0}%
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Next Milestone</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">
                              {progress.totalScenarios - progress.scenariosCompleted} scenarios
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle>Safety Measures Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Universal Safety Protocols
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Patient Identification</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Use two patient identifiers</li>
                        <li>• Verify ID before procedures</li>
                        <li>• Cross-check medication orders</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Hand Hygiene</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Follow WHO's 5 moments</li>
                        <li>• Proper technique and duration</li>
                        <li>• Use appropriate products</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Workflow className="h-5 w-5 mr-2" />
                    Workflow Safety
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Communication Handoffs</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Use standardized tools (SBAR)</li>
                        <li>• Document key information</li>
                        <li>• Verify understanding</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Environment Checks</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Regular safety rounds</li>
                        <li>• Equipment maintenance</li>
                        <li>• Hazard reporting</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prevention">
          <Card>
            <CardHeader>
              <CardTitle>Prevention Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Risk Assessment Tools</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Fall Risk Assessment</h4>
                      <p className="text-sm mb-2">Use validated tools like:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Morse Fall Scale</li>
                        <li>• STRATIFY Risk Assessment Tool</li>
                        <li>• Hendrich II Fall Risk Model</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Pressure Injury Prevention</h4>
                      <p className="text-sm mb-2">Regular assessment using:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Braden Scale</li>
                        <li>• Norton Scale</li>
                        <li>• Waterlow Score</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmitAssessment)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="riskAssessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Practice Risk Assessment</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Document your risk assessment findings here..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Submit Assessment</Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Practice Scenarios</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Apply your knowledge in realistic healthcare scenarios
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateScenario}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        New Scenario
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedScenario ? (
                  <div className="space-y-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">{selectedScenario.title}</h3>
                      <p className="text-sm mb-4">{selectedScenario.description}</p>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Risk Factors:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selectedScenario.riskFactors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Form {...form}>
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select the best course of action:</Label>
                          <RadioGroup
                            onValueChange={(value) => {
                              form.setValue("answer", value);
                              setShowExplanation(true);
                            }}
                          >
                            {selectedScenario.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`}>{option.text}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </form>
                    </Form>

                    {showExplanation && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <h4 className="font-medium">Explanation</h4>
                        </div>
                        <p className="text-sm">
                          {selectedScenario.options.find(
                            (_, index) => index.toString() === form.getValues("answer")
                          )?.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No Scenario Selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Click "New Scenario" to start practicing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
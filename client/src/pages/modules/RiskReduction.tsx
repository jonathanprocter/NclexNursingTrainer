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
  CheckCircle2,
  ListChecks,
  FileLock2,
  Stethoscope
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

interface FormValues {
  answer: string;
  riskAssessment: string;
  preventionQ1: string;
}

export default function RiskReduction() {
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<RiskScenario | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      answer: "",
      riskAssessment: "",
      preventionQ1: ""
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
        <h1 className="text-3xl font-bold mb-2">Risk Reduction in Nursing Practice</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master essential risk reduction concepts and strategies for safe, high-quality patient care
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="safety">Safety Measures</TabsTrigger>
          <TabsTrigger value="prevention">Prevention Strategies</TabsTrigger>
          <TabsTrigger value="practice">Practice Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>NCLEX Risk Management Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Core Components for NCLEX Preparation</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <ListChecks className="h-4 w-4 mr-2" />
                          Patient Safety Goals
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• International Patient Safety Goals</li>
                          <li>• National Patient Safety Goals</li>
                          <li>• Facility-Specific Safety Protocols</li>
                          <li>• Quality Indicators Monitoring</li>
                        </ul>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <FileLock2 className="h-4 w-4 mr-2" />
                          Regulatory Compliance
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• Joint Commission Standards</li>
                          <li>• CMS Requirements</li>
                          <li>• State-Specific Regulations</li>
                          <li>• Professional Standards</li>
                        </ul>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Stethoscope className="h-4 w-4 mr-2" />
                          Clinical Risk Assessment
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• Systematic Assessment Tools</li>
                          <li>• Risk Stratification Methods</li>
                          <li>• Documentation Requirements</li>
                          <li>• Intervention Planning</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">High-Priority NCLEX Topics</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Safety Management</h4>
                        <ul className="text-sm space-y-2">
                          <li>• <span className="font-medium">Error Prevention:</span> Root cause analysis, near-miss reporting</li>
                          <li>• <span className="font-medium">Environmental Safety:</span> Fall prevention, infection control</li>
                          <li>• <span className="font-medium">Medication Safety:</span> High-alert medications, rights of administration</li>
                          <li>• <span className="font-medium">Emergency Preparedness:</span> Disaster protocols, rapid response</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Quality Improvement</h4>
                        <ul className="text-sm space-y-2">
                          <li>• <span className="font-medium">Performance Measures:</span> Core measures, benchmarking</li>
                          <li>• <span className="font-medium">Evidence-Based Practice:</span> Clinical guidelines, best practices</li>
                          <li>• <span className="font-medium">Documentation:</span> Legal requirements, incident reporting</li>
                          <li>• <span className="font-medium">Team Communication:</span> SBAR, handoff procedures</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Common NCLEX Risk Reduction Questions</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Question Types</h4>
                            <ul className="text-sm space-y-2">
                              <li>• Priority Setting Questions</li>
                              <li>• Multiple Patient Scenarios</li>
                              <li>• Delegation and Assignment</li>
                              <li>• Safety Protocol Implementation</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Key Testing Strategies</h4>
                            <ul className="text-sm space-y-2">
                              <li>• Focus on safety first in all scenarios</li>
                              <li>• Apply Maslow's hierarchy to prioritize</li>
                              <li>• Consider least restrictive approaches</li>
                              <li>• Look for immediate risk factors</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>Critical Thinking in Risk Assessment</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Assessment Framework</h4>
                            <ul className="text-sm space-y-2">
                              <li>• Systematic data collection</li>
                              <li>• Pattern recognition</li>
                              <li>• Risk factor identification</li>
                              <li>• Intervention planning</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Decision-Making Process</h4>
                            <ul className="text-sm space-y-2">
                              <li>• Evidence evaluation</li>
                              <li>• Clinical judgment application</li>
                              <li>• Resource utilization</li>
                              <li>• Outcome evaluation</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
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
              <CardTitle>Evidence-Based Safety Measures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Universal Safety Protocols (USP)
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Patient Identification</h4>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Key Components:</p>
                        <ul className="text-sm space-y-2">
                          <li>• Use minimum two identifiers (full name, DOB, MRN)</li>
                          <li>• Verify before all procedures and treatments</li>
                          <li>• Match identifiers with all documentation</li>
                        </ul>
                        <p className="text-sm font-medium mt-2">NCLEX Focus:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Never use room numbers as identifiers</li>
                          <li>• Verify even when you "know" the patient</li>
                          <li>• Check identification bands for accuracy</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Time-Out Procedures</h4>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Essential Steps:</p>
                        <ul className="text-sm space-y-2">
                          <li>• Active participation of all team members</li>
                          <li>• Verification of correct patient, site, procedure</li>
                          <li>• Documentation of completed time-out</li>
                        </ul>
                        <p className="text-sm font-medium mt-2">Critical Points:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Must occur before incision/procedure start</li>
                          <li>• All activity must stop during time-out</li>
                          <li>• Address any team member concerns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Workflow className="h-5 w-5 mr-2" />
                    High-Risk Procedures
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Medication Administration</h4>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Five Rights Plus:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Right patient, drug, dose, route, time</li>
                          <li>• Right documentation and reason</li>
                          <li>• Right response and monitoring</li>
                        </ul>
                        <p className="text-sm font-medium mt-2">High-Alert Medications:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Independent double checks required</li>
                          <li>• Special labeling and storage</li>
                          <li>• Enhanced monitoring protocols</li>
                        </ul>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="safety-1">
                        <AccordionTrigger>Common Safety Challenges & Solutions</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Communication Barriers</h4>
                              <ul className="text-sm space-y-2">
                                <li>• Use teach-back method to verify understanding</li>
                                <li>• Implement standardized communication tools</li>
                                <li>• Document all communication attempts and outcomes</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Environmental Risks</h4>
                              <ul className="text-sm space-y-2">
                                <li>• Conduct regular environmental safety rounds</li>
                                <li>• Address hazards immediately</li>
                                <li>• Maintain clear evacuation routes</li>
                              </ul>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="safety-2">
                        <AccordionTrigger>NCLEX Safety Considerations</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Priority Assessment Points</h4>
                              <ul className="text-sm space-y-2">
                                <li>• Always assess airway, breathing, circulation first</li>
                                <li>• Look for immediate safety threats</li>
                                <li>• Consider both physical and psychological safety</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Critical Thinking Tips</h4>
                              <ul className="text-sm space-y-2">
                                <li>• Safety always comes before convenience</li>
                                <li>• Prevention is better than intervention</li>
                                <li>• When in doubt, verify and document</li>
                              </ul>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prevention">
          <Card>
            <CardHeader>
              <CardTitle>Prevention Strategies Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Risk Prevention Quiz</h3>
                  <Form {...form}>
                    <form className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Question 1: Fall Prevention</h4>
                          <p className="text-sm mb-3">
                            A patient has been admitted with dizziness and weakness. Which combination of interventions best addresses fall prevention?
                          </p>
                          <RadioGroup
                            onValueChange={(value) => {
                              form.setValue("preventionQ1", value);
                              setShowExplanation(true);
                            }}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="a" id="q1-a" />
                                <Label htmlFor="q1-a">Bed alarm and restraints</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="b" id="q1-b" />
                                <Label htmlFor="q1-b">Fall risk assessment, bed in low position, non-slip footwear, and scheduled assistance</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="c" id="q1-c" />
                                <Label htmlFor="q1-c">Keeping patient in bed and raising all rails</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="d" id="q1-d" />
                                <Label htmlFor="q1-d">Telling family to watch patient</Label>
                              </div>
                            </div>
                          </RadioGroup>

                          {form.watch("preventionQ1") && (
                            <div className="mt-4 p-4 bg-background/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <h4 className="font-medium">Explanation</h4>
                              </div>
                              <p className="text-sm">
                                Option B is correct. This approach provides a comprehensive fall prevention strategy that:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  <li>Identifies specific risk factors through assessment</li>
                                  <li>Implements multiple evidence-based preventive measures</li>
                                  <li>Maintains patient dignity and independence</li>
                                  <li>Follows best practices for fall prevention</li>
                                </ul>
                              </p>
                              <div className="mt-4">
                                <h5 className="font-medium mb-2">Conceptual Breakdown:</h5>
                                <ul className="text-sm space-y-2">
                                  <li>• <span className="font-medium">Assessment First:</span> Always begin with a thorough risk assessment</li>
                                  <li>• <span className="font-medium">Multiple Interventions:</span> Fall prevention requires a multi-faceted approach</li>
                                  <li>• <span className="font-medium">Least Restrictive:</span> Avoid restraints when possible</li>
                                  <li>• <span className="font-medium">Proactive Planning:</span> Scheduled assistance prevents unplanned activities</li>
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Additional prevention questions follow the same pattern */}
                      </div>
                    </form>
                  </Form>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Frequently Asked Questions</h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="faq-1">
                      <AccordionTrigger>
                        What are the key components of a comprehensive risk prevention strategy?
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <p className="text-sm">A comprehensive risk prevention strategy includes:</p>
                          <ul className="text-sm space-y-2">
                            <li>1. Regular risk assessments using validated tools</li>
                            <li>2. Implementation of evidence-based preventive measures</li>
                            <li>3. Staff education and competency validation</li>
                            <li>4. Continuous monitoring and outcome evaluation</li>
                            <li>5. Documentation and communication protocols</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="faq-2">
                      <AccordionTrigger>
                        How do you prioritize multiple risk factors?
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <p className="text-sm">Prioritization should consider:</p>
                          <ul className="text-sm space-y-2">
                            <li>• Immediate threats to life or safety</li>
                            <li>• Potential for serious harm</li>
                            <li>• Number of patients affected</li>
                            <li>• Available resources</li>
                            <li>• Regulatory requirements</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
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
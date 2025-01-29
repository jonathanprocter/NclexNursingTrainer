import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { 
  CheckCircle2, 
  RefreshCw,
  ListChecks,
  Shield,
  FileLock2,
  Stethoscope,
  BookOpen 
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Form } from "@/components/ui/form";


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
  [key: string]: string; 
}

interface PreventionQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
  }[];
  correctAnswer: string;
  explanation: {
    main: string;
    concepts: {
      title: string;
      description: string;
    }[];
  };
}

const initialPreventionQuestions: PreventionQuestion[] = [
  {
    id: "q1",
    question: "A patient has been admitted with dizziness and weakness. Which combination of interventions best addresses fall prevention?",
    options: [
      { value: "a", label: "Bed alarm and restraints" },
      { value: "b", label: "Fall risk assessment, bed in low position, non-slip footwear, and scheduled assistance" },
      { value: "c", label: "Keeping patient in bed and raising all rails" },
      { value: "d", label: "Telling family to watch patient" }
    ],
    correctAnswer: "b",
    explanation: {
      main: "Option B provides a comprehensive fall prevention strategy that addresses multiple risk factors while maintaining patient dignity and independence.",
      concepts: [
        {
          title: "Assessment First",
          description: "Always begin with a thorough risk assessment"
        },
        {
          title: "Multiple Interventions",
          description: "Fall prevention requires a multi-faceted approach"
        },
        {
          title: "Least Restrictive",
          description: "Avoid restraints when possible"
        },
        {
          title: "Proactive Planning",
          description: "Scheduled assistance prevents unplanned activities"
        }
      ]
    }
  },
  {
    id: "q2",
    question: "Which intervention is most appropriate for preventing pressure injuries in a bedbound patient?",
    options: [
      { value: "a", label: "Turning and repositioning every 4 hours" },
      { value: "b", label: "Applying lotion to bony prominences" },
      { value: "c", label: "Implementing a turning schedule every 2 hours and conducting skin assessments" },
      { value: "d", label: "Using a foam mattress only" }
    ],
    correctAnswer: "c",
    explanation: {
      main: "Regular repositioning every 2 hours combined with skin assessments is the gold standard for pressure injury prevention.",
      concepts: [
        {
          title: "Time Factor",
          description: "2-hour interval is evidence-based for tissue recovery"
        },
        {
          title: "Assessment Integration",
          description: "Regular skin checks allow early intervention"
        },
        {
          title: "Comprehensive Care",
          description: "Combines prevention with monitoring"
        }
      ]
    }
  },
  // Add 8 more questions following the same pattern...
];

interface Progress {
  scenariosCompleted: number;
  totalScenarios: number;
  correctResponses: number;
  skillLevel: string;
}

export default function RiskReduction() {
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<RiskScenario | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [answerSelected, setAnswerSelected] = useState<{ [key: number]: string }>({});
  const [preventionQuestions, setPreventionQuestions] = useState(initialPreventionQuestions);
  const isMounted = useRef(true);
  const [progress, setProgress] = useState<Progress>({
    scenariosCompleted: 0,
    totalScenarios: 20,
    correctResponses: 0,
    skillLevel: "Beginner"
  });

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const generateMoreQuestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/exam/prevention/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previousQuestions: preventionQuestions.map(q => q.id)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      return response.json();
    },
    onSuccess: (newQuestions) => {
      if (isMounted.current) {
        setPreventionQuestions(prev => [...prev, ...newQuestions]);
        toast({
          title: "New questions added!",
          description: "Additional practice questions are now available.",
        });
      }
    },
    onError: () => {
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to generate new questions. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleGenerateMoreQuestions = () => {
    if (!isMounted.current || isGeneratingQuestions) return;
    setIsGeneratingQuestions(true);
    generateMoreQuestionsMutation.mutate(undefined, {
      onSettled: () => {
        if (isMounted.current) {
          setIsGeneratingQuestions(false);
        }
      },
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < preventionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleAnswerSelect = (value: string) => {
    setAnswerSelected(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
    setShowExplanation(true);
  };

  const renderPreventionStrategies = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prevention Strategies Assessment</CardTitle>
        <AIHelpButton
          title="Prevention Strategies"
          description="Get AI assistance with understanding prevention strategies and risk reduction techniques."
          topic="prevention strategies and risk reduction in nursing practice"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                Question {currentQuestionIndex + 1} of {preventionQuestions.length}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === preventionQuestions.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">
                  {preventionQuestions[currentQuestionIndex].question}
                </h4>
                <RadioGroup
                  value={answerSelected[currentQuestionIndex] || ""}
                  onValueChange={handleAnswerSelect}
                  className="space-y-2"
                >
                  {preventionQuestions[currentQuestionIndex].options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`q${currentQuestionIndex}-${option.value}`}
                      />
                      <Label htmlFor={`q${currentQuestionIndex}-${option.value}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {showExplanation && (
                  <div className="mt-4 p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">Explanation</h4>
                    </div>
                    <p className="text-sm">
                      {preventionQuestions[currentQuestionIndex].explanation.main}
                    </p>
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Conceptual Breakdown:</h5>
                      <ul className="text-sm space-y-2">
                        {preventionQuestions[currentQuestionIndex].explanation.concepts.map(
                          (concept, index) => (
                            <li key={index}>
                              • <span className="font-medium">{concept.title}:</span>{" "}
                              {concept.description}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerateMoreQuestions}
              disabled={isGeneratingQuestions}
              className="w-full max-w-md"
            >
              Generate More Questions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const generateScenarioMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/exam/regular/question", {
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
    if (!isMounted.current) return;

    setIsLoading(true);
    try {
      const result = await generateScenarioMutation.mutateAsync();
      if (isMounted.current) {
        setSelectedScenario(result);
        setShowExplanation(false);
      }
    } catch (error) {
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to generate scenario. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitAssessment = async (data: { riskAssessment: string }) => {
    if (!isMounted.current) return;

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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>NCLEX Risk Management Framework</CardTitle>
                <AIHelpButton
                  title="Risk Management Framework"
                  description="Get AI assistance with understanding risk management concepts and their application in nursing practice."
                  topic="risk management framework and NCLEX preparation"
                />
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Evidence-Based Safety Measures</CardTitle>
              <AIHelpButton
                title="Safety Measures"
                description="Get AI assistance with understanding and implementing safety measures in nursing practice."
                topic="evidence-based safety measures"
              />
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
                        <p className="text-sm font-medium">NCLEX Focus Points:</p>
                        <ul className="text-sm space-y-2">
                          <li>• Two unique identifiers required by Joint Commission standards</li>
                          <li>• Acceptable identifiers: full name, DOB, MRN (NOT room number)</li>
                          <li>• Critical times for verification: medication administration, procedures, specimen collection</li>
                          <li>• Special considerations: similar names, language barriers, unconscious patients</li>
                          <li>• Documentation requirements for identification verification</li>
                        </ul>
                        <p className="text-sm font-medium mt-4">Common Pitfalls:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Relying on room numbers or bed location</li>
                          <li>• Assuming patient identity without verification</li>
                          <li>• Incomplete verification during emergencies</li>
                          <li>• Not following facility-specific protocols</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">High-Risk Procedures</h4>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Critical Elements:</p>
                        <ul className="text-sm space-y-2">
                          <li>• Universal Protocol components and implementation</li>
                          <li>• Site marking requirements and exceptions</li>
                          <li>• Time-out process and documentation</li>
                          <li>• Role-specific responsibilities during procedures</li>
                        </ul>
                        <p className="text-sm font-medium mt-4">Safety Checklist:</p>
                        <ul className="text-sm space-y-1">
                          <li>• Pre-procedure verification process</li>
                          <li>• Consent verification and documentation</li>
                          <li>• Equipment and supply checks</li>
                          <li>• Post-procedure monitoring requirements</li>
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
          {renderPreventionStrategies()}
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

                    <Form>
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select the best course of action:</Label>
                          <RadioGroup
                            onValueChange={(value) => {
                              //form.setValue("answer", value);
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
                          {selectedScenario.options
                            ?.find(
                              (_, index) => index.toString() ===  "answer" //form.getValues("answer")
                            )?.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 w-12 text-muted-foreground/50" />
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
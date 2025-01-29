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
  BookOpen,
  ClipboardList,
  XCircle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
        }
      ]
    }
  },
  {
    id: "q3",
    question: "A nurse is caring for multiple patients. Which action best prevents medication errors?",
    options: [
      { value: "a", label: "Preparing medications for all patients at once" },
      { value: "b", label: "Verifying the five rights for each medication individually" },
      { value: "c", label: "Delegating medication administration to unlicensed personnel" },
      { value: "d", label: "Relying on memory for regular medications" }
    ],
    correctAnswer: "b",
    explanation: {
      main: "Following the five rights of medication administration for each medication individually is essential for preventing errors.",
      concepts: [
        {
          title: "Individual Verification",
          description: "Each medication requires separate verification"
        },
        {
          title: "Safety Protocol",
          description: "The five rights are fundamental to medication safety"
        }
      ]
    }
  },
  {
    id: "q4",
    question: "Which nursing intervention is most effective in preventing ventilator-associated pneumonia (VAP)?",
    options: [
      { value: "a", label: "Maintaining head of bed at 30-45 degrees" },
      { value: "b", label: "Changing ventilator circuits daily" },
      { value: "c", label: "Using sterile gloves only" },
      { value: "d", label: "Increasing sedation" }
    ],
    correctAnswer: "a",
    explanation: {
      main: "Elevating the head of bed prevents aspiration and reduces the risk of VAP.",
      concepts: [
        {
          title: "Positioning",
          description: "Proper positioning prevents aspiration"
        },
        {
          title: "Evidence-Based Care",
          description: "Part of VAP prevention bundle"
        }
      ]
    }
  },
  {
    id: "q5",
    question: "To prevent central line-associated bloodstream infections (CLABSI), which intervention should the nurse implement?",
    options: [
      { value: "a", label: "Changing dressings when visibly soiled only" },
      { value: "b", label: "Using maximum sterile barrier precautions during insertion" },
      { value: "c", label: "Replacing administration sets every 12 hours" },
      { value: "d", label: "Applying antibiotic ointment to the insertion site" }
    ],
    correctAnswer: "b",
    explanation: {
      main: "Maximum sterile barrier precautions during insertion significantly reduce CLABSI risk.",
      concepts: [
        {
          title: "Sterile Technique",
          description: "Critical for preventing contamination"
        },
        {
          title: "Bundle Compliance",
          description: "Part of evidence-based CLABSI prevention"
        }
      ]
    }
  },
  {
    id: "q6",
    question: "Which nursing intervention best prevents surgical site infections?",
    options: [
      { value: "a", label: "Maintaining normothermia during surgery" },
      { value: "b", label: "Shaving the surgical site the night before" },
      { value: "c", label: "Applying heat to the surgical site" },
      { value: "d", label: "Removing dressings frequently to check wound" }
    ],
    correctAnswer: "a",
    explanation: {
      main: "Maintaining normothermia during surgery is evidence-based practice for preventing surgical site infections.",
      concepts: [
        {
          title: "Temperature Control",
          description: "Affects immune function and healing"
        },
        {
          title: "Prevention Strategy",
          description: "Part of surgical care improvement protocols"
        }
      ]
    }
  },
  {
    id: "q7",
    question: "A nurse is implementing fall prevention strategies. Which assessment finding requires immediate intervention?",
    options: [
      { value: "a", label: "Patient requests assistance to bathroom" },
      { value: "b", label: "Patient taking multiple antihypertensive medications" },
      { value: "c", label: "Patient attempting to get out of bed while confused" },
      { value: "d", label: "Patient wearing non-slip socks" }
    ],
    correctAnswer: "c",
    explanation: {
      main: "A confused patient attempting to get out of bed presents an immediate fall risk requiring urgent intervention.",
      concepts: [
        {
          title: "Risk Recognition",
          description: "Identifying immediate safety threats"
        },
        {
          title: "Prompt Response",
          description: "Preventing imminent falls"
        }
      ]
    }
  },
  {
    id: "q8",
    question: "Which intervention is most effective in preventing catheter-associated urinary tract infections (CAUTI)?",
    options: [
      { value: "a", label: "Daily catheter care with soap and water" },
      { value: "b", label: "Regular assessment for continued catheter need" },
      { value: "c", label: "Routine catheter irrigation" },
      { value: "d", label: "Using larger catheter sizes" }
    ],
    correctAnswer: "b",
    explanation: {
      main: "Daily assessment of catheter necessity and prompt removal when no longer needed is the most effective CAUTI prevention strategy.",
      concepts: [
        {
          title: "Duration Control",
          description: "Shorter duration reduces infection risk"
        },
        {
          title: "Assessment Priority",
          description: "Regular evaluation of necessity"
        }
      ]
    }
  },
  {
    id: "q9",
    question: "To prevent medication errors during patient transfers, which action is most important?",
    options: [
      { value: "a", label: "Conducting medication reconciliation" },
      { value: "b", label: "Transferring all medications with patient" },
      { value: "c", label: "Disposing of previous medications" },
      { value: "d", label: "Rewriting all orders" }
    ],
    correctAnswer: "a",
    explanation: {
      main: "Medication reconciliation during transitions of care prevents errors and ensures continuity of appropriate therapy.",
      concepts: [
        {
          title: "Transition Safety",
          description: "Critical point for medication errors"
        },
        {
          title: "Verification Process",
          description: "Ensures medication accuracy"
        }
      ]
    }
  },
  {
    id: "q10",
    question: "Which intervention best prevents deep vein thrombosis (DVT) in a postoperative patient?",
    options: [
      { value: "a", label: "Maintaining bed rest for 24 hours" },
      { value: "b", label: "Early mobilization and sequential compression devices" },
      { value: "c", label: "Elastic stockings alone" },
      { value: "d", label: "Keeping legs elevated continuously" }
    ],
    correctAnswer: "b",
    explanation: {
      main: "Early mobilization combined with mechanical prophylaxis provides optimal DVT prevention in postoperative patients.",
      concepts: [
        {
          title: "Combined Approach",
          description: "Multiple prevention strategies are most effective"
        },
        {
          title: "Early Intervention",
          description: "Proactive prevention is key"
        }
      ]
    }
  }
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
  const [answerResults, setAnswerResults] = useState<{ [key: number]: boolean }>({});
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
      const currentQuestionIds = preventionQuestions.map(q => q.id);
      console.log('Sending request with previous questions:', currentQuestionIds);

      const response = await fetch("/api/exam/prevention/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previousQuestions: currentQuestionIds
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate questions: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received new questions:', data);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid response format or no questions received");
      }

      return data;
    },
    onSuccess: (newQuestions) => {
      if (isMounted.current) {
        setPreventionQuestions(prev => [...prev, ...newQuestions]);
        toast({
          title: "New questions added!",
          description: `Added ${newQuestions.length} new questions to your practice set.`,
        });
      }
    },
    onError: (error) => {
      if (isMounted.current) {
        console.error('Question generation error:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to generate new questions. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleGenerateMoreQuestions = async () => {
    if (!isMounted.current || isGeneratingQuestions) return;

    setIsGeneratingQuestions(true);
    console.log('Generating new questions...');

    try {
      await generateMoreQuestionsMutation.mutateAsync();
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      if (isMounted.current) {
        setIsGeneratingQuestions(false);
      }
    }
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

    // Check if answer is correct
    const isCorrect = value === preventionQuestions[currentQuestionIndex].correctAnswer;
    setAnswerResults(prev => ({
      ...prev,
      [currentQuestionIndex]: isCorrect
    }));

    // Update progress
    if (!answeredQuestions.has(preventionQuestions[currentQuestionIndex].id)) {
      setAnsweredQuestions(prev => new Set([...prev, preventionQuestions[currentQuestionIndex].id]));
      if (isCorrect) {
        setProgress(prev => ({
          ...prev,
          correctResponses: prev.correctResponses + 1,
          scenariosCompleted: prev.scenariosCompleted + 1
        }));
      } else {
        setProgress(prev => ({
          ...prev,
          scenariosCompleted: prev.scenariosCompleted + 1
        }));
      }
    }

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
                  disabled={answeredQuestions.has(preventionQuestions[currentQuestionIndex].id)}
                >
                  {preventionQuestions[currentQuestionIndex].options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`q${currentQuestionIndex}-${option.value}`}
                      />
                      <Label
                        htmlFor={`q${currentQuestionIndex}-${option.value}`}
                        className={
                          showExplanation
                            ? option.value === preventionQuestions[currentQuestionIndex].correctAnswer
                              ? "text-green-600 font-medium"
                              : answerSelected[currentQuestionIndex] === option.value
                              ? "text-red-600"
                              : ""
                            : ""
                        }
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {showExplanation && (
                  <div className="mt-4 p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {answerResults[currentQuestionIndex] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <h4 className="font-medium">
                        {answerResults[currentQuestionIndex] ? "Correct!" : "Incorrect"}
                      </h4>
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
              {isGeneratingQuestions ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate More Questions"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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

    <Tabs defaultValue="prevention" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="safety">Safety Measures</TabsTrigger>
        <TabsTrigger value="prevention">Prevention Strategies</TabsTrigger>
        <TabsTrigger value="practice">Practice Scenarios</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {/* Overview content */}
      </TabsContent>

      <TabsContent value="safety">
        {/* Safety Measures content */}
      </TabsContent>

      <TabsContent value="prevention">
        {renderPreventionStrategies()}
      </TabsContent>

      <TabsContent value="practice">
        {/* Practice Scenarios content */}
      </TabsContent>
    </Tabs>
  </div>
);
}
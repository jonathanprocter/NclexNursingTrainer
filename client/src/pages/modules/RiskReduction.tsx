import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { AIHelpButton } from "../components/ui/ai-help-button";
import { CheckCircle2, RefreshCw, XCircle, Shield, BookOpen, AlertTriangle, Stethoscope, ClipboardCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

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

export default function RiskReduction() {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [answerSelected, setAnswerSelected] = useState<{ [key: number]: string }>({});
  const [preventionQuestions, setPreventionQuestions] = useState<PreventionQuestion[]>([]);
  const [answerResults, setAnswerResults] = useState<{ [key: number]: boolean }>({});
  const isMounted = useRef(true);

  const preloadedQuestions = [
    {
      id: "preload_1",
      question: "Which nursing intervention is most effective in preventing falls in elderly patients?",
      options: [
        { value: "a", label: "Regular exercise and balance training programs" },
        { value: "b", label: "Continuous bed rest" },
        { value: "c", label: "Sedation during nighttime" },
        { value: "d", label: "Using restraints when unattended" }
      ],
      correctAnswer: "a",
      explanation: {
        main: "Regular exercise and balance training programs help improve strength, coordination, and balance, reducing fall risk in elderly patients.",
        concepts: [
          { title: "Fall Prevention", description: "Exercise improves muscle strength and balance" },
          { title: "Evidence-Based Practice", description: "Research supports exercise as effective fall prevention" }
        ]
      }
    },
    {
      id: "preload_2",
      question: "What is the most effective method to prevent hospital-acquired infections?",
      options: [
        { value: "a", label: "Universal use of antibiotics" },
        { value: "b", label: "Hand hygiene before and after patient contact" },
        { value: "c", label: "Wearing gloves at all times" },
        { value: "d", label: "Isolating all patients" }
      ],
      correctAnswer: "b",
      explanation: {
        main: "Hand hygiene is the single most effective method to prevent hospital-acquired infections.",
        concepts: [
          { title: "Infection Control", description: "Hand hygiene is fundamental to infection prevention" },
          { title: "Standard Precautions", description: "Basic level of infection control precautions" }
        ]
      }
    },
    {
      id: "preload_3",
      question: "Which intervention best prevents pressure ulcers in bedbound patients?",
      options: [
        { value: "a", label: "Repositioning every 2 hours" },
        { value: "b", label: "Applying lotion daily" },
        { value: "c", label: "Using a firm mattress" },
        { value: "d", label: "Massaging reddened areas" }
      ],
      correctAnswer: "a",
      explanation: {
        main: "Regular repositioning every 2 hours helps prevent pressure ulcers by relieving pressure on vulnerable areas.",
        concepts: [
          { title: "Pressure Relief", description: "Regular repositioning prevents tissue damage" },
          { title: "Risk Assessment", description: "Early intervention prevents complications" }
        ]
      }
    },
    {
      id: "preload_4",
      question: "What is the best strategy to prevent medication errors?",
      options: [
        { value: "a", label: "Memorizing common medications" },
        { value: "b", label: "Following the five rights of medication administration" },
        { value: "c", label: "Using only verbal orders" },
        { value: "d", label: "Preparing medications in advance" }
      ],
      correctAnswer: "b",
      explanation: {
        main: "The five rights of medication administration provide a systematic approach to prevent medication errors.",
        concepts: [
          { title: "Medication Safety", description: "Systematic verification prevents errors" },
          { title: "Patient Safety", description: "Standardized processes reduce risks" }
        ]
      }
    },
    {
      id: "preload_5",
      question: "Which intervention best prevents surgical site infections?",
      options: [
        { value: "a", label: "Prophylactic antibiotics within prescribed timeframe" },
        { value: "b", label: "Extended use of antibiotics post-surgery" },
        { value: "c", label: "Daily dressing changes" },
        { value: "d", label: "Application of topical antibiotics" }
      ],
      correctAnswer: "a",
      explanation: {
        main: "Timely administration of prophylactic antibiotics is crucial in preventing surgical site infections.",
        concepts: [
          { title: "Surgical Prophylaxis", description: "Timing of antibiotics is critical" },
          { title: "Infection Prevention", description: "Evidence-based protocols reduce infection risk" }
        ]
      }
    },
    {
      id: "preload_6",
      question: "What is the most effective way to prevent ventilator-associated pneumonia?",
      options: [
        { value: "a", label: "Head of bed elevation to 30-45 degrees" },
        { value: "b", label: "Frequent nebulizer treatments" },
        { value: "c", label: "Continuous sedation" },
        { value: "d", label: "Extended antibiotic prophylaxis" }
      ],
      correctAnswer: "a",
      explanation: {
        main: "Elevating the head of bed reduces aspiration risk and helps prevent ventilator-associated pneumonia.",
        concepts: [
          { title: "VAP Prevention", description: "Positioning reduces aspiration risk" },
          { title: "Critical Care", description: "Evidence-based bundle reduces complications" }
        ]
      }
    },
    {
      id: "preload_7",
      question: "Which intervention best prevents deep vein thrombosis in hospitalized patients?",
      options: [
        { value: "a", label: "Early mobilization and sequential compression devices" },
        { value: "b", label: "Continuous bed rest" },
        { value: "c", label: "Fluid restriction" },
        { value: "d", label: "Heat application to legs" }
      ],
      correctAnswer: "a",
      explanation: {
        main: "Early mobilization and mechanical prophylaxis help prevent blood stasis and clot formation.",
        concepts: [
          { title: "DVT Prevention", description: "Movement promotes circulation" },
          { title: "Risk Reduction", description: "Mechanical methods reduce clot formation" }
        ]
      }
    },
    {
      id: "preload_8",
      question: "What is the best approach to prevent central line-associated bloodstream infections?",
      options: [
        { value: "a", label: "Maximum sterile barrier precautions during insertion" },
        { value: "b", label: "Routine central line changes" },
        { value: "c", label: "Daily prophylactic antibiotics" },
        { value: "d", label: "Using uncoated catheters" }
      ],
      correctAnswer: "a",
      explanation: {
        main: "Maximum sterile barrier precautions during insertion are crucial in preventing central line infections.",
        concepts: [
          { title: "CLABSI Prevention", description: "Sterile technique is essential" },
          { title: "Bundle Approach", description: "Multiple interventions reduce infection risk" }
        ]
      }
    },
    {
      id: "preload_9",
      question: "Which intervention best prevents catheter-associated urinary tract infections?",
      options: [
        { value: "a", label: "Daily catheter care and early removal" },
        { value: "b", label: "Routine antibiotic prophylaxis" },
        { value: "c", label: "Frequent catheter changes" },
        { value: "d", label: "Using larger catheters" }
      ],
      correctAnswer: "a",
      explanation: {
        main: "Daily assessment of catheter necessity and early removal when appropriate best prevents CAUTIs.",
        concepts: [
          { title: "CAUTI Prevention", description: "Duration of catheterization affects risk" },
          { title: "Evidence-Based Care", description: "Early removal reduces infection risk" }
        ]
      }
    },
    {
      id: "preload_10",
      question: "What is the most effective strategy to prevent medication errors in pediatric patients?",
      options: [
        { value: "a", label: "Double-checking weight-based calculations" },
        { value: "b", label: "Using adult dosages" },
        { value: "c", label: "Estimating weights" },
        { value: "d", label: "Rounding up doses" }
      ],
      correctAnswer: "a",
      explanation: {
        main: "Double-checking weight-based calculations is crucial in preventing medication errors in pediatric patients.",
        concepts: [
          { title: "Pediatric Safety", description: "Weight-based dosing requires precision" },
          { title: "Medication Safety", description: "Verification prevents calculation errors" }
        ]
      }
    }
  ];

  useEffect(() => {
    if (preventionQuestions.length === 0) {
      setPreventionQuestions(preloadedQuestions);
    }
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
        // Set some default questions if API fails
        setPreventionQuestions([
          {
            id: "default_1",
            question: "Which nursing intervention best demonstrates proper infection control?",
            options: [
              { value: "a", label: "Performing hand hygiene before and after patient contact" },
              { value: "b", label: "Wearing the same gloves between patients" },
              { value: "c", label: "Reusing personal protective equipment" },
              { value: "d", label: "Using hand sanitizer without washing visibly soiled hands" }
            ],
            correctAnswer: "a",
            explanation: {
              main: "Hand hygiene is the most effective way to prevent infection spread.",
              concepts: [
                {
                  title: "Basic Prevention",
                  description: "Hand hygiene is fundamental to infection control"
                }
              ]
            }
          }
        ]);
      }
    },
  });

  const handleGenerateMoreQuestions = async () => {
    if (!isMounted.current || isGeneratingQuestions) return;
    setIsGeneratingQuestions(true);
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
    if (!preventionQuestions.length) return;

    setAnswerSelected(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));

    const isCorrect = value === preventionQuestions[currentQuestionIndex].correctAnswer;
    setAnswerResults(prev => ({
      ...prev,
      [currentQuestionIndex]: isCorrect
    }));

    if (!answeredQuestions.has(preventionQuestions[currentQuestionIndex].id)) {
      const newAnsweredQuestions = new Set(answeredQuestions);
      newAnsweredQuestions.add(preventionQuestions[currentQuestionIndex].id);
      setAnsweredQuestions(newAnsweredQuestions);
    }

    setShowExplanation(true);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Understanding Risk Reduction in Nursing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Risk reduction in nursing practice encompasses comprehensive strategies to identify, assess, and mitigate potential hazards that could affect patient safety and care outcomes. It requires a combination of clinical knowledge, critical thinking, and evidence-based practice to effectively minimize risks in healthcare settings.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <Shield className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-4">Key Components</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 mt-0.5 text-yellow-500" />
                  <div>
                    <span className="font-medium">Risk Assessment:</span>
                    <p className="text-sm">Systematic evaluation of potential hazards including:</p>
                    <ul className="ml-4 mt-1 space-y-1 text-sm">
                      <li>• Patient-specific risk factors</li>
                      <li>• Environmental safety concerns</li>
                      <li>• Medication-related risks</li>
                      <li>• Communication barriers</li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 mt-0.5 text-green-500" />
                  <div>
                    <span className="font-medium">Prevention Strategies:</span>
                    <p className="text-sm">Evidence-based interventions to minimize risks</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <ClipboardCheck className="h-5 w-5 mt-0.5 text-blue-500" />
                  <div>
                    <span className="font-medium">Safety Protocols:</span>
                    <p className="text-sm">Standardized procedures for consistent care delivery</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Stethoscope className="h-5 w-5 mt-0.5 text-purple-500" />
                  <div>
                    <span className="font-medium">Clinical Monitoring:</span>
                    <p className="text-sm">Continuous assessment and early intervention</p>
                  </div>
                </li>
              </ul>
            </Card>
            <Card className="p-6">
              <BookOpen className="h-10 w-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-4">Learning Objectives</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Core Competencies</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Master critical safety assessment techniques</li>
                    <li>Implement evidence-based prevention strategies</li>
                    <li>Develop strong clinical judgment skills</li>
                    <li>Apply risk reduction principles in practice</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Expected Outcomes</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Identify potential risks in clinical scenarios</li>
                    <li>Select appropriate interventions</li>
                    <li>Evaluate effectiveness of safety measures</li>
                    <li>Document and communicate safety concerns</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSafetyMeasures = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Safety Measures</CardTitle>
          <AIHelpButton
            title="Safety Measures"
            description="Get AI assistance with understanding and implementing safety measures in nursing practice."
            topic="safety measures in nursing"
          />
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="infection-control">
              <AccordionTrigger>Infection Control & Prevention</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <h4 className="font-medium">Key Protocols</h4>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Hand hygiene protocols and monitoring
                      <ul className="ml-4 mt-1">
                        <li>• WHO's 5 moments of hand hygiene</li>
                        <li>• Proper handwashing technique</li>
                        <li>• Hand sanitizer use guidelines</li>
                      </ul>
                    </li>
                    <li>Personal protective equipment (PPE)
                      <ul className="ml-4 mt-1">
                        <li>• Proper sequence of donning/doffing</li>
                        <li>• Situation-specific PPE selection</li>
                        <li>• Cross-contamination prevention</li>
                      </ul>
                    </li>
                    <li>Sterile technique maintenance
                      <ul className="ml-4 mt-1">
                        <li>• Surgical asepsis principles</li>
                        <li>• Sterile field maintenance</li>
                        <li>• Common break in technique scenarios</li>
                      </ul>
                    </li>
                    <li>Isolation precautions implementation
                      <ul className="ml-4 mt-1">
                        <li>• Standard precautions</li>
                        <li>• Transmission-based precautions</li>
                        <li>• Patient education requirements</li>
                      </ul>
                    </li>
                  </ul>
                  <h4 className="font-medium">Best Practices</h4>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Regular compliance audits</li>
                    <li>Staff education and competency validation</li>
                    <li>Infection surveillance and reporting</li>
                    <li>Outbreak management protocols</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="medication-safety">
              <AccordionTrigger>Medication Safety</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <h4 className="font-medium">Core Principles</h4>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>The Five Rights of Medication Administration</li>
                    <li>High-alert medications management</li>
                    <li>Double-checking procedures</li>
                    <li>Documentation requirements</li>
                  </ul>
                  <h4 className="font-medium">Risk Reduction Strategies</h4>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Barcode medication administration</li>
                    <li>Smart pump technology usage</li>
                    <li>Medication reconciliation processes</li>
                    <li>Adverse event reporting systems</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fall-prevention">
              <AccordionTrigger>Fall Prevention</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <h4 className="font-medium">Assessment Tools</h4>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Standardized fall risk assessments</li>
                    <li>Environmental safety checks</li>
                    <li>Medication review protocols</li>
                    <li>Mobility evaluation tools</li>
                  </ul>
                  <h4 className="font-medium">Interventions</h4>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Bed alarm implementation</li>
                    <li>Patient education strategies</li>
                    <li>Staff communication tools</li>
                    <li>Post-fall assessment protocols</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="emergency-preparedness">
              <AccordionTrigger>Emergency Preparedness</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <h4 className="font-medium">Response Protocols</h4>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Code response procedures</li>
                    <li>Rapid response team activation</li>
                    <li>Evacuation protocols</li>
                    <li>Communication chains</li>
                  </ul>
                  <h4 className="font-medium">Training Requirements</h4>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Regular emergency drills</li>
                    <li>Equipment competency checks</li>
                    <li>Documentation requirements</li>
                    <li>Team role assignments</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreventionStrategies = () => {
    if (preventionQuestions.length === 0) {
      return (
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
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Click the button below to generate practice questions about prevention strategies.
              </p>
              <Button
                onClick={handleGenerateMoreQuestions}
                disabled={isGeneratingQuestions}
                className="w-full max-w-md"
              >
                {isGeneratingQuestions ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  "Generate Questions"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
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
                    Generating More Questions...
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

  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [scenarioResponses, setScenarioResponses] = useState<{ [key: number]: string }>({});
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);

  const scenarios = [
    {
      id: 1,
      title: "Medical-Surgical Unit",
      description: "A post-operative patient shows signs of confusion and attempts to get out of bed.",
      initialPrompt: "What are your immediate nursing priorities and interventions?"
    },
    {
      id: 2,
      title: "Emergency Department",
      description: "Multiple trauma patients arrive simultaneously during a busy shift.",
      initialPrompt: "How would you prioritize and manage this situation?"
    },
    {
      id: 3,
      title: "Critical Care",
      description: "Patient on mechanical ventilation shows signs of respiratory distress.",
      initialPrompt: "What assessments and interventions would you perform?"
    },
    {
      id: 4,
      title: "Medication Safety",
      description: "High-alert medication administration in a pediatric setting.",
      initialPrompt: "What safety measures would you implement?"
    }
  ];

  const handleStartScenario = async (scenarioId: number) => {
    setActiveScenario(scenarioId);
    setIsGeneratingScenario(true);
    try {
      const response = await fetch("/api/chat/risk-reduction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: scenarios.find(s => s.id === scenarioId)?.title,
          question: scenarios.find(s => s.id === scenarioId)?.initialPrompt
        })
      });

      if (!response.ok) throw new Error("Failed to generate scenario");

      const data = await response.json();
      // Clean HTML and format response text
      const cleanResponse = data.response
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace HTML spaces
        .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
        .trim();
      setScenarioResponses(prev => ({ ...prev, [scenarioId]: cleanResponse }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate scenario response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const handleAskFollowUp = async (scenarioId: number, question: string) => {
    setIsGeneratingScenario(true);
    try {
      const response = await fetch("/api/chat/risk-reduction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: scenarios.find(s => s.id === scenarioId)?.title,
          question: question,
          context: scenarioResponses[scenarioId]
        })
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const cleanResponse = data.response
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
      setScenarioResponses(prev => ({ 
        ...prev, 
        [scenarioId]: prev[scenarioId] + "\n\nFollow-up:\n" + cleanResponse 
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get follow-up response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const renderPracticeScenarios = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Interactive Practice Scenarios
            <AIHelpButton
              title="Practice Scenarios"
              description="Get AI assistance with clinical scenarios and decision-making"
              topic="clinical scenarios in nursing practice"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="p-6">
                  <h3 className="font-semibold mb-3">{scenario.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {scenario.description}
                  </p>
                  {activeScenario === scenario.id ? (
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="whitespace-pre-wrap">{scenarioResponses[scenario.id]}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleAskFollowUp(scenario.id, "What additional interventions would you recommend?")}
                          disabled={isGeneratingScenario}
                        >
                          Ask Follow-up
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setActiveScenario(null)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleStartScenario(scenario.id)}
                      disabled={isGeneratingScenario}
                    >
                      {isGeneratingScenario ? "Generating..." : "Start Scenario"}
                    </Button>
                  )}
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => handleStartScenario(scenarios[Math.floor(Math.random() * scenarios.length)].id)}
                disabled={isGeneratingScenario}
                className="w-full max-w-md"
              >
                {isGeneratingScenario ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating More...
                  </>
                ) : (
                  "Generate More"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
          {renderOverview()}
        </TabsContent>

        <TabsContent value="safety">
          {renderSafetyMeasures()}
        </TabsContent>

        <TabsContent value="prevention">
          {renderPreventionStrategies()}
        </TabsContent>

        <TabsContent value="practice">
          {renderPracticeScenarios()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
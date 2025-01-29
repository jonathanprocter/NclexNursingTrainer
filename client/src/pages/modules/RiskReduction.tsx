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
import { CheckCircle2, RefreshCw, XCircle, Shield, BookOpen } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  const renderOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Understanding Risk Reduction in Nursing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Risk reduction in nursing practice involves systematic approaches to identify, assess, and mitigate potential hazards that could affect patient safety and care outcomes.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <Shield className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-2">Key Components</h3>
              <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                <li>Risk Assessment</li>
                <li>Prevention Strategies</li>
                <li>Safety Protocols</li>
                <li>Quality Improvement</li>
              </ul>
            </Card>
            <Card className="p-4">
              <BookOpen className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold mb-2">Learning Objectives</h3>
              <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                <li>Understand core safety principles</li>
                <li>Apply prevention strategies</li>
                <li>Develop clinical judgment</li>
                <li>Master best practices</li>
              </ul>
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
            <AccordionItem value="item-1">
              <AccordionTrigger>Infection Control</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Hand hygiene protocols</li>
                  <li>Personal protective equipment (PPE)</li>
                  <li>Sterile technique</li>
                  <li>Isolation precautions</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Medication Safety</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>The Five Rights of Medication Administration</li>
                  <li>High-alert medications</li>
                  <li>Double-checking procedures</li>
                  <li>Documentation requirements</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Patient Assessment</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Initial assessment protocols</li>
                  <li>Ongoing monitoring</li>
                  <li>Risk factor identification</li>
                  <li>Documentation standards</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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

      <Tabs defaultValue="prevention" className="space-y-4">
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
          <Card>
            <CardHeader>
              <CardTitle>Practice Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Coming soon: Interactive scenarios to test your knowledge of risk reduction strategies.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
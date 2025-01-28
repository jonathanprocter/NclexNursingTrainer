import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Bot, RefreshCw, CheckCircle } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import cn from 'classnames';

// Types for practice exercises
type ExerciseType = 'pattern' | 'hypothesis' | 'decision' | 'documentation';

type AnswerOption = {
  text: string;
  correct: boolean;
  explanation: string;
  topics: string[];
};

interface CaseQuestion {
  type: 'assessment' | 'analysis' | 'synthesis' | 'evaluation' | 'creation';
  question: string;
  options: AnswerOption[];
  keyTopics: string[];
}

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: string;
  prerequisites: string[];
  content: string;
  questions: CaseQuestion[];
  nextCaseHints?: string[];
}

interface PracticeExercise {
  id: string;
  type: ExerciseType;
  title: string;
  description: string;
  content: string;
  options?: string[];
}

export default function ClinicalAnalysis() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [currentSection, setCurrentSection] = useState("");
  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType>("pattern");
  const [currentExercise, setCurrentExercise] = useState<PracticeExercise | null>(null);

  // Form for clinical documentation
  const form = useForm({
    defaultValues: {
      patientAssessment: "",
      clinicalHypothesis: "",
      interventionPlan: "",
      expectedOutcomes: "",
    },
  });

  // Mutation for AI assistance
  const aiHelpMutation = useMutation({
    mutationFn: async ({ section, context }: { section: string; context?: string }) => {
      const response = await fetch("/api/ai-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, context }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI help");
      }

      return response.json();
    },
  });

  // Mutation for practice exercises
  const generateExerciseMutation = useMutation({
    mutationFn: async (type: ExerciseType) => {
      const response = await fetch("/api/generate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate exercise");
      }

      return response.json();
    },
  });

  // Handle AI help request
  const handleAIHelp = async (section: string, context?: string) => {
    setCurrentSection(section);
    setIsDialogOpen(true);

    try {
      const result = await aiHelpMutation.mutateAsync({ section, context });
      setAiContent(result.content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI assistance. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate practice exercise
  const handleGenerateExercise = async (type: ExerciseType) => {
    setSelectedExerciseType(type);
    try {
      const result = await generateExerciseMutation.mutateAsync(type);
      setCurrentExercise(result);
      toast({
        title: "Success",
        description: "New exercise generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate exercise. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle exercise submission
  const handleExerciseSubmit = async (data: any) => {
    try {
      // Submit exercise response to backend
      const response = await fetch("/api/submit-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: currentExercise?.id,
          type: selectedExerciseType,
          response: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit exercise");
      }

      toast({
        title: "Success",
        description: "Exercise submitted successfully!",
      });

      // Generate new exercise of the same type
      handleGenerateExercise(selectedExerciseType);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit exercise. Please try again.",
        variant: "destructive",
      });
    }
  };

  const CaseStudiesSection = () => {
    const [currentCase, setCurrentCase] = useState<CaseStudy | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
    const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    // Query for completed cases
    const { data: completedCases = [] } = useQuery<string[]>({
      queryKey: ['/api/user/completed-cases'],
    });

    // Query for pre-integrated cases
    const { data: casesData = [] } = useQuery<CaseStudy[]>({
      queryKey: ['/api/pre-integrated-cases'],
    });

    const generateCaseMutation = useMutation({
      mutationFn: async (caseId?: string) => {
        const response = await fetch("/api/generate-case", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate case study");
        }

        const data = await response.json();
        return data as CaseStudy;
      },
    });

    const submitCaseMutation = useMutation({
      mutationFn: async (answers: Record<string, number>) => {
        const response = await fetch("/api/case-completion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseId: currentCase?.id,
            answers,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit case study");
        }

        return response.json();
      },
    });

    const handleGenerateCase = async (caseId?: string) => {
      try {
        const result = await generateCaseMutation.mutateAsync(caseId);
        setCurrentCase(result);
        setUserAnswers({});
        setShowFeedback({});
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load case study. Please try again.",
          variant: "destructive",
        });
      }
    };

    const handleAnswerSubmit = async () => {
      try {
        await submitCaseMutation.mutateAsync(userAnswers);
        setShowFeedback(Object.fromEntries(Object.keys(userAnswers).map(key => [key, true])));
        toast({
          title: "Success",
          description: "Case study answers submitted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to submit answers. Please try again.",
          variant: "destructive",
        });
      }
    };


    const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
      setUserAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
      setShowFeedback(prev => ({ ...prev, [questionIndex]: true }));

      // Show immediate feedback toast
      const question = currentCase?.questions[questionIndex];
      const selectedOption = question?.options[optionIndex];

      if (selectedOption) {
        toast({
          title: selectedOption.correct ? "Correct! 🎉" : "Incorrect",
          description: selectedOption.explanation,
          variant: selectedOption.correct ? "default" : "destructive",
        });
      }
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interactive Case Studies</CardTitle>
            <p className="text-muted-foreground mt-2">
              Apply clinical reasoning skills to real-world scenarios through progressive case studies.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Cases List */}
              <div className="grid gap-4 md:grid-cols-3">
                {casesData.map((caseStudy, index) => (
                  <Card key={caseStudy.id} className={cn(
                    "relative",
                    !completedCases.includes(caseStudy.id) && index > 0 &&
                    !completedCases.includes(casesData[index - 1]?.id) &&
                    "opacity-50"
                  )}>
                    <CardHeader>
                      <CardTitle className="text-lg">{caseStudy.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{caseStudy.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={caseStudy.difficulty === 'beginner' ? 'default' :
                            caseStudy.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                            {caseStudy.difficulty}
                          </Badge>
                          {completedCases.includes(caseStudy.id) && (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Completed
                            </Badge>
                          )}
                        </div>

                        {!completedCases.includes(caseStudy.id) &&
                          (index === 0 || completedCases.includes(casesData[index - 1]?.id)) && (
                            <Button
                              className="w-full mt-4"
                              onClick={() => handleGenerateCase(caseStudy.id)}
                              disabled={generateCaseMutation.isPending}
                            >
                              {generateCaseMutation.isPending ? 'Loading...' : 'Start Case'}
                            </Button>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Current Case Display */}
              {generateCaseMutation.isPending && (
                <Card className="mt-6">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading case study...</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentCase && !generateCaseMutation.isPending && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Current Case: {currentCase.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{currentCase.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: currentCase.content }} />
                      </div>

                      <div className="space-y-8">
                        {currentCase.questions.map((question, qIndex) => (
                          <div key={qIndex} className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">
                                Question {qIndex + 1}: {question.question}
                              </h3>
                              <div className="grid gap-3">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="space-y-2">
                                    <Button
                                      variant={userAnswers[qIndex] === oIndex ?
                                        (option.correct ? "default" : "destructive") :
                                        "outline"
                                      }
                                      className="w-full justify-start text-left h-auto p-4"
                                      onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                      disabled={showFeedback[qIndex]}
                                    >
                                      {option.text}
                                    </Button>

                                    {showFeedback[qIndex] && userAnswers[qIndex] === oIndex && (
                                      <div className="bg-muted/30 p-4 rounded-md space-y-2">
                                        <p className="font-medium">Explanation:</p>
                                        <p className="text-sm text-muted-foreground">{option.explanation}</p>
                                        <div className="mt-2">
                                          <p className="font-medium text-sm">Related Topics:</p>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {option.topics.map((topic, tIndex) => (
                                              <Badge key={tIndex} variant="outline">{topic}</Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {showFeedback[qIndex] && (
                              <div className="mt-4">
                                <p className="font-medium text-sm">Key Topics Covered:</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {question.keyTopics.map((topic, tIndex) => (
                                    <Badge key={tIndex} variant="secondary">{topic}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 mt-6">
                        <Button
                          onClick={() => {
                            setCurrentCase(null);
                            setUserAnswers({});
                            setShowFeedback({});
                          }}
                          variant="outline"
                        >
                          Close Case
                        </Button>
                        {!Object.keys(showFeedback).every(key => showFeedback[key]) && (
                          <Button
                            onClick={() => {
                              const allQuestionsAnswered = Object.fromEntries(Object.keys(userAnswers).map(key => [key, true]));
                              setShowFeedback(allQuestionsAnswered);
                            }}
                          >
                            Show All Answers
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Clinical Analysis</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master the art of clinical reasoning through systematic analysis of patient data, pattern recognition, and hypothesis formation
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          <TabsTrigger value="clinical-reasoning">Clinical Reasoning</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        {/* Overview Tab Content - Keeping the existing content */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Learning Path Overview</CardTitle>
              <p className="text-muted-foreground mt-2">
                Develop advanced clinical reasoning skills through structured learning modules that progress from basic pattern recognition to complex case analysis.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Pattern Recognition</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Learn to identify and interpret clinical patterns through systematic analysis of patient data.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("pattern_recognition")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Vital Sign Patterns
                        <p className="ml-6 mt-1">
                          Identify significant changes and trends in vital signs that indicate clinical deterioration or improvement.
                        </p>
                      </li>
                      <li>Laboratory Data Analysis
                        <p className="ml-6 mt-1">
                          Interpret laboratory results in context with clinical presentation and patient history.
                        </p>
                      </li>
                      <li>Symptom Clustering
                        <p className="ml-6 mt-1">
                          Group related symptoms to identify potential underlying conditions and syndromes.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Clinical Reasoning</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Develop structured approaches to clinical problem-solving and decision-making.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("clinical_reasoning")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Hypothesis Generation
                      <p className="ml-6 mt-1">
                        Formulate and test clinical hypotheses based on available data and evidence.
                      </p>
                    </li>
                    <li>Differential Diagnosis
                      <p className="ml-6 mt-1">
                        Develop and refine differential diagnoses through systematic evaluation of clinical evidence.
                      </p>
                    </li>
                    <li>Clinical Decision Making
                      <p className="ml-6 mt-1">
                        Apply evidence-based decision-making frameworks to complex clinical scenarios.
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Advanced Analysis</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Master complex clinical analysis through integration of multiple data sources.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("advanced_analysis")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Multisystem Assessment
                      <p className="ml-6 mt-1">
                        Evaluate complex interactions between multiple body systems and their clinical implications.
                      </p>
                    </li>
                    <li>Risk Stratification
                      <p className="ml-6 mt-1">
                        Apply risk assessment tools and clinical judgment to prioritize patient care needs.
                      </p>
                    </li>
                    <li>Outcome Prediction
                      <p className="ml-6 mt-1">
                        Use clinical data and evidence-based tools to predict and improve patient outcomes.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Case Studies Tab */}
        <TabsContent value="case-studies">
          <CaseStudiesSection />
        </TabsContent>

        {/* Clinical Reasoning Tab */}
        <TabsContent value="clinical-reasoning">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Reasoning Frameworks</CardTitle>
              <p className="text-muted-foreground mt-2">
                Learn and apply systematic approaches to clinical reasoning and decision-making.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Interactive Decision Trees</h3>
                      <p className="text-muted-foreground mt-1">
                        Practice clinical decision-making through guided scenarios.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("decision_trees")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  {/* Add decision tree visualization and interaction here */}
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Reasoning Models</h3>
                      <p className="text-muted-foreground mt-1">
                        Explore different approaches to clinical reasoning and decision-making.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("reasoning_models")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Hypothesis-driven reasoning</li>
                      <li>Pattern recognition approaches</li>
                      <li>Evidence-based frameworks</li>
                      <li>Decision analysis tools</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle>Practice Exercises</CardTitle>
              <p className="text-muted-foreground mt-2">
                Strengthen your clinical analysis skills through targeted practice exercises.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Exercise Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['pattern', 'hypothesis', 'decision', 'documentation'] as ExerciseType[]).map((type) => (
                    <Button
                      key={type}
                      variant={selectedExerciseType === type ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleGenerateExercise(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)} Exercise
                    </Button>
                  ))}
                </div>

                {/* Current Exercise Display */}
                {currentExercise && (
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{currentExercise.title}</h3>
                        <p className="text-muted-foreground mt-1">{currentExercise.description}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAIHelp(currentExercise.type)}>
                        <Bot className="h-4 w-4 mr-2" />
                        AI Help
                      </Button>
                    </div>

                    <div className="prose prose-sm max-w-none mb-6">
                      <div dangerouslySetInnerHTML={{ __html: currentExercise.content }} />
                    </div>

                    {/* Exercise Input Form */}
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleExerciseSubmit)} className="space-y-4">
                        {selectedExerciseType === 'documentation' && (
                          <>
                            <FormField
                              control={form.control}
                              name="patientAssessment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Patient Assessment</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="clinicalHypothesis"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Clinical Hypothesis</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="interventionPlan"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Intervention Plan</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="expectedOutcomes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expected Outcomes</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        {(selectedExerciseType === 'pattern' || selectedExerciseType === 'hypothesis') && (
                          <RadioGroup onValueChange={(value) => form.setValue('answer', value)}>
                            {currentExercise.options?.map((option, index) => (
                              <FormItem key={index} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={String(index)} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        )}

                        {selectedExerciseType === 'decision' && (
                          <FormField
                            control={form.control}
                            name="decisionRationale"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Decision Rationale</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormDescription>
                                  Explain your clinical decision-making process
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        )}

                        <Button type="submit" className="w-full">
                          Submit Response
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Help Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentSection}</DialogTitle>
            <DialogDescription>
              AI-powered learning assistance
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-4">
              {aiContent ? (
                <div className="prose prose-sm">
                  <div dangerouslySetInnerHTML={{ __html: aiContent }} />
                </div>
              ) : (
                <p className="text-muted-foreground">Loading content...</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
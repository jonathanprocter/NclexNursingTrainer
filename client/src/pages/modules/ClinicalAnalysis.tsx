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

// Types for practice exercises
type ExerciseType = 'pattern' | 'hypothesis' | 'decision' | 'documentation';

interface CaseQuestion {
  type: 'assessment' | 'analysis' | 'synthesis' | 'evaluation' | 'creation';
  question: string;
  explanation: string;
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
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [showFeedback, setShowFeedback] = useState(false);
    const { toast } = useToast();

    const { data: completedCases = [] } = useQuery({
      queryKey: ['/api/user/completed-cases'],
    });

    const generateCaseMutation = useMutation({
      mutationFn: async () => {
        const response = await fetch("/api/generate-case", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completedCases }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate case study");
        }

        return response.json();
      },
    });

    const submitCaseMutation = useMutation({
      mutationFn: async (answers: Record<string, string>) => {
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

    const handleGenerateCase = async () => {
      try {
        const result = await generateCaseMutation.mutateAsync();
        setCurrentCase(result);
        setUserAnswers({});
        setShowFeedback(false);
        toast({
          title: "Success",
          description: "New case study generated successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate case study. Please try again.",
          variant: "destructive",
        });
      }
    };

    const handleAnswerSubmit = async () => {
      try {
        const result = await submitCaseMutation.mutateAsync(userAnswers);
        setShowFeedback(true);
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

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Current Case Study</h3>
          <Button
            onClick={handleGenerateCase}
            className="gap-2"
            disabled={generateCaseMutation.isPending}
          >
            <RefreshCw className="h-4 w-4" />
            Generate New Case
          </Button>
        </div>

        {currentCase ? (
          <div className="space-y-6">
            {/* Prerequisites Section */}
            {currentCase.prerequisites.length > 0 && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Prerequisites</h4>
                <ul className="list-disc list-inside space-y-1">
                  {currentCase.prerequisites.map(prereq => (
                    <li key={prereq} className="text-sm">
                      <span className={completedCases.includes(prereq) ? "text-green-600" : "text-red-600"}>
                        {completedCases.includes(prereq) ? "✓" : "×"}
                      </span>
                      {" "}Case: {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Case Content */}
            <div className="bg-muted/50 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium mb-2">{currentCase.title}</h4>
                  <p className="text-muted-foreground mb-4">{currentCase.description}</p>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                    {currentCase.difficulty}
                  </span>
                </div>
              </div>

              <div className="prose prose-sm max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: currentCase.content }} />
              </div>

              {/* Questions Section */}
              <div className="space-y-6 mt-8">
                <h5 className="font-medium">Analysis Questions</h5>
                {currentCase.questions.map((q, index) => (
                  <div key={index} className="space-y-3">
                    <p className="font-medium">{index + 1}. {q.question}</p>
                    <Textarea
                      placeholder="Enter your answer..."
                      value={userAnswers[index] || ''}
                      onChange={(e) => setUserAnswers(prev => ({
                        ...prev,
                        [index]: e.target.value
                      }))}
                      className="min-h-[100px]"
                    />
                    {showFeedback && (
                      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                        <p className="font-medium">Guidance:</p>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  onClick={handleAnswerSubmit}
                  className="w-full mt-4"
                  disabled={submitCaseMutation.isPending}
                >
                  Submit Answers
                </Button>
              </div>

              {/* Next Steps */}
              {showFeedback && currentCase.nextCaseHints && (
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h5 className="font-medium mb-2">Next Steps</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {currentCase.nextCaseHints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 p-6 rounded-lg text-center">
            <p className="text-muted-foreground">
              Click the button above to generate a case study.
            </p>
          </div>
        )}
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
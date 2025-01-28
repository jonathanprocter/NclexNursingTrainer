import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, Calculator, CheckCircle2, RefreshCw, Brain, Clock, Shield, Book } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface CalculationProblem {
  id: string;
  type: 'dosage' | 'rate' | 'conversion' | 'concentration';
  difficulty: Difficulty;
  question: string;
  givens: Record<string, string>;
  answer: number;
  unit: string;
  explanation: string;
  hints: string[];
}

export default function Calculations() {
  const { toast } = useToast();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('beginner');
  const [currentProblem, setCurrentProblem] = useState<CalculationProblem | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form for calculation answers
  const form = useForm({
    defaultValues: {
      answer: "",
    },
  });

  // Query for user progress
  const { data: progress } = useQuery({
    queryKey: ['/api/progress/calculations'],
    enabled: false, // We'll enable this once the backend is ready
  });

  // Mutation for generating new problems
  const generateProblemMutation = useMutation({
    mutationFn: async (difficulty: Difficulty) => {
      const response = await fetch("/api/generate-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate problem");
      }

      return response.json();
    },
  });

  // Handle generating new problem
  const handleGenerateProblem = async (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setIsLoading(true);
    try {
      const result = await generateProblemMutation.mutateAsync(difficulty);
      setCurrentProblem(result);
      setShowSolution(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate problem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle answer submission
  const handleSubmit = async (data: { answer: string }) => {
    if (!currentProblem) return;

    const userAnswer = parseFloat(data.answer);
    const isCorrect = Math.abs(userAnswer - currentProblem.answer) < 0.01; // Allow for small rounding differences

    if (isCorrect) {
      toast({
        title: "Correct! 🎉",
        description: "Great job! Would you like to try another problem?",
      });
      // Generate a new problem after a short delay
      setTimeout(() => handleGenerateProblem(selectedDifficulty), 2000);
    } else {
      toast({
        title: "Not quite right",
        description: "Check your calculations and try again, or view the solution for help.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Drug Calculations</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master medication dosage calculations and conversions for NCLEX success
        </p>
      </div>

      <Tabs defaultValue="practice" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="practice">Practice Problems</TabsTrigger>
          <TabsTrigger value="formulas">Common Formulas</TabsTrigger>
          <TabsTrigger value="conversions">Unit Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>NCLEX Preparation Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Essential NCLEX Calculation Topics</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Calculator className="h-4 w-4 mr-2" />
                          Medication Administration
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• Oral Medications</li>
                          <li>• Injectable Medications</li>
                          <li>• Weight-Based Dosing</li>
                          <li>• Pediatric Calculations</li>
                        </ul>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Bot className="h-4 w-4 mr-2" />
                          IV Therapy
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• IV Flow Rates</li>
                          <li>• Drip Rate Calculations</li>
                          <li>• IV Push Medications</li>
                          <li>• Complex Titrations</li>
                        </ul>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Calculator className="h-4 w-4 mr-2" />
                          Critical Care
                        </h4>
                        <ul className="text-sm space-y-1">
                          <li>• Continuous Infusions</li>
                          <li>• Drug Titration Rates</li>
                          <li>• Emergency Medications</li>
                          <li>• Critical Drips</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Common Calculation Challenges</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          High-Risk Areas
                        </h4>
                        <ul className="text-sm space-y-2">
                          <li>• <span className="font-medium">Decimal Point Errors:</span> Always use leading zeros (0.5 not .5) and never trailing zeros (2 not 2.0)</li>
                          <li>• <span className="font-medium">Unit Conversions:</span> Master common conversions (mg to mcg, lb to kg)</li>
                          <li>• <span className="font-medium">IV Drip Calculations:</span> Understand relationships between time, volume, and rate</li>
                          <li>• <span className="font-medium">Pediatric Dosing:</span> Extra attention to weight-based calculations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          Critical Thinking
                        </h4>
                        <ul className="text-sm space-y-2">
                          <li>• <span className="font-medium">Reasonableness:</span> Does your answer make clinical sense?</li>
                          <li>• <span className="font-medium">Safety Checks:</span> Know normal dosage ranges for common medications</li>
                          <li>• <span className="font-medium">Problem Solving:</span> Break complex calculations into smaller steps</li>
                          <li>• <span className="font-medium">Verification:</span> Use multiple methods to verify your answer</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">NCLEX Success Strategies</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Time Management</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Aim to complete each calculation in under 2 minutes</li>
                            <li>• Practice with a timer to build speed and accuracy</li>
                            <li>• If stuck, mark and return later - don't get bogged down</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Book className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Systematic Approach</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>1. Read the question carefully - identify what's being asked</li>
                            <li>2. Extract relevant information and desired units</li>
                            <li>3. Set up your equation before calculating</li>
                            <li>4. Double-check your work and units</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Practice Tips</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Start with basic conversions before complex calculations</li>
                            <li>• Practice multiple solution methods for each problem type</li>
                            <li>• Use realistic clinical scenarios in your practice</li>
                            <li>• Keep a log of mistakes to identify pattern areas for improvement</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Your Progress</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Overall Mastery</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-2" />

                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Problems Solved</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">0/100</p>
                            <p className="text-sm text-muted-foreground">Target: 100 problems</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Success Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">0%</p>
                            <p className="text-sm text-muted-foreground">Target: {'>'}90%</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Time per Problem</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold">0m</p>
                            <p className="text-sm text-muted-foreground">Target: less than 2 minutes</p>
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

        <TabsContent value="practice">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Problems</CardTitle>
                <p className="text-muted-foreground">
                  Select difficulty level to begin practicing
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={selectedDifficulty === 'beginner' ? "default" : "outline"}
                    onClick={() => handleGenerateProblem('beginner')}
                    disabled={isLoading}
                  >
                    Beginner
                    {isLoading && selectedDifficulty === 'beginner' && (
                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </Button>
                  <Button
                    variant={selectedDifficulty === 'intermediate' ? "default" : "outline"}
                    onClick={() => handleGenerateProblem('intermediate')}
                    disabled={isLoading}
                  >
                    Intermediate
                    {isLoading && selectedDifficulty === 'intermediate' && (
                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </Button>
                  <Button
                    variant={selectedDifficulty === 'advanced' ? "default" : "outline"}
                    onClick={() => handleGenerateProblem('advanced')}
                    disabled={isLoading}
                  >
                    Advanced
                    {isLoading && selectedDifficulty === 'advanced' && (
                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {currentProblem && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Problem {currentProblem.id}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge>{currentProblem.type}</Badge>
                        <Badge variant="outline">{currentProblem.difficulty}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateProblem(selectedDifficulty)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      New Problem
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <h3 className="text-lg font-semibold">Question:</h3>
                      <p>{currentProblem.question}</p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Given Information:</h4>
                      <dl className="grid grid-cols-2 gap-2">
                        {Object.entries(currentProblem.givens).map(([key, value]) => (
                          <div key={key}>
                            <dt className="text-sm font-medium">{key}:</dt>
                            <dd className="text-sm">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="answer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Answer</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter your answer"
                                    {...field}
                                  />
                                </FormControl>
                                <span className="flex items-center text-sm text-muted-foreground">
                                  {currentProblem.unit}
                                </span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={isLoading}>
                            Submit Answer
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowSolution(!showSolution)}
                          >
                            {showSolution ? "Hide Solution" : "Show Solution"}
                          </Button>
                        </div>
                      </form>
                    </Form>

                    {showSolution && (
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <h4 className="font-medium">Solution:</h4>
                        <p className="text-sm">{currentProblem.explanation}</p>
                        <div className="mt-4">
                          <p className="text-sm font-medium">Helpful Tips:</p>
                          <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                            {currentProblem.hints.map((hint, index) => (
                              <li key={index}>{hint}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="formulas">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Common Drug Calculation Formulas</h3>
              <div className="grid gap-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Dosage Calculation</h4>
                  <p className="text-sm text-muted-foreground">
                    Desired Dose ÷ Stock Strength × Stock Volume
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">IV Drip Rate (mL/hr)</h4>
                  <p className="text-sm text-muted-foreground">
                    Total Volume (mL) ÷ Time (hours)
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Drip Rate (drops/min)</h4>
                  <p className="text-sm text-muted-foreground">
                    (mL/hr × drop factor) ÷ 60
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Common Unit Conversions</h3>
              <div className="grid gap-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Weight Conversions</h4>
                  <ul className="space-y-2 text-sm">
                    <li>1 kilogram (kg) = 1000 grams (g)</li>
                    <li>1 gram (g) = 1000 milligrams (mg)</li>
                    <li>1 milligram (mg) = 1000 micrograms (mcg)</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Volume Conversions</h4>
                  <ul className="space-y-2 text-sm">
                    <li>1 liter (L) = 1000 milliliters (mL)</li>
                    <li>1 milliliter (mL) = 1 cubic centimeter (cc)</li>
                    <li>1 teaspoon = 5 mL</li>
                    <li>1 tablespoon = 15 mL</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Time Conversions</h4>
                  <ul className="space-y-2 text-sm">
                    <li>1 hour = 60 minutes</li>
                    <li>1 minute = 60 seconds</li>
                    <li>1 day = 24 hours</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import QuestionCard from "@/components/nclex/QuestionCard";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Book, Activity, BarChart3, HelpCircle, Loader2, Brain, RefreshCw, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Question {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  rationale: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  cognitiveLevel: 'knowledge' | 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation';
  conceptualBreakdown: {
    key_concepts: string[];
    related_topics: string[];
    clinical_relevance: string;
  };
  faqs: { question: string; answer: string }[];
}

export default function Quizzes() {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizComplete, setQuizComplete] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConceptBreakdown, setShowConceptBreakdown] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [currentComplexityLevel, setCurrentComplexityLevel] = useState<string>('knowledge');

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    if (!quizComplete && !isReviewMode && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizComplete, isReviewMode, questions.length]);
  
  const [previousQuestionIds, setPreviousQuestionIds] = useState<string[]>([]);
  const [userPerformance, setUserPerformance] = useState<{
    correctByTopic: { [key: string]: number },
    totalByTopic: { [key: string]: number }
  }>({
    correctByTopic: {},
    totalByTopic: {}
  });

  // Enhanced generate questions mutation
  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ topic, complexity }: { topic?: string; complexity?: string }) => {
      try {
        const response = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic,
            complexity,
            previousQuestionIds: questions.map(q => q.id.toString()),
            userPerformance 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate questions');
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No questions received');
        }

        return data;
      } catch (error) {
        console.error('Question generation error:', error);
        throw error;
      }
    },
    onSuccess: (newQuestions) => {
      // Reset all state
      setQuestions(newQuestions);
      setCurrentQuestion(0);
      setQuizComplete(false);
      setScore({ correct: 0, total: 0 });
      setUserAnswers({});
      setTimeRemaining(1800);
      setIsReviewMode(false);
      setIsLoading(false);

      toast({
        title: "New Questions Generated",
        description: `Focus area: ${selectedTopic || "General"} | Complexity: ${currentComplexityLevel}`,
      });
    },
    onError: (error) => {
      console.error('Question generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate questions",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

    const handleGenerateMore = async () => {
    const complexityLevels = ['knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'];
    const currentIndex = complexityLevels.indexOf(currentComplexityLevel as string);
    const nextLevel = complexityLevels[Math.min(currentIndex + 1, complexityLevels.length - 1)];

    setCurrentComplexityLevel(nextLevel);
    generateQuestionsMutation.mutate({ 
      topic: selectedTopic || undefined,
      complexity: nextLevel
    });
  };

  // AI Help mutation for conceptual understanding
    const getAIHelpMutation = useMutation({
    mutationFn: async (context: string) => {
      const response = await fetch('/api/ai-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI assistance');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAiResponse(data.response);
      setShowAIHelp(true);
    },
  });
  

  // Handle answer selection with enhanced feedback
  const handleAnswer = (questionId: number, selectedAnswer: string) => {
    if (isReviewMode) return;

    const currentQ = questions[currentQuestion];
    const correct = selectedAnswer === currentQ.correctAnswer;

    setUserAnswers(prev => ({...prev, [questionId]: selectedAnswer}));

    setScore(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

        // Track performance and show detailed feedback
    toast({
      title: correct ? "Correct! 🎉" : "Review Needed",
      description: currentQ.rationale,
      duration: 5000,
    });

    if (currentQuestion === questions.length - 1) {
      setQuizComplete(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const generateNewQuestions = (topic?: string) => {
    setIsLoading(true);
    setSelectedTopic(topic || null);
    generateQuestionsMutation.mutate({ topic });
  };

  const startTopicPractice = async (topic: string) => {
    try {
      setIsLoading(true);
      setSelectedTopic(topic);
      await generateQuestionsMutation.mutateAsync({ topic });
      
      // Switch to questions tab after questions are loaded
      const questionsTab = document.querySelector('[value="questions"]') as HTMLElement;
      if (questionsTab) questionsTab.click();
    } catch (error) {
      console.error('Failed to start practice:', error);
      toast({
        title: "Error",
        description: "Failed to load practice questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enhanced AI help function
  const handleAIHelp = async (context?: string) => {
    const currentQ = questions[currentQuestion];
    const helpContext = context || `
      Question: ${currentQ.text}
      Topic: ${currentQ.category}
      Cognitive Level: ${currentQ.cognitiveLevel}
      Key Concepts: ${currentQ.conceptualBreakdown.key_concepts.join(', ')}
    `;

    getAIHelpMutation.mutate(helpContext);
  };

  const startReview = () => {
    setIsReviewMode(true);
    setCurrentQuestion(0);
    setQuizComplete(false);
  };
  

  // Load initial questions
  useEffect(() => {
    generateNewQuestions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice Quizzes</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test your knowledge with topic-specific quizzes and track your progress
          {selectedTopic && <span className="font-medium"> - Focusing on {selectedTopic}</span>}
        </p>
      </div>

      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Topics
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-lg font-medium">Generating New Questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg font-medium mb-4">No questions available</p>
                  <Button onClick={() => generateQuestionsMutation.mutate({})}>
                    Generate Questions
                  </Button>
                </div>
              ) : !quizComplete ? (
                <>
                  {/* Question header with badges */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">Question {currentQuestion + 1}</Badge>
                      <Badge variant="outline">
                        {questions[currentQuestion]?.category || "General"}
                      </Badge>
                      <Badge variant="outline">
                        {questions[currentQuestion]?.difficulty || "Medium"}
                      </Badge>
                       <Badge variant="outline" className="capitalize">
                        {questions[currentQuestion]?.cognitiveLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isReviewMode && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">
                            {formatTime(timeRemaining)}
                          </span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConceptBreakdown(true)}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Concept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFAQs(true)}
                      >
                        <Info className="h-4 w-4 mr-2" />
                        FAQs
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIHelp()}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        AI Help
                      </Button>
                    </div>
                  </div>

                  {/* Question Card */}
                  <QuestionCard
                    question={questions[currentQuestion]}
                    onNext={handleAnswer}
                    userAnswer={isReviewMode ? userAnswers[questions[currentQuestion].id] : undefined}
                    showAnswer={isReviewMode}
                  />

                  {/* Progress bar */}
                  <div className="mt-4">
                    <Progress 
                      value={(currentQuestion + 1) * (100 / questions.length)} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{isReviewMode ? "Review Progress" : "Progress"}</span>
                      <span>{currentQuestion + 1}/{questions.length} Questions</span>
                    </div>
                  </div>
                </>
              ) : (
                // Quiz Complete Section
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Quiz Complete! 🎉</h2>
                    <p className="text-muted-foreground">
                      You scored {Math.round((score.correct / questions.length) * 100)}% 
                      ({score.correct}/{questions.length} correct)
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={handleGenerateMore}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Generate More Complex Questions
                    </Button>
                    <Button variant="outline" onClick={() => setIsReviewMode(true)}>
                      Review Answers
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Study Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  'Fundamentals',
                  'Med-Surg',
                  'Pediatrics',
                  'OB/GYN',
                  'Mental Health',
                  'Leadership'
                ].map((topic) => (
                  <Card key={topic}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{topic}</h3>
                      <Progress value={Math.random() * 100} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Questions: 50</span>
                        <span>Completed: 25</span>
                      </div>
                      <Button 
                        className="w-full mt-4"
                        onClick={() => startTopicPractice(topic)}
                      >
                        Practice
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span>65%</span>
                </div>
                <Progress value={65} className="h-2" />

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Questions Attempted</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">325/500</p>
                      <p className="text-sm text-muted-foreground">65% complete</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">72%</p>
                      <p className="text-sm text-muted-foreground">+5% this week</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Study Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">24h</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Review History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Practice Session #{index}</h3>
                        <span className="text-sm text-muted-foreground">January {25 + index}, 2025</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Score:</span>
                          <span className="font-medium">{70 + index}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Questions:</span>
                          <span className="font-medium">25</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Topics:</span>
                          <span className="font-medium">Med-Surg, Fundamentals</span>
                        </div>
                        <Progress value={70 + index} className="h-2" />
                      </div>
                      <Button variant="outline" className="w-full mt-4" onClick={startReview}>
                        Review Answers
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

        {/* Concept Breakdown Dialog */}
      <Dialog open={showConceptBreakdown} onOpenChange={setShowConceptBreakdown}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Conceptual Breakdown</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="key-concepts">
                  <AccordionTrigger>Key Concepts</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-2">
                      {questions[currentQuestion]?.conceptualBreakdown.key_concepts.map((concept, index) => (
                        <li key={index}>{concept}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="related-topics">
                  <AccordionTrigger>Related Topics</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-2">
                      {questions[currentQuestion]?.conceptualBreakdown.related_topics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="clinical-relevance">
                  <AccordionTrigger>Clinical Relevance</AccordionTrigger>
                  <AccordionContent>
                    <p>{questions[currentQuestion]?.conceptualBreakdown.clinical_relevance}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Button 
                className="w-full mt-4"
                onClick={() => handleAIHelp("Explain these concepts in more detail")}
              >
                Get More Information
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* FAQs Dialog */}
      <Dialog open={showFAQs} onOpenChange={setShowFAQs}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Frequently Asked Questions</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-4">
              <Accordion type="single" collapsible>
                {questions[currentQuestion]?.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>


      {/* AI Help Dialog */}
      <Dialog open={showAIHelp} onOpenChange={setShowAIHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Learning Assistant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                {aiResponse}
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
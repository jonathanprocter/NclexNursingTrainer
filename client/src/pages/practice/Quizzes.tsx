import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import QuestionCard from "@/components/nclex/QuestionCard";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Book, Activity, BarChart3, HelpCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface Question {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  category?: string;
  difficulty?: string;
}

export default function Quizzes() {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizComplete, setQuizComplete] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Generate new questions mutation
  const [previousQuestionIds, setPreviousQuestionIds] = useState<string[]>([]);
  const [userPerformance, setUserPerformance] = useState<{
    correctByTopic: { [key: string]: number },
    totalByTopic: { [key: string]: number }
  }>({
    correctByTopic: {},
    totalByTopic: {}
  });

  const generateQuestionsMutation = useMutation({
    mutationFn: async (topic?: string) => {
      try {
        const response = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic,
            previousQuestionIds,
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
        description: selectedTopic ? `Focus area: ${selectedTopic}` : "Get ready for a new set of questions!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate new questions. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const generateNewQuestions = (topic?: string) => {
    setIsLoading(true);
    setSelectedTopic(topic || null);
    generateQuestionsMutation.mutate(topic);
  };

  const handleAnswer = (questionId: number, selectedAnswer: string) => {
    if (isReviewMode) return;

    const currentQ = questions[currentQuestion];
    const correct = selectedAnswer === currentQ.correctAnswer;
    
    // Update user answers
    setUserAnswers(prev => ({...prev, [questionId]: selectedAnswer}));
    
    // Update score
    setScore(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // Track question ID
    setPreviousQuestionIds(prev => [...prev, currentQ.id]);

    // Update performance metrics
    setUserPerformance(prev => {
      const topic = currentQ.category || 'General';
      return {
        correctByTopic: {
          ...prev.correctByTopic,
          [topic]: (prev.correctByTopic[topic] || 0) + (correct ? 1 : 0)
        },
        totalByTopic: {
          ...prev.totalByTopic,
          [topic]: (prev.totalByTopic[topic] || 0) + 1
        }
      };
    });

    if (currentQuestion === questions.length - 1) {
      setQuizComplete(true);
      const percentage = Math.round((score.correct / questions.length) * 100);
      toast({
        title: "Quiz Complete!",
        description: `You scored ${percentage}% (${score.correct}/${questions.length} correct)`,
      });
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const startTopicPractice = (topic: string) => {
    generateNewQuestions(topic);
    // Switch to questions tab
    const questionsTab = document.querySelector('[value="questions"]') as HTMLElement;
    if (questionsTab) questionsTab.click();
  };

  const startReview = () => {
    setIsReviewMode(true);
    setCurrentQuestion(0);
    setQuizComplete(false);
  };

  const handleAIHelp = async () => {
    setShowAIHelp(true);
    setAiResponse("Loading AI explanation...");
    // Simulate API call
    setTimeout(() => {
      setAiResponse(`Here's a detailed explanation of the concept:

1. Key Points to Remember:
${questions[currentQuestion]?.explanation || "Loading explanation..."}

2. Clinical Reasoning:
- Consider the patient's condition and vital signs
- Follow standard protocols and guidelines
- Always prioritize patient safety

Would you like me to elaborate on any of these points?`);
    }, 1500);
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
                  <Button onClick={() => generateNewQuestions()}>Generate Questions</Button>
                </div>
              ) : !quizComplete ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <Badge variant="secondary">Question {currentQuestion + 1}</Badge>
                      <Badge variant="outline" className="ml-2">
                        {questions[currentQuestion]?.category || "General"}
                      </Badge>
                      <Badge variant="outline" className="ml-2">
                        {questions[currentQuestion]?.difficulty || "Medium"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      {!isReviewMode && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">
                            Time: {formatTime(timeRemaining)}
                          </span>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAIHelp}
                        className="flex items-center gap-2"
                      >
                        <HelpCircle className="h-4 w-4" />
                        AI Help
                      </Button>
                    </div>
                  </div>

                  <QuestionCard
                    question={questions[currentQuestion]}
                    onNext={(answer) => handleAnswer(questions[currentQuestion].id, answer)}
                    userAnswer={isReviewMode ? userAnswers[questions[currentQuestion].id] : undefined}
                    showAnswer={isReviewMode}
                  />

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
                      onClick={() => generateNewQuestions()}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Generate New Questions
                    </Button>
                    <Button variant="outline" onClick={startReview}>
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
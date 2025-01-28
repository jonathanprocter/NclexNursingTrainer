import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/nclex/QuestionCard";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Book, Activity, BarChart3, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Quizzes() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock questions with diverse content
  const mockQuestions = [
    {
      id: 1,
      text: "A client with type 2 diabetes mellitus has a blood glucose level of 180 mg/dL before lunch. Which of the following nursing actions is most appropriate?",
      options: [
        { id: "a", text: "Administer the prescribed insulin" },
        { id: "b", text: "Hold the lunch tray" },
        { id: "c", text: "Notify the healthcare provider" },
        { id: "d", text: "Document the finding and proceed with lunch" }
      ],
      correctAnswer: "d",
      explanation: "For a client with type 2 diabetes, a blood glucose level of 180 mg/dL before a meal is not unusually high and does not require immediate intervention. The nurse should document the finding and allow the client to eat lunch as scheduled.",
      category: "Endocrine",
      difficulty: "Medium"
    },
    {
      id: 2,
      text: "A nurse is caring for a client with heart failure who has been prescribed furosemide (Lasix). Which assessment finding requires immediate notification of the healthcare provider?",
      options: [
        { id: "a", text: "Blood pressure 118/72 mmHg" },
        { id: "b", text: "Urine output 2500 mL/24 hours" },
        { id: "c", text: "Serum potassium 2.9 mEq/L" },
        { id: "d", text: "Heart rate 82 beats/minute" }
      ],
      correctAnswer: "c",
      explanation: "A serum potassium level of 2.9 mEq/L indicates hypokalemia, which is a serious side effect of furosemide that requires immediate intervention.",
      category: "Cardiovascular",
      difficulty: "Hard"
    },
    {
      id: 3,
      text: "A nurse is preparing to administer a medication via the intramuscular route. Which of the following sites is most appropriate for an adult client?",
      options: [
        { id: "a", text: "Deltoid muscle" },
        { id: "b", text: "Vastus lateralis muscle" },
        { id: "c", text: "Ventrogluteal site" },
        { id: "d", text: "Dorsogluteal site" }
      ],
      correctAnswer: "c",
      explanation: "The ventrogluteal site is considered the safest for IM injections in adults because it is free from major nerves and blood vessels.",
      category: "Pharmacology",
      difficulty: "Medium"
    }
  ];

  const handleAIHelp = async () => {
    setShowAIHelp(true);
    // In a real implementation, this would make an API call to get AI assistance
    setAiResponse("Loading AI explanation...");
    // Simulate API call
    setTimeout(() => {
      setAiResponse(`Here's a detailed explanation of the concept:

1. Key Points to Remember:
- Normal blood glucose ranges before meals: 80-130 mg/dL
- Post-meal target: <180 mg/dL
- Consider individual patient factors

2. Clinical Reasoning:
- 180 mg/dL is slightly elevated but not critical
- No immediate intervention needed
- Important to maintain regular meal schedule

Would you like me to elaborate on any of these points?`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice Quizzes</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test your knowledge with topic-specific quizzes and track your progress
        </p>
      </div>

      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
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
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Badge variant="secondary">Question {currentQuestion + 1}</Badge>
                  <Badge variant="outline" className="ml-2">
                    {mockQuestions[currentQuestion]?.category || "General"}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    {mockQuestions[currentQuestion]?.difficulty || "Medium"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">
                      Time: {formatTime(timeRemaining)}
                    </span>
                  </div>
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
                question={mockQuestions[currentQuestion % mockQuestions.length]}
                onNext={() => setCurrentQuestion(c => (c + 1) % mockQuestions.length)}
              />

              <div className="mt-4">
                <Progress 
                  value={(currentQuestion + 1) * (100 / mockQuestions.length)} 
                  className="h-2" 
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>Progress</span>
                  <span>{currentQuestion + 1}/{mockQuestions.length} Questions</span>
                </div>
              </div>
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
                {['Fundamentals', 'Med-Surg', 'Pediatrics', 'OB/GYN', 'Mental Health', 'Leadership'].map((topic) => (
                  <Card key={topic}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{topic}</h3>
                      <Progress value={Math.random() * 100} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Questions: 50</span>
                        <span>Completed: 25</span>
                      </div>
                      <Button className="w-full mt-4">Practice</Button>
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
                      <Button variant="outline" className="w-full mt-4">
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
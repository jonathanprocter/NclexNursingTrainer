import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import QuestionCard from "@/components/nclex/QuestionCard";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Book, Activity, BarChart3, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface StudyTimeFormData {
  duration: string;
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

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    if (!quizComplete && !isReviewMode) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizComplete, isReviewMode]);

  const handleAnswer = (questionId: number, selectedAnswer: string) => {
    if (isReviewMode) return;

    setUserAnswers(prev => ({...prev, [questionId]: selectedAnswer}));
    const correct = selectedAnswer === mockQuestions[currentQuestion].correctAnswer;
    setScore(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    if (currentQuestion === mockQuestions.length - 1) {
      setQuizComplete(true);
      const percentage = Math.round((score.correct / mockQuestions.length) * 100);
      toast({
        title: "Quiz Complete!",
        description: `You scored ${percentage}% (${score.correct}/${mockQuestions.length} correct)`,
      });
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const generateNewQuestions = (topic?: string) => {
    setCurrentQuestion(0);
    setQuizComplete(false);
    setScore({ correct: 0, total: 0 });
    setUserAnswers({});
    setTimeRemaining(1800);
    setIsReviewMode(false);
    setSelectedTopic(topic || null);

    toast({
      title: "New Questions Generated",
      description: topic ? `Focus area: ${topic}` : "Get ready for a new set of questions!",
    });
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
${mockQuestions[currentQuestion].explanation}

2. Clinical Reasoning:
- Consider the patient's condition and vital signs
- Follow standard protocols and guidelines
- Always prioritize patient safety

Would you like me to elaborate on any of these points?`);
    }, 1500);
  };

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
    },
    {
      id: 4,
      text: "A nurse is assessing a client who has just been admitted with acute pancreatitis. Which of the following findings would the nurse expect to observe?",
      options: [
        { id: "a", text: "Sharp pain in the right upper quadrant" },
        { id: "b", text: "Epigastric pain radiating to the back" },
        { id: "c", text: "Dull pain in the left lower quadrant" },
        { id: "d", text: "Intermittent pain around the umbilicus" }
      ],
      correctAnswer: "b",
      explanation: "Classic signs of acute pancreatitis include severe epigastric pain that radiates to the back in a band-like pattern.",
      category: "Medical-Surgical",
      difficulty: "Medium"
    },
    {
      id: 5,
      text: "A nurse is caring for a client with severe burns. Which of the following interventions has the highest priority during the first 24 hours after injury?",
      options: [
        { id: "a", text: "Pain management" },
        { id: "b", text: "Fluid resuscitation" },
        { id: "c", text: "Wound care" },
        { id: "d", text: "Nutritional support" }
      ],
      correctAnswer: "b",
      explanation: "During the first 24 hours after a severe burn injury, fluid resuscitation is the highest priority to prevent hypovolemic shock.",
      category: "Critical Care",
      difficulty: "Hard"
    },
    {
      id: 6,
      text: "A nurse is teaching a client about warfarin (Coumadin) therapy. Which food should the client be instructed to avoid due to its high vitamin K content?",
      options: [
        { id: "a", text: "Carrots" },
        { id: "b", text: "Spinach" },
        { id: "c", text: "Apples" },
        { id: "d", text: "Potatoes" }
      ],
      correctAnswer: "b",
      explanation: "Spinach is high in vitamin K, which can decrease the effectiveness of warfarin therapy. Clients should maintain consistent vitamin K intake while on warfarin.",
      category: "Pharmacology",
      difficulty: "Medium"
    },
    {
      id: 7,
      text: "A nurse is caring for a client with active tuberculosis. Which type of isolation precautions should be implemented?",
      options: [
        { id: "a", text: "Contact" },
        { id: "b", text: "Droplet" },
        { id: "c", text: "Airborne" },
        { id: "d", text: "Standard" }
      ],
      correctAnswer: "c",
      explanation: "Tuberculosis is transmitted through airborne particles, requiring airborne precautions including negative pressure rooms and N95 respirators.",
      category: "Infection Control",
      difficulty: "Medium"
    },
    {
      id: 8,
      text: "A nurse is assessing a client who is 24 hours post-thyroidectomy. Which assessment finding requires immediate intervention?",
      options: [
        { id: "a", text: "Hoarseness" },
        { id: "b", text: "Tingling in fingers and toes" },
        { id: "c", text: "Slight drainage on dressing" },
        { id: "d", text: "Mild incisional pain" }
      ],
      correctAnswer: "b",
      explanation: "Tingling in the extremities may indicate hypocalcemia, a serious complication after thyroidectomy due to parathyroid gland damage.",
      category: "Medical-Surgical",
      difficulty: "Hard"
    },
    {
      id: 9,
      text: "A nurse is providing care for a client with major depression. The client states, 'I wish I could go to sleep and never wake up.' What is the nurse's best initial response?",
      options: [
        { id: "a", text: "Tell the client to think positive thoughts" },
        { id: "b", text: "Ask if the client has thoughts of harming themselves" },
        { id: "c", text: "Notify the healthcare provider immediately" },
        { id: "d", text: "Reassure the client that everything will be fine" }
      ],
      correctAnswer: "b",
      explanation: "The nurse should first assess for suicidal ideation by asking direct questions about self-harm thoughts to determine the level of risk.",
      category: "Mental Health",
      difficulty: "Hard"
    },
    {
      id: 10,
      text: "A nurse is preparing to administer packed red blood cells. Which of the following actions is most important before initiating the transfusion?",
      options: [
        { id: "a", text: "Verify blood type with two nurses" },
        { id: "b", text: "Premedicate with acetaminophen" },
        { id: "c", text: "Check vital signs" },
        { id: "d", text: "Document blood bank number" }
      ],
      correctAnswer: "a",
      explanation: "Verification of blood type and patient identification by two qualified healthcare professionals is crucial to prevent transfusion reactions.",
      category: "Safety",
      difficulty: "Hard"
    }
  ];

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
              {!quizComplete ? (
                <>
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
                    question={mockQuestions[currentQuestion]}
                    onNext={(answer) => handleAnswer(mockQuestions[currentQuestion].id, answer)}
                    userAnswer={isReviewMode ? userAnswers[mockQuestions[currentQuestion].id] : undefined}
                    showAnswer={isReviewMode}
                  />

                  <div className="mt-4">
                    <Progress 
                      value={(currentQuestion + 1) * (100 / mockQuestions.length)} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{isReviewMode ? "Review Progress" : "Progress"}</span>
                      <span>{currentQuestion + 1}/{mockQuestions.length} Questions</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Quiz Complete! 🎉</h2>
                    <p className="text-muted-foreground">
                      You scored {Math.round((score.correct / mockQuestions.length) * 100)}% 
                      ({score.correct}/{mockQuestions.length} correct)
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => generateNewQuestions()}>
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
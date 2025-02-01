import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ChevronRight, Timer, PauseCircle } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
}

export default function Exam() {
  const { type } = useParams();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(type === 'cat' ? 18000 : 10800); // 5 hours for CAT, 3 for standard
  const [isPaused, setIsPaused] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [examScore, setExamScore] = useState(0);

  useEffect(() => {
    if (type === 'cat' && questionNumber >= 75) {
      // CAT exam logic - can end between 75-145 questions based on performance
      const performanceThreshold = 0.75; // 75% correct
      if (examScore / questionNumber >= performanceThreshold || questionNumber >= 145) {
        setExamEnded(true);
      }
    } else if (type === 'standard' && questionNumber > 100) {
      // Standard exam ends after exactly 100 questions
      setExamEnded(true);
    }
  }, [questionNumber, examScore, type]);

  const fetchNextQuestion = async () => {
    try {
      const response = await fetch(`/api/exam/${type}/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examType: type,
          questionNumber,
          previousPerformance: examScore / questionNumber
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }

      const question = await response.json();
      setCurrentQuestion(question);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch the next question. Please try again.",
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    fetchNextQuestion();
  }, [type]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionId: string) => {
    // Submit answer and get next question
    setQuestionNumber(prev => prev + 1);
    fetchNextQuestion();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Exam Resumed" : "Exam Paused",
      description: isPaused ? "Time is now running" : "Time has been paused",
    });
  };

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {type === 'cat' ? 'CAT NCLEX Exam' : 'Standard NCLEX Exam'}
          </h2>
          <p className="text-muted-foreground">
            Question {questionNumber} {type === 'cat' ? '(75-145 questions)' : '(100 questions)'}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePause}
            className="gap-2"
          >
            {isPaused ? <Timer className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Time Remaining</p>
            <p className="font-mono font-bold">{formatTime(timeRemaining)}</p>
          </div>
        </div>
      </div>

      <Progress 
        value={type === 'cat' ? (questionNumber / 145) * 100 : questionNumber} 
        className="h-2"
      />

      <Card className="mt-6">
        <CardContent className="p-6">
          <p className="text-lg mb-6">{currentQuestion.text}</p>
          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="w-full justify-start gap-4 h-auto p-4"
                onClick={() => handleAnswer(option.id)}
              >
                <span className="font-bold">{option.id.toUpperCase()}.</span>
                <span className="flex-1 text-left">{option.text}</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isPaused && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Exam is currently paused. Click Resume to continue.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
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

// Mock quiz generation service (replace with actual implementation)
const quizGeneratorService = {
  generateQuiz: async (type: 'cat' | 'standard', performance: number, previousQuestions: string[], previousMistakes: string[]) => {
    const domains = [
      "Basic Care and Comfort",
      "Pharmacological and Parenteral Therapies",
      "Reduction of Risk Potential",
      "Physiological Adaptation",
      "Psychosocial Integrity",
      "Safe and Effective Care Environment"
    ];

    const questions: Question[] = [
      {
        id: '1',
        text: 'Question 1: What is the capital of France?',
        options: [
          { id: 'a', text: 'London' },
          { id: 'b', text: 'Paris' },
          { id: 'c', text: 'Rome' },
          { id: 'd', text: 'Berlin' }
        ]
      },
      {
        id: '2',
        text: 'Question 2: What is the highest mountain in the world?',
        options: [
          { id: 'a', text: 'K2' },
          { id: 'b', text: 'Kangchenjunga' },
          { id: 'c', text: 'Mount Everest' },
          { id: 'd', text: 'Lhotse' }
        ]
      }
      // Add more questions here based on type, performance, previous questions and mistakes.  This is a placeholder.
    ];
    return questions;
  }
};


const getCurrentPerformance = async () => {
  // Replace with actual implementation to fetch current performance
  return 0.5; // Example: 50%
};

const getPreviousQuestions = async () => {
  // Replace with actual implementation to fetch previous questions
  return []; // Example: []
};

const getPreviousMistakes = async () => {
  // Replace with actual implementation to fetch previous mistakes
  return []; // Example: []
};


export default function Exam() {
  const { type } = useParams();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(type === 'cat' ? 18000 : 10800); // 5 hours for CAT, 3 for standard
  const [isPaused, setIsPaused] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [examScore, setExamScore] = useState(0);

  useEffect(() => {
      const start = async () => {
          const currentPerformance = await getCurrentPerformance();
          const previousQuestions = await getPreviousQuestions();
          const previousMistakes = await getPreviousMistakes();

          const questions = await quizGeneratorService.generateQuiz(
            type,
            currentPerformance,
            previousQuestions,
            previousMistakes
          );

          setQuestions(questions);
      }
      start();
  }, [type]);


  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      setExamEnded(true);
    }
  }, [currentQuestionIndex, questions]);

  const fetchNextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
  };


  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionId: string, isCorrect: boolean) => {
    // Submit answer and get next question
    setExamScore(prev => isCorrect ? prev + 1 : prev);
    fetchNextQuestion();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Exam Resumed" : "Exam Paused",
      description: isPaused ? "Time is now running" : "Time has been paused",
    });
  };

  const currentQuestion = questions[currentQuestionIndex];

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
            Question {currentQuestionIndex + 1} of {questions.length}
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

      <Progress value={(currentQuestionIndex +1) / questions.length * 100} className="h-2" />

      <Card className="mt-6">
        <CardContent className="p-6">
          <p className="text-lg mb-6">{currentQuestion.text}</p>
          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="w-full justify-start gap-4 h-auto p-4"
                onClick={() => handleAnswer(option.id, option.id === 'b')} // Example: 'b' is correct
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
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
  tags: string[];
}

export default function QuestionBank() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Fetch questions from the API with error handling
  const { data: questions = [], isLoading, error } = useQuery<Question[]>({
    queryKey: ['/api/questions', selectedCategory],
    retry: 3,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    onError: (error) => {
      console.error("Error fetching questions:", error);
    }
  });

  useEffect(() => {
    if (questions && questions.length > 0 && !currentQuestion) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      setCurrentQuestion(questions[randomIndex]);
    }
  }, [questions, currentQuestion]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading Questions...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your practice session.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-red-600">Error Loading Questions</h2>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
          <p className="text-sm text-gray-500 mt-2">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!questions || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No Questions Available</h2>
          <p className="text-muted-foreground">
            There are currently no questions in the selected category.
            Please try selecting a different category or check back later.
          </p>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (optionId: string) => {
    if (!currentQuestion || showExplanation) return;

    setSelectedAnswer(optionId);
    setShowExplanation(true);
    setQuestionsAnswered(prev => prev + 1);

    if (optionId === currentQuestion.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);

    // Filter out the current question to avoid repetition
    const remainingQuestions = questions.filter(q => q.id !== currentQuestion?.id);

    if (remainingQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
      setCurrentQuestion(remainingQuestions[randomIndex]);
    } else {
      // If all questions have been shown, reset to full pool
      const randomIndex = Math.floor(Math.random() * questions.length);
      setCurrentQuestion(questions[randomIndex]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">NCLEX Practice Questions</h1>
          <p className="text-muted-foreground">
            Test your knowledge with our comprehensive question bank
          </p>
        </div>

        {currentQuestion && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Question {questionsAnswered + 1}</CardTitle>
              {questionsAnswered > 0 && (
                <div className="text-sm text-muted-foreground">
                  Score: {Math.round((correctAnswers / questionsAnswered) * 100)}%
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{currentQuestion.category}</Badge>
                  <Badge 
                    variant={
                      currentQuestion.difficulty === "Easy" ? "default" :
                      currentQuestion.difficulty === "Medium" ? "secondary" :
                      "destructive"
                    }
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                </div>

                <h3 className="text-lg font-medium leading-6">
                  {currentQuestion.text}
                </h3>

                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <Button
                      key={option.id}
                      variant={
                        showExplanation
                          ? option.id === currentQuestion.correctAnswer
                            ? "default"
                            : option.id === selectedAnswer
                            ? "destructive"
                            : "outline"
                          : selectedAnswer === option.id
                          ? "default"
                          : "outline"
                      }
                      className="w-full justify-start text-left h-auto p-4"
                      onClick={() => handleAnswerSelect(option.id)}
                      disabled={showExplanation}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>

                {showExplanation && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Explanation</h4>
                    <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                  </div>
                )}

                {showExplanation && (
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleNextQuestion}>Next Question</Button>
                  </div>
                )}

                {questionsAnswered > 0 && (
                  <div className="mt-6">
                    <Progress value={(correctAnswers / questionsAnswered) * 100} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
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

  // Fetch questions from the API
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions', selectedCategory],
    queryFn: async () => {
      const response = await fetch(`/api/questions${selectedCategory ? `?category=${selectedCategory}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    }
  });

  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      setCurrentQuestion(questions[randomIndex]);
    }
  }, [questions, currentQuestion]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">NCLEX Practice Questions</h1>
          <p className="text-muted-foreground">
            Test your knowledge with our comprehensive question bank
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Practice Session</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Questions Answered: {questionsAnswered}
                </p>
              </div>
              <div className="w-32">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="fundamentals">Fundamentals</SelectItem>
                    <SelectItem value="med-surg">Med-Surg</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="pharmacology">Pharmacology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {currentQuestion && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary/10">{currentQuestion.category}</Badge>
                  <Badge 
                    className={
                      currentQuestion.difficulty === "Easy" ? "bg-green-500/10" :
                      currentQuestion.difficulty === "Medium" ? "bg-yellow-500/10" :
                      "bg-red-500/10"
                    }
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                  {currentQuestion.tags.map((tag, index) => (
                    <Badge key={index} className="bg-muted">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h3 className="text-lg font-medium leading-6">
                  {currentQuestion.text}
                </h3>

                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <Button
                      key={option.id}
                      className={`w-full justify-start text-left h-auto p-4 ${
                        showExplanation
                          ? option.id === currentQuestion.correctAnswer
                            ? "bg-green-500/10 hover:bg-green-500/20"
                            : option.id === selectedAnswer
                            ? "bg-red-500/10 hover:bg-red-500/20"
                            : "bg-background hover:bg-accent"
                          : selectedAnswer === option.id
                          ? "bg-primary/10 hover:bg-primary/20"
                          : "bg-background hover:bg-accent"
                      }`}
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
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round((correctAnswers / questionsAnswered) * 100)}% Correct</span>
                    </div>
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
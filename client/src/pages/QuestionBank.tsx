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
  conceptualBreakdown?: {
    key_concepts: string[];
    related_topics: string[];
    clinical_relevance: string;
  };
  faqs?: {
    question: string;
    answer: string;
  }[];
}

export default function QuestionBank() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Fetch questions from the API
  const { data: questions = [], isLoading, refetch } = useQuery<Question[]>({
    queryKey: ['/api/questions', selectedCategory],
    queryFn: async () => {
      console.log('Fetching questions for category:', selectedCategory);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('topic', selectedCategory);
      const response = await fetch(`/api/questions?${params.toString()}`);
      if (!response.ok) {
        console.error('Failed to fetch questions:', response.status, response.statusText);
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      console.log('Received questions:', data);
      return data.questions;
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

  const handleGenerateMore = async () => {
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: selectedCategory,
        complexity: 'medium',
        previousQuestionIds: questions.map(q => q.id),
      }),
    });

    if (response.ok) {
      refetch(); // Refresh the questions list
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

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
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
          </CardHeader>
        </Card>

        {currentQuestion && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 mb-4">
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
                  {currentQuestion.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-muted">
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
                  <>
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Explanation</h4>
                      <p className="text-muted-foreground">{currentQuestion.explanation}</p>
                    </div>

                    {currentQuestion.conceptualBreakdown && (
                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Conceptual Breakdown</h4>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium">Key Concepts</h5>
                            <ul className="list-disc pl-5 mt-2">
                              {currentQuestion.conceptualBreakdown.key_concepts.map((concept, index) => (
                                <li key={index}>{concept}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium">Related Topics</h5>
                            <ul className="list-disc pl-5 mt-2">
                              {currentQuestion.conceptualBreakdown.related_topics.map((topic, index) => (
                                <li key={index}>{topic}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium">Clinical Relevance</h5>
                            <p className="mt-2">{currentQuestion.conceptualBreakdown.clinical_relevance}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentQuestion.faqs && currentQuestion.faqs.length > 0 && (
                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Frequently Asked Questions</h4>
                        <div className="space-y-4">
                          {currentQuestion.faqs.map((faq, index) => (
                            <div key={index}>
                              <h5 className="font-medium">{faq.question}</h5>
                              <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between mt-4">
                  {showExplanation && (
                    <Button onClick={handleNextQuestion}>Next Question</Button>
                  )}
                  <Button onClick={handleGenerateMore} variant="outline">
                    Generate More Questions
                  </Button>
                </div>

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
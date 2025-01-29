import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Question {
  id: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctAnswer: string;
  explanation: string;
  domain: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  conceptBreakdown: Array<{
    concept: string;
    explanation: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export default function Questions() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  const { data: questions = [], isLoading, refetch } = useQuery<Question[]>({
    queryKey: ["questions", selectedDifficulty],
    queryFn: async () => {
      const response = await fetch(`/api/questions?min=25&difficulty=${selectedDifficulty}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      return response.json();
    }
  });

  const generateMore = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          previousQuestionIds: questions.map(q => q.id),
          difficulty: selectedDifficulty
        })
      });
      return response.json();
    },
    onSuccess: () => refetch()
  });

  const toggleQuestion = (id: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleAnswer = (questionId: string) => {
    const newAnswered = new Set(answeredQuestions);
    newAnswered.add(questionId);
    setAnsweredQuestions(newAnswered);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading questions...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Practice Questions</h1>
        <div className="flex gap-4">
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => generateMore.mutate()}>Generate More</Button>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={`q-${question.id}`} className="border-l-4" style={{
              borderLeftColor: 
                question.difficulty.toLowerCase() === 'easy' ? '#4ade80' :
                question.difficulty.toLowerCase() === 'medium' ? '#fbbf24' : '#ef4444'
            }}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold mb-4">{question.text}</h3>
                  <Button
                    variant="ghost"
                    onClick={() => toggleQuestion(question.id)}
                  >
                    {expandedQuestions.has(question.id) ? 'Hide' : 'Show'}
                  </Button>
                </div>

                {expandedQuestions.has(question.id) && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <Button
                          key={option.id}
                          variant={answeredQuestions.has(question.id) ? 
                            (option.id === question.correctAnswer ? "default" : "secondary") : 
                            "outline"
                          }
                          className="w-full justify-start text-left"
                          onClick={() => !answeredQuestions.has(question.id) && handleAnswer(question.id)}
                        >
                          {option.text}
                        </Button>
                      ))}
                    </div>

                    {answeredQuestions.has(question.id) && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Explanation:</h4>
                        <p>{question.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
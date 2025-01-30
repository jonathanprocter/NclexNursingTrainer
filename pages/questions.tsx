import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HelpCircle, Book, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QuestionCard from "@/components/QuestionCard";

interface ConceptBreakdown {
  concept: string;
  explanation: string;
}

interface FAQ {
  question: string;
  answer: string;
}

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
  conceptBreakdown: ConceptBreakdown[];
  faqs: FAQ[];
}

export default function Questions() {
  const { toast } = useToast();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [currentAIQuestion, setCurrentAIQuestion] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Fetch questions
  const {
    data: questions = [],
    isLoading,
    refetch,
  } = useQuery<Question[]>({
    queryKey: ["questions", selectedDifficulty],
    queryFn: async () => {
      const response = await fetch(
        `/api/questions?difficulty=${selectedDifficulty}`,
      );
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });

  // Submit answer mutation
  const submitAnswer = useMutation({
    mutationFn: async ({
      questionId,
      answer,
    }: {
      questionId: string;
      answer: string;
    }) => {
      const response = await fetch(`/api/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      if (!response.ok) throw new Error("Failed to submit answer");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.isCorrect ? "Correct!" : "Incorrect",
        description: data.isCorrect
          ? "Great job!"
          : "Review the explanation and try again.",
        variant: data.isCorrect ? "default" : "destructive",
      });
      setShowExplanation(true);
    },
  });

  // Get AI help mutation
  const getAIHelp = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) throw new Error("Failed to get AI help");
      return response.json();
    },
    onSuccess: (data) => {
      setAiResponse(data.explanation);
      setShowAIHelp(true);
    },
  });

  // Handle question selection
  const handleQuestionSelect = (question: Question) => {
    setCurrentQuestion(question);
    setShowExplanation(false);
    setAiResponse("");
  };

  // Handle answer submission
  const handleAnswerSubmit = (answer: string) => {
    if (!currentQuestion) return;
    submitAnswer.mutate({ questionId: currentQuestion.id, answer });
  };

  // Request AI help
  const handleAIHelp = () => {
    if (!currentQuestion) return;
    getAIHelp.mutate(currentQuestion.text);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">NCLEX Practice Questions</h1>
        <Select
          value={selectedDifficulty}
          onValueChange={setSelectedDifficulty}
        >
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
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {/* Question List */}
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className={`p-3 border-b cursor-pointer hover:bg-muted ${
                    currentQuestion?.id === question.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleQuestionSelect(question)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Question {question.id}</span>
                    <Badge
                      variant={
                        question.difficulty === "hard"
                          ? "destructive"
                          : question.difficulty === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {question.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {question.text}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Question Content */}
        <div className="space-y-4">
          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              onAnswerSelect={handleAnswerSubmit}
              showExplanation={showExplanation}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Select a question to begin
              </CardContent>
            </Card>
          )}

          {currentQuestion && (
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIHelp}
                disabled={getAIHelp.isPending}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Get AI Help
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* AI Help Dialog */}
      <Dialog open={showAIHelp} onOpenChange={setShowAIHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Explanation</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="whitespace-pre-wrap">{aiResponse}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

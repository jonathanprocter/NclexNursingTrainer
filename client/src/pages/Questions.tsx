import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HelpCircle, Book, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [currentAIQuestion, setCurrentAIQuestion] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");

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

  const generateAIHelp = useMutation({
    mutationFn: async (questionText: string) => {
      const response = await fetch("/api/generate-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText })
      });
      if (!response.ok) {
        throw new Error('Failed to generate AI explanation');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAiResponse(data.explanation);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI explanation. Please try again.",
        variant: "destructive",
      });
    }
  });

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAnswer = (questionId: string) => {
    setAnsweredQuestions(prev => {
      const newSet = new Set(prev);
      newSet.add(questionId);
      return newSet;
    });
  };

  const handleAIHelp = (question: Question) => {
    setCurrentAIQuestion(question.text);
    setShowAIHelp(true);
    generateAIHelp.mutate(question.text);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading Questions...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your study materials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">NCLEX Practice Questions</h1>
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
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={`question-${question.id}-${Math.random().toString(36)}`} className="border-l-4" style={{
              borderLeftColor: 
                question.difficulty.toLowerCase() === 'easy' ? '#4ade80' :
                question.difficulty.toLowerCase() === 'medium' ? '#fbbf24' : '#ef4444'
            }}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge>{question.domain}</Badge>
                        <Badge variant="outline">{question.topic}</Badge>
                        <Badge variant="secondary">{question.subtopic}</Badge>
                        <Badge variant={
                          question.difficulty.toLowerCase() === 'easy' ? 'success' :
                          question.difficulty.toLowerCase() === 'medium' ? 'warning' : 'destructive'
                        }>
                          {question.difficulty}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{question.text}</h3>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIHelp(question)}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Ask AI
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQuestion(question.id)}
                      >
                        {expandedQuestions.has(question.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {expandedQuestions.has(question.id) && (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        {question.options.map((option) => (
                          <Button
                            key={`${question.id}-${option.id}`}
                            variant={answeredQuestions.has(question.id) ? 
                              (option.id === question.correctAnswer ? "default" : "secondary") : 
                              "outline"
                            }
                            className="w-full justify-start text-left h-auto p-4"
                            onClick={() => !answeredQuestions.has(question.id) && handleAnswer(question.id)}
                          >
                            {option.text}
                          </Button>
                        ))}
                      </div>

                      {answeredQuestions.has(question.id) && (
                        <div className="space-y-4">
                          <Alert>
                            <Book className="h-4 w-4 mr-2" />
                            <AlertDescription>
                              <h4 className="font-semibold mb-2">Explanation</h4>
                              <p>{question.explanation}</p>
                            </AlertDescription>
                          </Alert>

                          {question.conceptBreakdown.length > 0 && (
                            <div className="bg-muted p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Concept Breakdown</h4>
                              <div className="space-y-2">
                                {question.conceptBreakdown.map((concept, index) => (
                                  <div key={`concept-${index}`} className="border-l-2 border-primary pl-4">
                                    <h5 className="font-medium">{concept.concept}</h5>
                                    <p className="text-sm text-muted-foreground">{concept.explanation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {question.faqs.length > 0 && (
                            <div className="bg-muted p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Frequently Asked Questions</h4>
                              <div className="space-y-3">
                                {question.faqs.map((faq, index) => (
                                  <div key={`faq-${index}`}>
                                    <h5 className="font-medium">{faq.question}</h5>
                                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={showAIHelp} onOpenChange={setShowAIHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Learning Assistant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="space-y-2">
                <p className="font-medium">Question:</p>
                <p>{currentAIQuestion}</p>
                <p className="font-medium mt-4">AI Response:</p>
                <p>{aiResponse || "Generating response..."}</p>
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
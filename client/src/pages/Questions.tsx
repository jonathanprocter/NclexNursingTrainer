
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ChevronDown, RefreshCcw } from "lucide-react";

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

  const { data: questions, isLoading, refetch } = useQuery<Question[]>({
    queryKey: ["/api/questions", selectedDifficulty],
  });

  const generateMore = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          previousQuestionIds: questions?.map(q => q.id),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading Questions...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your personalized questions.</p>
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
            Master your nursing knowledge with adaptive practice questions
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <TabsList>
              <TabsTrigger value="all">All Levels</TabsTrigger>
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button 
            onClick={() => generateMore.mutate()}
            disabled={generateMore.isPending}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Generate More
          </Button>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            {questions?.map((question) => (
              <Card key={question.id} className="border-l-4" style={{
                borderLeftColor: 
                  question.difficulty === 'easy' ? '#4ade80' :
                  question.difficulty === 'medium' ? '#fbbf24' : '#ef4444'
              }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-sm bg-muted px-2 py-1 rounded">{question.domain}</span>
                        <span className="text-sm bg-muted px-2 py-1 rounded">{question.topic}</span>
                      </div>
                      <CardTitle className="text-lg">{question.text}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQuestion(question.id)}
                    >
                      <ChevronDown className={`h-4 w-4 transform ${expandedQuestions.has(question.id) ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {question.options.map((option) => (
                      <Button
                        key={option.id}
                        variant={option.id === question.correctAnswer ? "default" : "outline"}
                        className="w-full justify-start text-left h-auto p-4"
                      >
                        {option.text}
                      </Button>
                    ))}
                    
                    {expandedQuestions.has(question.id) && (
                      <div className="mt-6 space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Explanation</h4>
                          <p className="text-muted-foreground">{question.explanation}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Concept Breakdown</h4>
                          {question.conceptBreakdown.map((concept, i) => (
                            <div key={i} className="mb-3">
                              <h5 className="font-medium">{concept.concept}</h5>
                              <p className="text-muted-foreground">{concept.explanation}</p>
                            </div>
                          ))}
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">FAQs</h4>
                          {question.faqs.map((faq, i) => (
                            <div key={i} className="mb-3">
                              <h5 className="font-medium">{faq.question}</h5>
                              <p className="text-muted-foreground">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

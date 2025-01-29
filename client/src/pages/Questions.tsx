
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Question {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

export default function Questions() {
  const { toast } = useToast();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/questions");
        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }
        return response.json();
      } catch (error) {
        console.error("Question fetch error:", error);
        return [];
      }
    },
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
    return <div>Loading questions...</div>;
  }

  const filteredQuestions = (questions || []).filter(
    (q) => selectedDifficulty === "all" || q.difficulty === selectedDifficulty
  );

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Practice Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ScrollArea className="h-[600px]">
              {filteredQuestions.map((question) => (
                <Card key={`question-${question.id}-${question.text}`} className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>{question.text}</div>
                      <Badge>{question.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={`${question.id}-option-${option.id}`}
                          className="flex items-center gap-2"
                        >
                          <span>{option.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

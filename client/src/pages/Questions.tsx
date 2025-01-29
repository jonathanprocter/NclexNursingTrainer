import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

interface Question {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  category: string;
  uniqueId?:string;
}

export default function Questions() {
  const { data = [], isLoading, isError } = useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await fetch("/api/questions");
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const questions = await response.json();
      return questions.map((q: any, index: number) => ({
        ...q,
        uniqueId: `q-${index}-${q.id || Math.random()}`
      }));
    }
  });

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  if (isError) {
    return <div>Error loading questions. Please try again.</div>;
  }

  const questions = data || [];

  return (
    <Card>
      <CardContent className="p-6">
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.uniqueId} className="p-4">
                <h3 className="font-medium mb-2">{question.question}</h3>
                <p className="text-muted-foreground mb-2">{question.answer}</p>
                {question.explanation && (
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
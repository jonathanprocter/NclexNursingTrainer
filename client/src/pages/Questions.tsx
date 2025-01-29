
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

interface Question {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  category: string;
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 text-red-500">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

function QuestionsList() {
  const { data, isLoading, isError, error } = useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await fetch("/api/questions");
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      return response.json();
    },
    retry: 3,
    refetchOnWindowFocus: false
  });

  if (isLoading) return <div>Loading questions...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;
  if (!data) return <div>No questions available</div>;

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {data.map((question) => (
          <Card key={`question-${question.id}`} className="p-4">
            <h3 className="font-medium mb-2">{question.question}</h3>
            <p className="text-muted-foreground mb-2">{question.answer}</p>
            {question.explanation && (
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            )}
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

export default function Questions() {
  return (
    <Card>
      <CardContent className="p-6">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <QuestionsList />
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}

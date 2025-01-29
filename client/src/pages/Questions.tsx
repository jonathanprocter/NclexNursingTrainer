
import { useQuery } from "@tanstack/react-query";
import QuestionCard from "../components/QuestionCard";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { RefreshCw } from "lucide-react";

interface Question {
  id: string;
  type: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function Questions() {
  const { data: questions, isLoading, isError, refetch } = useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await fetch("/api/questions");
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <RefreshCw className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <p>Error loading questions</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Practice Questions</h1>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Questions
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-6">
          {questions?.map((question, index) => (
            <QuestionCard
              key={`${question.id}-${index}`}
              question={question}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

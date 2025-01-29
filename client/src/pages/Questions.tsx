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

const fetchQuestions = async () => {
  const response = await fetch("/api/questions");
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
};

export default function Questions() {
  const { data: questions = [], isError, isLoading, refetch } = useQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    retry: 1
  });

  if (isError) {
    return <div>Error loading questions</div>;
  }

  if (isLoading) {
    return <div>Loading questions...</div>;
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
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
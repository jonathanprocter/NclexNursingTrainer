import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import QuestionCard from '@/components/QuestionCard';
import { Progress } from "@/components/ui/progress";

interface Question {
  id: string;
  type: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const fetchQuestions = async (): Promise<Question[]> => {
  const response = await fetch("/api/questions");
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
};

export default function Questions() {
  const {
    data: questions = [],
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={`loading-${i}`}>
              <CardContent className="p-6">
                <div className="h-24 w-full bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Failed to load questions</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
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
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
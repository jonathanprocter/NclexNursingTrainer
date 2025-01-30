import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type {
  Question,
  QuestionState,
  QuestionStats,
} from '@/types/questions';
import { useToast } from "@/hooks/use-toast";

export function useQuestions(options: {
  difficulty?: string;
  category?: string;
  examMode?: boolean;
}) {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionState, setQuestionState] = useState<QuestionState>({
    selectedAnswer: null,
    showExplanation: false,
  });
  const [stats, setStats] = useState<QuestionStats>({
    totalAnswered: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    streakCount: 0,
    accuracy: 0,
  });

  // Fetch questions
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["questions", options.difficulty, options.category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.difficulty) params.append("difficulty", options.difficulty);
      if (options.category) params.append("category", options.category);

      const response = await fetch(`/api/questions?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Submit answer mutation
  const submitAnswer = useMutation({
    mutationFn: async (answer: string) => {
      if (!currentQuestion) return;

      const response = await fetch("/api/questions/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer,
          timeSpent: 0, // TODO: Add timer
        }),
      });

      if (!response.ok) throw new Error("Failed to submit answer");
      return response.json();
    },
    onSuccess: (data, answer) => {
      if (!currentQuestion) return;

      const isCorrect = answer === currentQuestion.correctAnswer;
      setQuestionState((prev) => ({
        ...prev,
        showExplanation: true,
        isCorrect,
      }));

      setStats((prev) => {
        const newStats = {
          totalAnswered: prev.totalAnswered + 1,
          correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
          incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
          streakCount: isCorrect ? prev.streakCount + 1 : 0,
          accuracy: 0,
        };
        newStats.accuracy =
          (newStats.correctAnswers / newStats.totalAnswered) * 100;
        return newStats;
      });

      toast({
        title: isCorrect ? "Correct!" : "Incorrect",
        description: isCorrect
          ? "Great job!"
          : "Review the explanation and try again.",
        variant: isCorrect ? "default" : "destructive",
      });
    },
  });

  const handleAnswer = useCallback(
    (answer: string) => {
      setQuestionState((prev) => ({ ...prev, selectedAnswer: answer }));
      submitAnswer.mutate(answer);
    },
    [submitAnswer],
  );

  const nextQuestion = useCallback(() => {
    if (!questions.length) return;

    // Simple random selection for now
    const remainingQuestions = questions.filter(
      (q) => q.id !== currentQuestion?.id,
    );

    const questionPool = remainingQuestions.length > 0 ? remainingQuestions : questions;
    const randomIndex = Math.floor(Math.random() * questionPool.length);
    setCurrentQuestion(questionPool[randomIndex]);
    setQuestionState({ selectedAnswer: null, showExplanation: false });
  }, [questions, currentQuestion]);

  const skipQuestion = useCallback(() => {
    nextQuestion();
    toast({
      title: "Question Skipped",
      description: "Moving to the next question...",
      variant: "default",
    });
  }, [nextQuestion, toast]);

  const showHint = useCallback(() => {
    if (!currentQuestion?.explanation) {
      toast({
        title: "No hint available",
        description: "This question doesn't have a hint.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Hint",
      description: currentQuestion.explanation,
      variant: "default",
    });
  }, [currentQuestion, toast]);

  const resetSession = useCallback(() => {
    setCurrentQuestion(null);
    setQuestionState({ selectedAnswer: null, showExplanation: false });
    setStats({
      totalAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streakCount: 0,
      accuracy: 0,
    });
  }, []);

  // Initialize first question
  useEffect(() => {
    if (questions.length && !currentQuestion) {
      nextQuestion();
    }
  }, [questions, currentQuestion, nextQuestion]);

  return {
    currentQuestion,
    questionState,
    stats,
    isLoading,
    handleAnswer,
    nextQuestion,
    skipQuestion,
    showHint,
    resetSession,
  };
}

export default useQuestions;

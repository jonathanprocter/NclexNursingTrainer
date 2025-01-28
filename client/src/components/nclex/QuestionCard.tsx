import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateAdaptiveQuestions } from "@/lib/ai/openai";
import { generateDetailedExplanation } from "@/lib/ai/anthropic";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionCardProps {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  previousPerformance?: number;
  onNext: () => void;
  onAnswerSubmit: (data: {
    correct: boolean;
    timeSpent: number;
    difficulty: string;
    topic: string;
  }) => void;
}

export default function QuestionCard({ 
  topic, 
  difficulty, 
  previousPerformance = 0.5,
  onNext,
  onAnswerSubmit 
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailedExplanation, setDetailedExplanation] = useState<string>("");

  useEffect(() => {
    loadQuestion();
  }, [topic, difficulty, previousPerformance]);

  async function loadQuestion() {
    try {
      setLoading(true);
      const generatedQuestion = await generateAdaptiveQuestions({
        difficulty,
        topic,
        subtopics: [], // This could be enhanced with more specific subtopics
        previousPerformance
      });
      setQuestion(generatedQuestion);
    } catch (error) {
      console.error("Error loading question:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetailedExplanation() {
    if (!question) return;

    try {
      const explanation = await generateDetailedExplanation({
        topic,
        concept: question.explanation,
        difficulty,
        learningStyle: "visual" // This could be personalized per user
      });
      setDetailedExplanation(explanation);
    } catch (error) {
      console.error("Error loading detailed explanation:", error);
    }
  }

  const handleSubmit = async () => {
    if (!showExplanation && question) {
      const timeSpent = (Date.now() - startTime) / 1000; // Convert to seconds
      const correct = selectedAnswer === question.correctAnswer;

      onAnswerSubmit({
        correct,
        timeSpent,
        difficulty: question.difficulty,
        topic: question.topics[0]
      });

      setShowExplanation(true);
      await loadDetailedExplanation();
    } else {
      setSelectedAnswer("");
      setShowExplanation(false);
      setDetailedExplanation("");
      onNext();
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-20" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Error loading question. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Question</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg">{question.question}</p>

        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
          disabled={showExplanation}
        >
          {question.options.map((option: { id: string; text: string }) => (
            <div
              key={option.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border",
                showExplanation && option.id === question.correctAnswer && "bg-green-50 border-green-200",
                showExplanation && selectedAnswer === option.id && option.id !== question.correctAnswer && "bg-red-50 border-red-200"
              )}
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <Label className="flex-1 cursor-pointer" htmlFor={option.id}>
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Quick Explanation:</h4>
              <p>{question.explanation}</p>
            </div>

            {detailedExplanation && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Detailed Explanation:</h4>
                <p className="whitespace-pre-wrap">{detailedExplanation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!selectedAnswer && !showExplanation}
        >
          {showExplanation ? "Next Question" : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
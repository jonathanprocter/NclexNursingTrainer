import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/questions";

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  showExplanation: boolean;
  isCorrect?: boolean;
  onAnswerSelect: (answerId: string) => void;
  onNext: () => void;
  stats?: {
    totalAnswered: number;
    accuracy: number;
    streakCount: number;
  };
}

export default function QuestionCard({
  question,
  selectedAnswer,
  showExplanation,
  isCorrect,
  onAnswerSelect,
  onNext,
  stats,
}: QuestionCardProps) {
  const getOptionClass = (optionId: string) => {
    if (!showExplanation) return "";

    if (optionId === question.correctAnswer) {
      return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900";
    }
    if (selectedAnswer === optionId && optionId !== question.correctAnswer) {
      return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900";
    }
    return "";
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Question {question.id}
            <Badge
              variant={
                question.difficulty === "hard"
                  ? "destructive"
                  : question.difficulty === "medium"
                    ? "default"
                    : "secondary"
              }
            >
              {question.difficulty}
            </Badge>
          </CardTitle>
          {stats && (
            <div className="flex items-center gap-4 text-sm">
              <div>Answered: {stats.totalAnswered}</div>
              <div>Accuracy: {stats.accuracy.toFixed(1)}%</div>
              {stats.streakCount > 1 && (
                <Badge variant="default">Streak: {stats.streakCount}</Badge>
              )}
            </div>
          )}
        </div>
        {showExplanation && (
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              isCorrect
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
            )}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>
              {isCorrect
                ? "Correct!"
                : "Incorrect. Review the explanation below."}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-lg">{question.text}</p>

        <RadioGroup
          value={selectedAnswer || ""}
          onValueChange={onAnswerSelect}
          className="space-y-3"
          disabled={showExplanation}
        >
          {question.options.map((option) => (
            <div
              key={option.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                getOptionClass(option.id),
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
              <h4 className="font-semibold mb-2">Explanation:</h4>
              <p>{question.explanation}</p>
            </div>

            {question.conceptBreakdown && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Key Concepts:</h4>
                <ul className="space-y-2">
                  {question.conceptBreakdown.map((concept, index) => (
                    <li key={index}>
                      <strong>{concept.concept}:</strong> {concept.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={
            showExplanation
              ? onNext
              : () => selectedAnswer && onAnswerSelect(selectedAnswer)
          }
          disabled={!selectedAnswer && !showExplanation}
        >
          {showExplanation ? "Next Question" : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
}

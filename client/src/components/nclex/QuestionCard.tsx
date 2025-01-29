import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/questions";

interface QuestionCardProps {
  question: Question;
  onNext: (answer: string) => void;
  userAnswer?: string;
  showAnswer?: boolean;
}

export default function QuestionCard({
  question,
  onNext,
  userAnswer,
  showAnswer = false,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");

  const getOptionClass = (optionId: string): string => {
    if (!showAnswer) return "";

    if (optionId === question.correctAnswer) {
      return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900";
    }
    if ((userAnswer || selectedAnswer) === optionId && optionId !== question.correctAnswer) {
      return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900";
    }
    return "";
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    onNext(selectedAnswer);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            <div className="flex items-center gap-2">
              Question {question.id}
              {question.difficulty && (
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
              )}
            </div>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-lg">{question.text}</p>

        <RadioGroup
          value={userAnswer || selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
          disabled={showAnswer}
        >
          {question.options.map((option) => (
            <div
              key={option.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                getOptionClass(option.id)
              )}
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showAnswer && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Explanation:</h4>
              <p>{question.explanation}</p>
            </div>

            {question.conceptBreakdown && question.conceptBreakdown.length > 0 && (
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
          onClick={handleSubmit}
          disabled={!selectedAnswer || showAnswer}
        >
          {showAnswer ? "Next Question" : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
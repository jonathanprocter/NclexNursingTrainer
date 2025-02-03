import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: {
    id: number;
    text: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    explanation: string;
  };
  onNext: (selectedAnswer: string) => void;
  userAnswer?: string;
  showAnswer?: boolean;
}

export default function QuestionCard({ question, onNext, userAnswer, showAnswer }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>(userAnswer || "");
  const [showExplanation, setShowExplanation] = useState(showAnswer);

  const handleSubmit = () => {
    if (!showExplanation) {
      setShowExplanation(true);
      onNext(selectedAnswer);
    } else {
      setSelectedAnswer("");
      setShowExplanation(false);
      onNext(selectedAnswer);
    }
  };

  const getOptionClass = (optionId: string) => {
    if (!showExplanation && !showAnswer) return "";

    if (optionId === question.correctAnswer) {
      return "bg-green-50 border-green-200";
    }
    if ((userAnswer || selectedAnswer) === optionId && optionId !== question.correctAnswer) {
      return "bg-red-50 border-red-200";
    }
    return "";
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Question {question.id}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg">{question.text}</p>

        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
          disabled={showExplanation || showAnswer}
        >
          {question.options.map((option) => (
            <div
              key={option.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border touch-manipulation", // Added touch-manipulation class here
                getOptionClass(option.id)
              )}
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <Label className="flex-1 cursor-pointer" htmlFor={option.id}>
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {(showExplanation || showAnswer) && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Explanation:</h4>
            <p>{question.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={(!selectedAnswer && !showExplanation && !showAnswer)}
        >
          {showAnswer ? "Next Question" : (showExplanation ? "Next Question" : "Submit Answer")}
        </Button>
      </CardFooter>
    </Card>
  );
}
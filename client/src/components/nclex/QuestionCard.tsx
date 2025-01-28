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
  onNext: () => void;
}

export default function QuestionCard({ question, onNext }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSubmit = () => {
    if (!showExplanation) {
      setShowExplanation(true);
    } else {
      setSelectedAnswer("");
      setShowExplanation(false);
      onNext();
    }
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
          disabled={showExplanation}
        >
          {question.options.map((option) => (
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
          disabled={!selectedAnswer && !showExplanation}
        >
          {showExplanation ? "Next Question" : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
}

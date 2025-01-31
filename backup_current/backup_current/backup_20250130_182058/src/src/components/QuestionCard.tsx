import { Card, CardContent, CardHeader } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useState } from "react";

interface QuestionCardProps {
  question: {
    id: string;
    type: string;
    content: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSubmit = () => {
    setShowExplanation(true);
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="text-lg font-medium">{question.content}</div>
        <div className="text-sm text-muted-foreground">Type: {question.type}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-2"
        >
          {question.options.map((option, index) => (
            <div key={`${question.id}-option-${index}`} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${question.id}-option-${index}`} />
              <Label htmlFor={`${question.id}-option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        <Button 
          onClick={handleSubmit} 
          disabled={!selectedAnswer}
          className="w-full"
        >
          Submit Answer
        </Button>

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-medium mb-2">
              {selectedAnswer === question.correctAnswer ? (
                <span className="text-green-600">Correct!</span>
              ) : (
                <span className="text-red-600">Incorrect</span>
              )}
            </p>
            <p className="text-sm">Correct Answer: {question.correctAnswer}</p>
            <p className="text-sm mt-2">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
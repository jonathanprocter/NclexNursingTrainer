import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

interface Question {
  id: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  conceptBreakdown?: Array<{
    concept: string;
    explanation: string;
  }>;
}

interface QuestionCardProps {
  question: Question;
  onAnswerSelect: (answer: string) => void;
  showExplanation?: boolean;
}

export default function QuestionCard({ question = {} }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState("");

  if (!question.id) {
    return <div>No question data available</div>;
  }

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    onAnswerSelect(selectedAnswer);
  };

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
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Question {question.id}</CardTitle>
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
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg">{question.text}</p>

        <RadioGroup
          value={selectedAnswer}
          onValueChange={handleAnswerSelect}
          className="space-y-3"
          disabled={showExplanation}
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

        {showExplanation && (
          <div className="mt-6 space-y-4">
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
          disabled={!selectedAnswer || showExplanation}
        >
          {showExplanation ? "Next Question" : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
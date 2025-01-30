import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Book, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import QuestionCard from '@/QuestionCard';
import { useQuestions } from "@/hooks/useQuestions";

interface StudySession {
  startTime: Date;
  questionsAttempted: number;
  correctAnswers: number;
  streakCount: number;
}

export default function QuestionBank() {
  const { toast } = useToast();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showConceptDialog, setShowConceptDialog] = useState(false);
  const [studySession, setStudySession] = useState<StudySession>({
    startTime: new Date(),
    questionsAttempted: 0,
    correctAnswers: 0,
    streakCount: 0,
  });

  const {
    currentQuestion,
    questionState,
    stats,
    isLoading,
    handleAnswer,
    nextQuestion,
    skipQuestion,
    showHint,
    resetSession,
  } = useQuestions({
    difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value);
    resetSession();
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    resetSession();
  };

  const handleShowConcepts = () => {
    if (!currentQuestion?.conceptBreakdown) {
      toast({
        title: "No concept breakdown available",
        description:
          "This question doesn't have additional concept information.",
        variant: "default",
      });
      return;
    }
    setShowConceptDialog(true);
  };

  const handleAnswerSubmit = async (answer: string) => {
    const result = await handleAnswer(answer);
    setStudySession((prev) => ({
      ...prev,
      questionsAttempted: prev.questionsAttempted + 1,
      correctAnswers: prev.correctAnswers + (result.isCorrect ? 1 : 0),
      streakCount: result.isCorrect ? prev.streakCount + 1 : 0,
    }));
  };

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Loading questions...</CardTitle>
          <Progress value={undefined} className="w-full" />
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={selectedDifficulty}
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="medical-surgical">Medical-Surgical</SelectItem>
              <SelectItem value="pediatric">Pediatric</SelectItem>
              <SelectItem value="psychiatric">Psychiatric</SelectItem>
              <SelectItem value="maternal">Maternal</SelectItem>
              <SelectItem value="pharmacology">Pharmacology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Session Stats */}
        {studySession.questionsAttempted > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Attempted</div>
                <div className="text-2xl font-bold">
                  {studySession.questionsAttempted}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Correct</div>
                <div className="text-2xl font-bold">
                  {studySession.correctAnswers}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
                <div className="text-2xl font-bold">
                  {(
                    (studySession.correctAnswers /
                      studySession.questionsAttempted) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Current Streak
                </div>
                <div className="text-2xl font-bold">
                  {studySession.streakCount}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Card */}
      {currentQuestion ? (
        <div className="space-y-4">
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={questionState.selectedAnswer}
            showExplanation={questionState.showExplanation}
            isCorrect={questionState.isCorrect}
            onAnswerSelect={handleAnswerSubmit}
            onNext={nextQuestion}
            stats={stats}
          />

          <div className="max-w-2xl mx-auto flex justify-between">
            <Button variant="outline" size="sm" onClick={skipQuestion}>
              Skip Question
            </Button>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={showHint}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Show Hint
              </Button>
              <Button variant="outline" size="sm" onClick={handleShowConcepts}>
                <Book className="w-4 h-4 mr-2" />
                Review Concepts
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>No questions available</CardTitle>
            <AlertDescription>
              Try selecting different filters or check back later for more
              questions.
            </AlertDescription>
          </CardHeader>
        </Card>
      )}

      {/* Concept Dialog */}
      <Dialog open={showConceptDialog} onOpenChange={setShowConceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Key Concepts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentQuestion?.conceptBreakdown?.map((concept, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold">{concept.concept}</h4>
                <p className="text-sm text-muted-foreground">
                  {concept.explanation}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

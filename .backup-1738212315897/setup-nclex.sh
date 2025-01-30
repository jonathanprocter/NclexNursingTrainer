#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting NCLEX App Complete Setup...${NC}"

# Ensure we're in the workspace directory
WORKSPACE_DIR="/home/runner/workspace"
cd "$WORKSPACE_DIR"

# Function to create directory if it doesn't exist
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo -e "${GREEN}Created directory: $1${NC}"
    fi
}

# Create directory structure
echo -e "${BLUE}Creating directory structure...${NC}"
create_dir "$WORKSPACE_DIR/client/src/components"
create_dir "$WORKSPACE_DIR/client/src/components/ui"
create_dir "$WORKSPACE_DIR/client/src/pages"
create_dir "$WORKSPACE_DIR/client/src/hooks"
create_dir "$WORKSPACE_DIR/client/src/lib"
create_dir "$WORKSPACE_DIR/server/routes"
create_dir "$WORKSPACE_DIR/server/db"

# Create QuestionCard.tsx
echo -e "${BLUE}Creating QuestionCard component...${NC}"
cat > "$WORKSPACE_DIR/client/src/components/QuestionCard.tsx" << 'EOL'
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

export default function QuestionCard({
  question,
  onAnswerSelect,
  showExplanation = false
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");

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
EOL

# Update Questions.tsx imports
echo -e "${BLUE}Updating Questions.tsx imports...${NC}"
sed -i 's|@/components/QuestionCard|../components/QuestionCard|g' "$WORKSPACE_DIR/client/src/pages/Questions.tsx"
sed -i 's|@/components/ui|../components/ui|g' "$WORKSPACE_DIR/client/src/pages/Questions.tsx"
sed -i 's|@/hooks/use-toast|../hooks/use-toast|g' "$WORKSPACE_DIR/client/src/pages/Questions.tsx"

# Create questions route if it doesn't exist
echo -e "${BLUE}Creating questions route...${NC}"
cat > "$WORKSPACE_DIR/server/routes/questions.ts" << 'EOL'
import express from "express";
import { db } from "../db";
import { questions, questionHistory, userProgress } from "../db/schema";
import { eq, and, lt, desc } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { difficulty, category, min = 25 } = req.query;
    
    let query = db.select().from(questions);
    
    if (difficulty && difficulty !== "all") {
      query = query.where(eq(questions.difficulty, parseInt(difficulty as string)));
    }
    
    if (category && category !== "all") {
      query = query.where(eq(questions.category, category as string));
    }

    const questionsList = await query.limit(parseInt(min as string));
    const shuffled = [...questionsList].sort(() => Math.random() - 0.5);

    res.json(shuffled);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

router.post("/:id/answer", async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, userId, timeSpent } = req.body;

    const question = await db.select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)))
      .limit(1);

    if (!question.length) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = answer === question[0].correctAnswer;

    await db.insert(questionHistory).values({
      userId: parseInt(userId),
      questionId: parseInt(id),
      answer,
      isCorrect,
      timeSpent,
      timestamp: new Date(),
    });

    const progress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, parseInt(userId)))
      .limit(1);

    if (progress.length) {
      await db
        .update(userProgress)
        .set({
          totalQuestions: progress[0].totalQuestions + 1,
          correctAnswers: progress[0].correctAnswers + (isCorrect ? 1 : 0),
          lastStudied: new Date(),
        })
        .where(eq(userProgress.userId, parseInt(userId)));
    }

    res.json({
      isCorrect,
      explanation: question[0].explanation,
      conceptBreakdown: question[0].conceptBreakdown,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

export default router;
EOL

# Verify imports and paths
echo -e "${BLUE}Final verification of imports and paths...${NC}"
files_to_check=(
    $(find "$WORKSPACE_DIR/client/src" -type f -name "*.tsx" -o -name "*.ts")
)

for file in "${files_to_check[@]}"; do
    if grep -q "@/components" "$file"; then
        echo -e "${RED}Found absolute import in $file. Updating to relative import...${NC}"
        sed -i 's|@/components|../components|g' "$file"
    fi
done

# Install required dependencies
echo -e "${BLUE}Installing required dependencies...${NC}"
npm install @radix-ui/react-dialog @radix-ui/react-radio-group @radix-ui/react-label @tanstack/react-query class-variance-authority clsx lucide-react tailwind-merge --save

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Visit the /questions route to see the questions interface"
echo "3. Test the question functionality"
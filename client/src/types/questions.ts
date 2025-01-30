export interface Option {
  id: string;
  text: string;
}

export interface ConceptBreakdown {
  concept: string;
  explanation: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  domain?: string;
  topic?: string;
  subtopic?: string;
  category?: string;
  difficulty: "easy" | "medium" | "hard";
  conceptBreakdown?: ConceptBreakdown[];
  faqs?: FAQ[];
  tags?: string[];
}

export interface QuestionState {
  selectedAnswer: string | null;
  showExplanation: boolean;
  isCorrect?: boolean;
}

export interface QuestionStats {
  totalAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  streakCount: number;
  accuracy: number;
}

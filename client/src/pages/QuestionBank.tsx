import { useState } from "react";
import QuestionCard from "@/components/nclex/QuestionCard";

const questions = [
  {
    id: 1,
    text: "A client with type 2 diabetes mellitus has a blood glucose level of 180 mg/dL before lunch. Which of the following nursing actions is most appropriate?",
    options: [
      { id: "a", text: "Administer the prescribed insulin" },
      { id: "b", text: "Hold the lunch tray" },
      { id: "c", text: "Notify the healthcare provider" },
      { id: "d", text: "Document the finding and proceed with lunch" }
    ],
    correctAnswer: "d",
    explanation: "For a client with type 2 diabetes, a blood glucose level of 180 mg/dL before a meal is not unusually high and does not require immediate intervention. The nurse should document the finding and allow the client to eat lunch as scheduled."
  },
  // Add more questions as needed
];

export default function QuestionBank() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => 
      prev < questions.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice Questions</h1>
        <p className="text-muted-foreground">
          Test your knowledge with NCLEX-style questions
        </p>
      </div>

      <QuestionCard
        question={questions[currentQuestionIndex]}
        onNext={handleNextQuestion}
      />

      <div className="text-center text-sm text-muted-foreground">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
    </div>
  );
}

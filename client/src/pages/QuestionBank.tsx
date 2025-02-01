import React, { useEffect, useState } from "react";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
  tags: string[];
  conceptualBreakdown?: {
    key_concepts: string[];
    related_topics: string[];
    clinical_relevance: string;
  };
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

interface QuestionResponse {
  questions: Question[];
  total: number;
  page: number;
  totalPages: number;
}

export default function QuestionBank() {
  const [data, setData] = useState<QuestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/questions")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => setData(data))
      .catch((error) => {
        console.error("Error fetching questions:", error);
        setError("Error fetching questions");
      });
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!data) {
    return <div>Loading questions...</div>;
  }

  return (
    <div>
      <h1>Question Bank</h1>
      <p>
        Page {data.page} of {data.totalPages}
      </p>
      {data.questions.map((question) => (
        <div key={question.id} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
          <h3>{question.text}</h3>
          <ul>
            {question.options.map((option) => (
              <li key={option.id}>{option.text}</li>
            ))}
          </ul>
          <p>
            <strong>Explanation:</strong> {question.explanation}
          </p>
          {question.conceptualBreakdown && (
            <div>
              <strong>Conceptual Breakdown:</strong>
              <ul>
                {question.conceptualBreakdown.key_concepts.map((concept, idx) => (
                  <li key={idx}>{concept}</li>
                ))}
              </ul>
            </div>
          )}
          {question.faqs && (
            <div>
              <strong>FAQs:</strong>
              {question.faqs.map((faq, idx) => (
                <div key={idx}>
                  <p><em>{faq.question}</em></p>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

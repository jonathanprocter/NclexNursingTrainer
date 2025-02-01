#!/bin/bash
set -e

echo "Creating directories..."
mkdir -p server/data
mkdir -p server/routes
mkdir -p client/src/pages

echo "Creating server/data/practice-questions.ts..."
cat << 'EOF' > server/data/practice-questions.ts
// server/data/practice-questions.ts

export const practiceQuestions = Object.entries({
  fundamentals: [
    {
      id: "fund-1",
      text: "A client has a respiratory rate of 28 breaths/min, oxygen saturation of 89%, and is using accessory muscles. Which nursing intervention should be implemented first?",
      options: [
        { id: "a", text: "Position the client in high Fowler's position" },
        { id: "b", text: "Administer prescribed PRN bronchodilator" },
        { id: "c", text: "Call for a respiratory therapy consult" },
        { id: "d", text: "Document the assessment findings" }
      ],
      correctAnswer: "a",
      explanation: "Positioning the client in high Fowler's position is the first priority as it maximizes lung expansion and reduces the work of breathing. This position helps decrease the work of breathing and improves oxygenation before implementing other interventions.",
      category: "Fundamentals",
      difficulty: "Medium",
      tags: ["respiratory", "positioning", "oxygenation"],
      conceptualBreakdown: {
        key_concepts: [
          "ABC prioritization",
          "Respiratory assessment",
          "Positioning for optimal breathing"
        ],
        related_topics: [
          "Oxygen therapy",
          "Respiratory distress",
          "Patient positioning"
        ],
        clinical_relevance: "Proper positioning is often the first and simplest intervention to improve oxygenation and can be implemented immediately while preparing other interventions."
      },
      faqs: [
        {
          question: "Why is positioning prioritized over medication?",
          answer: "Positioning is a non-invasive intervention that can be implemented immediately without waiting for orders or medication preparation, potentially improving the patient's condition quickly."
        }
      ]
    },
    {
      id: "fund-2",
      text: "A nurse is assessing a client's neurological status. Which combination of findings indicates the need for immediate medical intervention?",
      options: [
        { id: "a", text: "Alert, oriented x3, pupils equal and reactive" },
        { id: "b", text: "Drowsy but arousable, bilateral hand grasp equal" },
        { id: "c", text: "Unresponsive to verbal stimuli, unequal pupils" },
        { id: "d", text: "Confused, but following simple commands" }
      ],
      correctAnswer: "c",
      explanation: "Unresponsiveness to verbal stimuli combined with unequal pupils indicates a significant neurological change that requires immediate medical attention as it could signify increased intracranial pressure or other acute neurological conditions.",
      category: "Fundamentals",
      difficulty: "Hard",
      tags: ["neurological", "assessment", "critical thinking"]
    }
  ],
  "med-surg": [
    {
      id: "med-1",
      text: "A client with heart failure is experiencing dyspnea and fatigue. Which position would best facilitate breathing?",
      options: [
        { id: "a", text: "Supine position with one pillow" },
        { id: "b", text: "High Fowler's position (60-90 degrees)" },
        { id: "c", text: "Left lateral position with legs elevated" },
        { id: "d", text: "Right lateral position with head flat" }
      ],
      correctAnswer: "b",
      explanation: "High Fowler's position (60-90 degrees) reduces venous return to the heart and promotes optimal lung expansion, making it the best position for a client with heart failure experiencing dyspnea.",
      category: "Med-Surg",
      difficulty: "Medium",
      tags: ["cardiac", "positioning", "respiratory"],
      conceptualBreakdown: {
        key_concepts: [
          "Heart failure management",
          "Positioning for cardiac conditions",
          "Respiratory support"
        ],
        related_topics: [
          "Cardiac assessment",
          "Dyspnea management",
          "Patient comfort"
        ],
        clinical_relevance: "Proper positioning in heart failure helps reduce workload on the heart and improves respiratory function by optimizing lung expansion."
      }
    }
  ]
}).reduce((acc, [category, questions]) => {
  const normalizedQuestions = questions.map((q) => ({
    ...q,
    category:
      category === "med-surg"
        ? "Med-Surg"
        : category === "fundamentals"
        ? "Fundamentals"
        : category
  }));
  return acc.concat(normalizedQuestions);
}, []);
EOF

echo "Creating server/routes/questions.ts..."
cat << 'EOF' > server/routes/questions.ts
import express from "express";
import { practiceQuestions } from "../data/practice-questions";

const router = express.Router();

// GET /api/questions - Get all questions with optional filtering
router.get("/", async (req, res) => {
  try {
    const { topic, limit = 10, page = 1 } = req.query;

    let questionsList = practiceQuestions;

    // Filter by topic if provided
    if (topic) {
      questionsList = questionsList.filter(q =>
        q.category.toLowerCase() === topic.toString().toLowerCase()
      );
    }

    // Apply pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedQuestions = questionsList.slice(startIndex, endIndex);

    res.json({
      questions: paginatedQuestions,
      total: questionsList.length,
      page: Number(page),
      totalPages: Math.ceil(questionsList.length / Number(limit))
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      message: "Failed to fetch questions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/questions/:id - Get a specific question by ID
router.get("/:id", async (req, res) => {
  try {
    const question = practiceQuestions.find(q => q.id === req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({
      message: "Failed to fetch question",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
EOF

echo "Creating client/src/pages/QuestionBank.tsx..."
cat << 'EOF' > client/src/pages/QuestionBank.tsx
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
EOF

echo "Setup complete. The necessary files have been created."

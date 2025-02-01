import { Question } from '../../client/src/types/questions';

// Question categories
export const questionCategories = {
  fundamentals: "Fundamentals",
  medSurg: "Med-Surg",
  pediatrics: "Pediatrics",
  pharmacology: "Pharmacology"
} as const;

type QuestionCategory = typeof questionCategories[keyof typeof questionCategories];

// Question data by category
const questionsByCategory: Record<string, Question[]> = {
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
      category: questionCategories.fundamentals,
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
    }
  ],
  medSurg: [
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
      category: questionCategories.medSurg,
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
};

// Transform the questions data into a flat array
export const practiceQuestions: Question[] = Object.entries(questionsByCategory)
  .flatMap(([_, questions]) => questions);

// Utility functions
export const getQuestionsByCategory = (category: QuestionCategory): Question[] => {
  return questionsByCategory[category.toLowerCase()] || [];
};

export const getAllCategories = (): QuestionCategory[] => {
  return Object.values(questionCategories);
};

export const getQuestionById = (id: string): Question | undefined => {
  return practiceQuestions.find(q => q.id === id);
};
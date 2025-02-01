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

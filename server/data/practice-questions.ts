export const practiceQuestions = {
  "fundamentals": [
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
      tags: ["respiratory", "positioning", "oxygenation"]
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
      tags: ["cardiac", "positioning", "respiratory"]
    },
    {
      id: "med-2",
      text: "A client with type 2 diabetes has a blood glucose of 45 mg/dL and is experiencing diaphoresis and confusion. What is the priority nursing intervention?",
      options: [
        { id: "a", text: "Administer prescribed insulin" },
        { id: "b", text: "Give 15g of fast-acting carbohydrate" },
        { id: "c", text: "Check ketones in urine" },
        { id: "d", text: "Call healthcare provider immediately" }
      ],
      correctAnswer: "b",
      explanation: "For hypoglycemia (blood glucose < 70 mg/dL), the priority is to raise blood glucose quickly using 15g of fast-acting carbohydrate according to the Rule of 15. This is especially important when the client is symptomatic.",
      category: "Med-Surg",
      difficulty: "Medium",
      tags: ["diabetes", "hypoglycemia", "prioritization"]
    }
  ],
  "pediatrics": [
    {
      id: "ped-1",
      text: "A 2-year-old child is admitted with severe dehydration. Which assessment finding is most concerning?",
      options: [
        { id: "a", text: "Moist mucous membranes" },
        { id: "b", text: "Decreased tear production" },
        { id: "c", text: "Delayed capillary refill > 3 seconds" },
        { id: "d", text: "Frequent urination" }
      ],
      correctAnswer: "c",
      explanation: "Delayed capillary refill > 3 seconds indicates significant dehydration and compromised peripheral circulation, requiring immediate intervention.",
      category: "Pediatrics",
      difficulty: "Hard",
      tags: ["pediatric", "assessment", "dehydration"]
    },
    {
      id: "ped-2",
      text: "When administering oral medication to a 4-year-old child, which nursing intervention is most appropriate?",
      options: [
        { id: "a", text: "Tell the child it tastes like candy" },
        { id: "b", text: "Mix the medication in a full glass of juice" },
        { id: "c", text: "Explain the procedure using age-appropriate terms" },
        { id: "d", text: "Have the parent force the medication if refused" }
      ],
      correctAnswer: "c",
      explanation: "Using age-appropriate explanations helps reduce anxiety and promotes cooperation. Never deceive children about medication or force administration, as this can create distrust and future compliance issues.",
      category: "Pediatrics",
      difficulty: "Medium",
      tags: ["pediatric", "medication administration", "communication"]
    }
  ],
  "pharmacology": [
    {
      id: "pharm-1",
      text: "A client is prescribed digoxin 0.125 mg PO daily. Before administering the medication, which assessment is most critical?",
      options: [
        { id: "a", text: "Blood pressure" },
        { id: "b", text: "Apical pulse for full minute" },
        { id: "c", text: "Respiratory rate" },
        { id: "d", text: "Temperature" }
      ],
      correctAnswer: "b",
      explanation: "Apical pulse must be assessed for a full minute before administering digoxin. Hold the medication and notify the provider if pulse is < 60 beats/min in adults, as bradycardia may indicate toxicity.",
      category: "Pharmacology",
      difficulty: "Medium",
      tags: ["medication safety", "cardiac", "assessment"]
    }
  ]
};
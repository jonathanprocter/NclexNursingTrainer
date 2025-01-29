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
      domain: "Physiological Integrity",
      topic: "Basic Care and Comfort",
      subtopic: "Oxygenation",
      difficulty: "Medium",
      conceptBreakdown: [
        {
          concept: "ABC Priority",
          explanation: "Airway and breathing take priority over other interventions"
        },
        {
          concept: "Positioning",
          explanation: "High Fowler's position (60-90 degrees) optimizes respiratory function"
        }
      ],
      faqs: [
        {
          question: "Why not give the bronchodilator first?",
          answer: "While medication may help, positioning is a quick, non-pharmacological intervention that can immediately help breathing"
        },
        {
          question: "What are the signs of respiratory distress?",
          answer: "Increased respiratory rate, decreased O2 saturation, use of accessory muscles"
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
      domain: "Physiological Integrity",
      topic: "Neurological",
      subtopic: "Assessment",
      difficulty: "Hard",
      conceptBreakdown: [],
      faqs: []
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
      domain: "Physiological Integrity",
      topic: "Cardiovascular",
      subtopic: "Heart Failure",
      difficulty: "Medium",
      conceptBreakdown: [],
      faqs: []
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
      domain: "Physiological Integrity",
      topic: "Endocrine",
      subtopic: "Diabetes",
      difficulty: "Medium",
      conceptBreakdown: [],
      faqs: []
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
      domain: "Physiological Integrity",
      topic: "Pediatric",
      subtopic: "Dehydration",
      difficulty: "Hard",
      conceptBreakdown: [],
      faqs: []
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
      domain: "Psychosocial Integrity",
      topic: "Pediatric",
      subtopic: "Communication",
      difficulty: "Medium",
      conceptBreakdown: [],
      faqs: []
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
      domain: "Physiological Integrity",
      topic: "Pharmacological and Parenteral Therapies",
      subtopic: "Cardiac Glycosides",
      difficulty: "Medium",
      conceptBreakdown: [],
      faqs: []
    }
  ],
  "standard": [
    {
      id: "std_1",
      text: "Which nursing intervention is most appropriate for a client with acute pain?",
      options: [
        { id: "a", text: "Assess pain characteristics" },
        { id: "b", text: "Administer PRN pain medication immediately" },
        { id: "c", text: "Notify healthcare provider" },
        { id: "d", text: "Apply ice pack to affected area" }
      ],
      correctAnswer: "a",
      explanation: "Pain assessment should be conducted first to determine appropriate interventions.",
      category: "Patient Care",
      difficulty: "Medium"
    },
    {
      id: "std_2",
      text: "What is the first step in preventing medication errors?",
      options: [
        { id: "a", text: "Check the five rights" },
        { id: "b", text: "Verify allergies" },
        { id: "c", text: "Document administration" },
        { id: "d", text: "Call pharmacy" }
      ],
      correctAnswer: "a",
      explanation: "The five rights are the first line of defense in preventing medication errors.",
      category: "Medication Safety",
      difficulty: "Easy"
    },
    {
      id: "std_3",
      text: "Which assessment finding requires immediate intervention in a post-operative patient?",
      options: [
        { id: "a", text: "Slight incision redness" },
        { id: "b", text: "Temperature of 101.5°F" },
        { id: "c", text: "Decreased urinary output" },
        { id: "d", text: "Mild nausea" }
      ],
      correctAnswer: "c",
      explanation: "Decreased urinary output could indicate shock or organ dysfunction requiring immediate attention.",
      category: "Post-operative Care",
      difficulty: "Hard"
    },
    {
      id: "std_anxiety_management",
      text: "Which nursing intervention is most appropriate for a patient experiencing acute anxiety?",
      options: [
        { id: "a", text: "Administer PRN medication immediately" },
        { id: "b", text: "Use therapeutic communication and breathing techniques" },
        { id: "c", text: "Call for psychiatric consultation" },
        { id: "d", text: "Restrain the patient for safety" }
      ],
      correctAnswer: "b",
      explanation: "Therapeutic communication and breathing techniques are the first-line interventions for anxiety, being non-pharmacological and promoting patient autonomy.",
      domain: "Psychosocial Integrity",
      topic: "Anxiety Management",
      subtopic: "Therapeutic Communication",
      difficulty: "Medium",
      conceptBreakdown: [],
      faqs: []
    },
    {
      id: "std_dka_management",
      text: "A patient presents with symptoms of diabetic ketoacidosis. What is the priority nursing action?",
      options: [
        { id: "a", text: "Administer insulin as ordered" },
        { id: "b", text: "Check blood glucose level" },
        { id: "c", text: "Assess level of consciousness" },
        { id: "d", text: "Start IV fluids" }
      ],
      correctAnswer: "c",
      explanation: "Assessing level of consciousness is the priority as it indicates the severity of DKA and guides immediate interventions.",
      domain: "Physiological Integrity",
      topic: "Endocrine",
      subtopic: "Diabetic Ketoacidosis",
      difficulty: "Hard",
      conceptBreakdown: [],
      faqs: []
    }
  ]
};
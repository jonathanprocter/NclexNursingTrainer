"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionsWithMinimum = exports.practiceQuestions = void 0;
exports.practiceQuestions = {
    // Keep existing categories but ensure unique IDs
    "fundamentals": [
        {
            id: "fund_1", // Changed from fund-1 to fund_1 for consistency
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
            id: "fund_2",
            text: "A patient presents with sudden onset of shortness of breath and chest pain. What is the priority nursing assessment?",
            options: [
                { id: "a", text: "Auscultate breath sounds" },
                { id: "b", text: "Assess oxygen saturation" },
                { id: "c", text: "Obtain vital signs" },
                { id: "d", text: "Obtain 12-lead ECG" }
            ],
            correctAnswer: "c",
            explanation: "Obtaining vital signs provides a baseline assessment of the patient's hemodynamic status and respiratory effort.  This is crucial in a patient experiencing acute distress.",
            domain: "Physiological Integrity",
            topic: "Cardiovascular",
            subtopic: "Acute Coronary Syndrome",
            difficulty: "Hard",
            conceptBreakdown: [],
            faqs: []
        },
        {
            id: "fund_3",
            text: "A client is experiencing severe anxiety. Which nursing intervention is most appropriate?",
            options: [
                { id: "a", text: "Administer a sedative" },
                { id: "b", text: "Encourage deep breathing exercises" },
                { id: "c", text: "Place the client in restraints" },
                { id: "d", text: "Leave the client alone to calm down" }
            ],
            correctAnswer: "b",
            explanation: "Deep breathing exercises are a non-pharmacological intervention that can help reduce anxiety. This approach is less invasive and respects the client's autonomy.",
            domain: "Psychosocial Integrity",
            topic: "Anxiety Management",
            subtopic: "Relaxation Techniques",
            difficulty: "Medium",
            conceptBreakdown: [],
            faqs: []
        },
        {
            id: "fund_4",
            text: "A client has a urinary catheter in place. Which nursing intervention is essential to prevent infection?",
            options: [
                { id: "a", text: "Irrigate the catheter regularly" },
                { id: "b", text: "Clamp the catheter intermittently" },
                { id: "c", text: "Maintain a closed drainage system" },
                { id: "d", text: "Change the catheter daily" }
            ],
            correctAnswer: "c",
            explanation: "Maintaining a closed drainage system prevents the introduction of bacteria into the urinary tract.",
            domain: "Physiological Integrity",
            topic: "Urinary",
            subtopic: "Catheter Care",
            difficulty: "Easy",
            conceptBreakdown: [],
            faqs: []
        },
        {
            id: "fund_5",
            text: "A client is experiencing hypoglycemia. What is the priority nursing intervention?",
            options: [
                { id: "a", text: "Administer insulin" },
                { id: "b", text: "Give the client a sugary drink" },
                { id: "c", text: "Monitor blood glucose levels" },
                { id: "d", text: "Check for ketones in the urine" }
            ],
            correctAnswer: "b",
            explanation: "Giving the client a sugary drink will quickly raise their blood glucose levels.",
            domain: "Physiological Integrity",
            topic: "Endocrine",
            subtopic: "Diabetes",
            difficulty: "Easy",
            conceptBreakdown: [],
            faqs: []
        }
    ],
    "med-surg": [
        {
            id: "med_1", // Changed from med-1 to med_1
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
            conceptBreakdown: [
                {
                    concept: "Cardiac Positioning",
                    explanation: "Proper positioning reduces cardiac workload and improves breathing"
                }
            ],
            faqs: [
                {
                    question: "Why is supine position not recommended?",
                    answer: "Supine position increases venous return and cardiac workload, worsening heart failure symptoms"
                }
            ]
        },
        {
            id: "med_2",
            text: "A client with a urinary tract infection (UTI) is experiencing pain and burning on urination. Which nursing intervention is most important?",
            options: [
                { id: "a", text: "Encourage increased fluid intake" },
                { id: "b", text: "Administer analgesics as ordered" },
                { id: "c", text: "Apply a warm compress to the lower abdomen" },
                { id: "d", text: "Restrict fluids to decrease urinary frequency" }
            ],
            correctAnswer: "a",
            explanation: "Increased fluid intake helps to flush out bacteria from the urinary tract.",
            domain: "Physiological Integrity",
            topic: "Urinary",
            subtopic: "Urinary Tract Infections",
            difficulty: "Easy",
            conceptBreakdown: [],
            faqs: []
        }
    ],
    "advanced": [
        {
            id: "adv_1",
            text: "A client with acute respiratory distress syndrome (ARDS) is receiving mechanical ventilation. Which intervention should the nurse implement first?",
            options: [
                { id: "a", text: "Maintain head of bed at 30-45 degrees" },
                { id: "b", text: "Check endotracheal tube placement" },
                { id: "c", text: "Monitor oxygen saturation" },
                { id: "d", text: "Document ventilator settings" }
            ],
            correctAnswer: "b",
            explanation: "Checking endotracheal tube placement is critical to ensure proper ventilation and oxygenation. Tube displacement can lead to rapid deterioration.",
            domain: "Physiological Integrity",
            topic: "Critical Care",
            subtopic: "Mechanical Ventilation",
            difficulty: "Hard",
            conceptBreakdown: [
                {
                    concept: "Airway Management",
                    explanation: "Proper tube placement is essential for effective mechanical ventilation"
                }
            ],
            faqs: [
                {
                    question: "How often should tube placement be verified?",
                    answer: "At least every shift and with any significant change in patient status"
                }
            ]
        },
        {
            id: "adv_2",
            text: "A patient is experiencing septic shock. What is the priority nursing intervention?",
            options: [
                { id: "a", text: "Administer antibiotics as ordered" },
                { id: "b", text: "Monitor vital signs closely" },
                { id: "c", text: "Maintain fluid balance" },
                { id: "d", text: "Assess level of consciousness" }
            ],
            correctAnswer: "c",
            explanation: "Maintaining fluid balance is crucial in septic shock to support blood pressure and tissue perfusion.",
            domain: "Physiological Integrity",
            topic: "Critical Care",
            subtopic: "Septic Shock",
            difficulty: "Hard",
            conceptBreakdown: [],
            faqs: []
        }
    ],
    "pediatrics": [
        {
            id: "ped_1",
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
            id: "ped_2",
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
            id: "pharm_1",
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
// Add a function to ensure minimum question count
const getQuestionsWithMinimum = (minCount = 25) => {
    const allQuestions = Object.values(exports.practiceQuestions).flat();
    const result = [...allQuestions];
    // If we don't have enough questions, generate variations
    while (result.length < minCount) {
        const baseQuestion = allQuestions[result.length % allQuestions.length];
        const newId = `${baseQuestion.id}_var_${result.length}`;
        // Create a variation with the same structure but different ID
        result.push({
            ...baseQuestion,
            id: newId,
        });
    }
    return result;
};
exports.getQuestionsWithMinimum = getQuestionsWithMinimum;

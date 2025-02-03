
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  domain: string;
  topics: string[];
  difficulty: string;
}

const basicSkillsQuestions: Question[] = [
  {
    id: "basic-1",
    text: "During a patient assessment, which vital sign should be assessed first?",
    options: [
      { id: "a", text: "Blood pressure" },
      { id: "b", text: "Temperature" },
      { id: "c", text: "Airway and breathing" },
      { id: "d", text: "Pulse" }
    ],
    correctAnswer: "c",
    explanation: "Airway and breathing are assessed first following the ABCs (Airway, Breathing, Circulation) of patient assessment.",
    domain: "Basic Skills",
    topics: ["Patient Assessment", "Vital Signs"],
    difficulty: "Medium"
  },
  {
    id: "basic-2",
    text: "What is the correct sequence for performing hand hygiene?",
    options: [
      { id: "a", text: "Wet hands, apply soap, rinse, dry" },
      { id: "b", text: "Apply sanitizer, rub hands, wait to dry" },
      { id: "c", text: "Wet hands, apply soap, lather for 20 seconds, rinse, dry" },
      { id: "d", text: "Apply soap to dry hands, wet hands, rinse, dry" }
    ],
    correctAnswer: "c",
    explanation: "Proper hand hygiene requires 20 seconds of lathering to effectively remove microorganisms.",
    domain: "Basic Skills",
    topics: ["Patient Safety", "Infection Control"],
    difficulty: "Easy"
  }
];

const advancedSkillsQuestions: Question[] = [
  {
    id: "adv-3",
    text: "A patient presents with acute respiratory distress. Analyze the following arterial blood gas results:\npH: 7.31\nPaCO2: 52 mmHg\nHCO3: 24 mEq/L\nPaO2: 58 mmHg\nWhat is your interpretation and next action?",
    options: [
      { id: "a", text: "Respiratory acidosis, initiate BiPAP" },
      { id: "b", text: "Metabolic acidosis, administer sodium bicarbonate" },
      { id: "c", text: "Respiratory alkalosis, monitor closely" },
      { id: "d", text: "Mixed acid-base disorder, obtain chest x-ray" }
    ],
    correctAnswer: "a",
    explanation: "The decreased pH with elevated PaCO2 indicates respiratory acidosis. BiPAP would help correct the underlying respiratory issue.",
    domain: "Advanced Skills",
    topics: ["Critical Care", "ABG Interpretation"],
    difficulty: "Hard"
  },
  {
    id: "adv-4",
    text: "During a code situation, the patient has been receiving chest compressions for 2 minutes. The rhythm shows Ventricular Fibrillation. What is the most appropriate next step?",
    options: [
      { id: "a", text: "Continue chest compressions" },
      { id: "b", text: "Administer 1mg epinephrine" },
      { id: "c", text: "Deliver shock at 200 joules" },
      { id: "d", text: "Check pulse" }
    ],
    correctAnswer: "c",
    explanation: "For VF, after 2 minutes of CPR, the next step is to deliver a shock, following the ACLS algorithm for shockable rhythms.",
    domain: "Advanced Skills",
    topics: ["Emergency Response", "ACLS Protocol"],
    difficulty: "Hard"
  }
  {
    id: "adv-1",
    text: "In a code situation, what is the first priority for the team leader?",
    options: [
      { id: "a", text: "Assign roles to team members" },
      { id: "b", text: "Begin chest compressions" },
      { id: "c", text: "Call for additional help" },
      { id: "d", text: "Document the event" }
    ],
    correctAnswer: "a",
    explanation: "The team leader's first priority is to organize the team by assigning clear roles to ensure effective resuscitation efforts.",
    domain: "Advanced Skills",
    topics: ["Team Leadership", "Emergency Interventions"],
    difficulty: "Hard"
  },
  {
    id: "adv-2",
    text: "Which assessment finding requires immediate intervention in a critical care patient?",
    options: [
      { id: "a", text: "SpO2 of 95% on room air" },
      { id: "b", text: "Heart rate of 90 bpm" },
      { id: "c", text: "Mean arterial pressure of 55 mmHg" },
      { id: "d", text: "Temperature of 37.5°C" }
    ],
    correctAnswer: "c",
    explanation: "A mean arterial pressure (MAP) below 65 mmHg indicates inadequate tissue perfusion and requires immediate intervention.",
    domain: "Advanced Skills",
    topics: ["Critical Care Monitoring", "Complex Procedures"],
    difficulty: "Hard"
  }
];

export function SkillsLabQuestions() {
  const [currentQuestions, setCurrentQuestions] = useState([...basicSkillsQuestions, ...advancedSkillsQuestions]);

  const handleGenerateMore = async () => {
    // Implement API call to generate more questions
    // For now, we'll just show a message
    alert("Generating more questions... (API implementation needed)");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {currentQuestions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{question.text}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{question.domain}</Badge>
                  <Badge variant="secondary">{question.difficulty}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {question.topics.map((topic) => (
                  <Badge key={topic} variant="outline" className="bg-muted">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                {question.options.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="justify-start text-left"
                  >
                    {option.id}. {option.text}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center">
        <Button onClick={handleGenerateMore} className="gap-2">
          <Bot className="h-4 w-4" />
          Generate More Questions
        </Button>
      </div>
    </div>
  );
}

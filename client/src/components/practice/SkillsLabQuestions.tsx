
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

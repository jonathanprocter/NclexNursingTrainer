
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAIHelp } from '@/lib/ai-services';
import { Bot } from 'lucide-react';

export default function ClinicalJudgment() {
  const { handleAIHelp } = useAIHelp();
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [currentCase, setCurrentCase] = useState<SimulationScenario | null>(null);
  const [userChoices, setUserChoices] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [caseStep, setCaseStep] = useState<number>(0);

  const handleGenerateCase = async () => {
    try {
      const scenario = await generateSimulationScenario('intermediate', ['clinical_judgment']);
      setCurrentCase(scenario);
      setUserChoices([]);
      setCaseStep(0);
      setFeedback('');
    } catch (error) {
      console.error('Error generating case:', error);
    }
  };

  const handleDecision = async (action: string) => {
    const expectedAction = currentCase?.expected_actions[caseStep];
    if (!expectedAction) return;

    const newChoices = [...userChoices, action];
    setUserChoices(newChoices);

    const isCorrect = action === expectedAction.action;
    setFeedback(isCorrect ? 
      `Correct! ${expectedAction.rationale}` : 
      `Consider this: ${expectedAction.rationale}`
    );

    if (caseStep < (currentCase?.expected_actions.length || 0) - 1) {
      setCaseStep(prev => prev + 1);
    }
  };

  const clinicalJudgmentMetrics = [
    { domain: "Recognize Cues", score: 85, description: "Identify relevant patient data and clinical patterns" },
    { domain: "Analyze Information", score: 78, description: "Interpret and synthesize clinical information" },
    { domain: "Prioritize Hypotheses", score: 82, description: "Develop and rank potential diagnoses" },
    { domain: "Generate Solutions", score: 75, description: "Create evidence-based care strategies" },
    { domain: "Take Actions", score: 88, description: "Implement appropriate nursing interventions" },
    { domain: "Evaluate Outcomes", score: 80, description: "Assess effectiveness of care and adjust as needed" }
  ];

  const nclexDomains = [
    { name: "Basic Care and Comfort", exercises: 12 },
    { name: "Pharmacological Therapies", exercises: 15 },
    { name: "Risk Reduction", exercises: 10 },
    { name: "Physiological Adaptation", exercises: 14 },
    { name: "Psychosocial Integrity", exercises: 8 },
    { name: "Safe Care Environment", exercises: 16 }
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Clinical Judgment</h1>
        <p className="text-muted-foreground mb-6">
          Master the NCSBN Clinical Judgment Measurement Model (NCJMM) through targeted practice and AI-powered feedback.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clinicalJudgmentMetrics.map((metric) => (
            <Card key={metric.domain}>
              <CardHeader>
                <CardTitle className="text-lg">{metric.domain}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{metric.description}</p>
                <Progress value={metric.score} className="h-2 mb-2" />
                <div className="flex justify-between text-sm">
                  <span>Proficiency</span>
                  <span>{metric.score}%</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 w-full"
                  onClick={() => handleAIHelp(metric.domain.toLowerCase(), `Explain key considerations for ${metric.domain} in clinical judgment`)}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Practice {metric.domain}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t">
        <h2 className="text-2xl font-semibold mb-4">Interactive Case Study</h2>
        <Button 
          onClick={handleGenerateCase}
          className="mb-6"
        >
          Generate New Case
        </Button>

        {currentCase && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{currentCase.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Patient Information</h3>
                  <p>{currentCase.description}</p>
                </div>
                {currentCase.initial_state.vital_signs && (
                  <div>
                    <h3 className="font-semibold mb-2">Vital Signs</h3>
                    <ul className="list-disc pl-4">
                      <li>BP: {currentCase.initial_state.vital_signs.blood_pressure}</li>
                      <li>HR: {currentCase.initial_state.vital_signs.heart_rate}</li>
                      <li>RR: {currentCase.initial_state.vital_signs.respiratory_rate}</li>
                      <li>Temp: {currentCase.initial_state.vital_signs.temperature}</li>
                      <li>O2 Sat: {currentCase.initial_state.vital_signs.oxygen_saturation}%</li>
                    </ul>
                  </div>
                )}
                
                {currentCase.expected_actions[caseStep] && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">What would you do next?</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {currentCase.expected_actions.map((action, index) => (
                        <Button
                          key={index}
                          variant={userChoices.includes(action.action) ? "secondary" : "outline"}
                          onClick={() => handleDecision(action.action)}
                          disabled={userChoices.includes(action.action)}
                          className="text-left"
                        >
                          {action.action}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {feedback && (
                  <Alert>
                    <AlertTitle>Feedback</AlertTitle>
                    <AlertDescription>{feedback}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-2xl font-semibold mb-4">NCLEX 2024 Domain Integration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nclexDomains.map((domain) => (
            <Card 
              key={domain.name}
              className={`cursor-pointer transition-all ${selectedDomain === domain.name ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedDomain(domain.name)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{domain.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {domain.exercises} practice exercises
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAIHelp('domain_practice', `Generate practice scenarios for ${domain.name}`);
                  }}
                >
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

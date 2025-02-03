import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Bot, Brain, FileCheck, Users, AlertTriangle, Lightbulb, Plus, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { AIHelpButton } from "@/components/ui/ai-help-button"; // Added import


export default function ClinicalJudgment() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [currentSection, setCurrentSection] = useState('overview'); // Added state for tab selection


  // Initialize speech recognition (from original code)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setQuestion(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: "Error",
          description: "Failed to record speech. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Error",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Helper function to format topic names (from original code)
  const formatTopicName = (topic: string): string => {
    return topic
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const aiHelpMutation = useMutation({
    mutationFn: async ({ topic, context, question }: { topic: string; context?: string; question?: string }) => {
      try {
        const response = await fetch("/api/chat/clinical-judgment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            topic, 
            context, 
            question,
            type: "clinical_judgment" 
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("AI Help Error Response:", errorData);
          throw new Error("Failed to get AI assistance");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error in AI help mutation:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to get AI assistance");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI assistance",
        variant: "destructive",
      });
    }
  });

  const handleAIHelp = async (topic: string, context?: string) => {
    setCurrentTopic(formatTopicName(topic));
    setIsDialogOpen(true);
    setAiContent(""); // Clear previous content

    try {
      const result = await aiHelpMutation.mutateAsync({ topic, context });
      setAiContent(result.content);
    } catch (error) {
      // Error is handled by mutation's onError
      setIsDialogOpen(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await aiHelpMutation.mutateAsync({ 
        topic: currentTopic.toLowerCase().replace(/\s+/g, '_'),
        question
      });
      setAiContent(result.content);
      setIsQuestionDialogOpen(false);
      setIsDialogOpen(true);
      setQuestion("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get an answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const QuestionDialog = () => (
    <Dialog 
      open={isQuestionDialogOpen} 
      onOpenChange={(open) => {
        setIsQuestionDialogOpen(open);
        if (!open) {
          setQuestion("");
          if (isListening) {
            recognition?.stop();
            setIsListening(false);
          }
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Ask About {currentTopic}
          </DialogTitle>
          <DialogDescription>
            Ask any specific questions about {currentTopic.toLowerCase()}. Our AI expert will provide detailed guidance.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={toggleListening}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button onClick={handleAskQuestion}>Ask</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const AIButtons = ({ topic, context }: { topic: string; context?: string }) => (
    <div className="flex gap-2">
      <AIHelpButton
        title="AI Learning Guide"
        description="Get personalized learning assistance"
        topic={topic}
        context={context}
      />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          setCurrentTopic(formatTopicName(topic));
          setIsQuestionDialogOpen(true);
        }}
      >
        <Bot className="h-4 w-4 mr-2" />
        Ask Question
      </Button>
    </div>
  );

  const handleScenarioGeneration = async (type: string) => {
  try {
    const result = await aiHelpMutation.mutateAsync({
      topic: "scenario_generation",
      context: type === "basic" ? "Generate a basic clinical scenario" : "Generate an advanced clinical scenario with multiple complications"
    });
    setAiContent(result.content);
    setIsDialogOpen(true);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to generate scenario. Please try again.",
      variant: "destructive",
    });
  }
};

const practiceScenarios = [
  {
    title: "Acute Care Assessment",
    type: "advanced",
    description: "Complex patient with multiple comorbidities requiring immediate intervention"
  },
  {
    title: "Medication Management",
    type: "basic",
    description: "Safe medication administration and monitoring"
  },
  {
    title: "Emergency Response",
    type: "advanced",
    description: "Rapid assessment and intervention in critical situations"
  },
  {
    title: "Patient Education",
    type: "basic",
    description: "Effective communication and teaching strategies"
  }
];


  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto px-4 py-8"> {/* Kept original max-width */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Clinical Judgment</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Develop advanced clinical reasoning and decision-making skills through evidence-based practice
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Framework</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Judgment Framework</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  Decision Making Process
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Clinical data interpretation</li>
                  <li>• Priority setting</li>
                  <li>• Intervention planning</li>
                  <li>• Outcome evaluation</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Critical Thinking Skills
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Pattern recognition</li>
                  <li>• Clinical reasoning</li>
                  <li>• Evidence analysis</li>
                  <li>• Decision validation</li>
                </ul>
              </Card>
            </CardContent>
          </Card>

          {/*Retained original Overview section content*/}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Completion</span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} className="h-2" />

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="py-4">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-primary" />
                          <CardTitle className="text-lg">Knowledge Areas</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0/4</p>
                        <p className="text-sm text-muted-foreground">Core competencies mastered</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="py-4">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-primary" />
                          <CardTitle className="text-lg">Cases Completed</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0/10</p>
                        <p className="text-sm text-muted-foreground">Practice scenarios solved</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <CardTitle className="text-lg">Performance</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">N/A</p>
                        <p className="text-sm text-muted-foreground">Average score on cases</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Key Focus Areas</CardTitle>
                    <AIButtons topic="focus_areas" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Recognition of Clinical Changes</h4>
                        <p className="text-sm text-muted-foreground">
                          Develop skills in identifying subtle changes in patient condition and understanding their significance
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Analysis of Complex Data</h4>
                        <p className="text-sm text-muted-foreground">
                          Learn to synthesize multiple data points to form accurate clinical judgments
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Prioritization Skills</h4>
                        <p className="text-sm text-muted-foreground">
                          Master the art of prioritizing care based on patient needs and clinical urgency
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Clinical Judgment Model</CardTitle>
                    <AIButtons topic="judgment_model" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Understanding the NCSBN Clinical Judgment Measurement Model (NCJMM) and its application in NCLEX-style questions
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">Recognize Cues</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">Analyze Cues</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">Prioritize Hypotheses</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">Generate Solutions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">Take Actions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">Evaluate Outcomes</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle>Practice Scenarios</CardTitle>
              <CardDescription>Apply clinical judgment in realistic patient cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {practiceScenarios.map((scenario, index) => (
                    <Card key={index} className="p-4">
                      <h3 className="font-semibold mb-2">{scenario.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                      <Button 
                        onClick={() => handleScenarioGeneration(scenario.type)} 
                        variant="outline"
                        className="w-full"
                      >
                        Start Scenario
                      </Button>
                    </Card>
                  ))}
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Assessment Tools</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button onClick={() => handleAIHelp("clinical_rubrics")}>
                      Clinical Judgment Rubrics
                    </Button>
                    <Button onClick={() => handleAIHelp("decision_trees")}>
                      Decision-Making Trees
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/*Retained original Practice Cases section content*/}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Practice Cases</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Apply your clinical judgment skills to realistic patient scenarios
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAIHelp("generate_case")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate New Case
                  </Button>
                  <AIButtons topic="case_analysis" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Practice cases will be dynamically loaded here */}
                <div className="text-center p-8 text-muted-foreground">
                  <p>Click "Generate New Case" to start practicing with realistic scenarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Competency Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Assessment Criteria</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Clinical reasoning process</li>
                    <li>• Evidence-based practice application</li>
                    <li>• Decision-making effectiveness</li>
                    <li>• Outcome evaluation skills</li>
                  </ul>
                </Card>
              </div>
            </CardContent>
          </Card>
          {/*Retained original Decision Making section content*/}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Clinical Decision Making</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Develop expert decision-making skills through structured learning and practice
                  </p>
                </div>
                <AIButtons topic="decision_making_overview" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Critical Thinking Framework</h3>
                    <AIButtons topic="critical_thinking" />
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>• Information gathering and analysis</li>
                    <li>• Pattern recognition and interpretation</li>
                    <li>• Evidence-based decision making</li>
                    <li>• Outcome prediction and risk assessment</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Priority Setting</h3>
                    <AIButtons topic="priority_setting" />
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>• ABC (Airway, Breathing, Circulation) approach</li>
                    <li>• Maslow's hierarchy in nursing</li>
                    <li>• Urgent vs. important matrix</li>
                    <li>• Multiple patient prioritization</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Risk Assessment</h3>
                    <AIButtons topic="risk_assessment" />
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>• Identifying potential complications</li>
                    <li>• Risk factor analysis</li>
                    <li>• Preventive measure implementation</li>
                    <li>• Documentation of risk factors</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Clinical Reasoning</h3>
                    <AIButtons topic="clinical_reasoning" />
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>• Hypothesis generation</li>
                    <li>• Clinical pattern recognition</li>
                    <li>• Evidence evaluation</li>
                    <li>• Decision validation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-4 right-4">
        <AIHelpButton
          title="Clinical Judgment Assistant"
          description="Get AI assistance with clinical judgment scenarios"
          topic="clinical_judgment"
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Clinical Judgment Assistant - {currentTopic}
            </DialogTitle>
            <DialogDescription>
              Receive personalized guidance to enhance your clinical judgment skills
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 space-y-4">
              {aiContent ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{aiContent}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Preparing your personalized guidance...
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <QuestionDialog />
    </div>
  );
}
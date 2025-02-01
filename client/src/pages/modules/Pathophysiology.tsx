import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Bot, Brain, FileCheck, Users, Mic, MicOff, Plus } from "lucide-react";
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

export default function Pathophysiology() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript;
          setQuestion(prev => prev + ' ' + transcript);
        }
      };

      recognition.onerror = (event) => {
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

  const aiHelpMutation = useMutation({
    mutationFn: async ({ topic, context, question }: { topic: string; context?: string; question?: string }) => {
      try {
        const response = await fetch("/api/ai-help", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, context, question }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI assistance");
        }

        const data = await response.json();
        if (!data || !data.content) {
          throw new Error("Invalid response format");
        }

        return data;
      } catch (error) {
        console.error("Error in AI help mutation:", error);
        throw error;
      }
    },
  });

  const handleAIHelp = async (topic: string, context?: string) => {
    setCurrentTopic(formatTopicName(topic));
    setIsDialogOpen(true);

    try {
      const result = await aiHelpMutation.mutateAsync({ topic, context });
      setAiContent(result.content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI assistance. Please try again.",
        variant: "destructive",
      });
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

  // Helper function to format topic names
  const formatTopicName = (topic: string): string => {
    return topic
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
      <Button variant="outline" size="sm" onClick={() => handleAIHelp(topic, context)}>
        <Bot className="h-4 w-4 mr-2" />
        AI Guide
      </Button>
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Pathophysiology</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master the complex interactions between disease processes and body systems through comprehensive study and analysis
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="systems">Body Systems</TabsTrigger>
          <TabsTrigger value="diseases">Disease Processes</TabsTrigger>
          <TabsTrigger value="cases">Case Studies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Course Progress</CardTitle>
                <AIButtons topic="course_overview" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="py-4">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">Systems Mastered</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/12</p>
                      <p className="text-sm text-muted-foreground">Major body systems covered</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="py-4">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">Cases Analyzed</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/30</p>
                      <p className="text-sm text-muted-foreground">Clinical cases completed</p>
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
                      <p className="text-sm text-muted-foreground">Average assessment score</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Learning Path</h3>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Foundation Knowledge</h4>
                        <AIButtons topic="foundation_concepts" />
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Cell biology and tissue organization</li>
                        <li>• Homeostatic mechanisms</li>
                        <li>• Basic genetic concepts</li>
                        <li>• Cellular adaptation mechanisms</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">System Integration</h4>
                        <AIButtons topic="system_integration" />
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• System interconnections</li>
                        <li>• Compensatory mechanisms</li>
                        <li>• Multi-system disorders</li>
                        <li>• Systemic manifestations</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Clinical Application</h4>
                        <AIButtons topic="clinical_application" />
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Disease progression analysis</li>
                        <li>• Diagnostic interpretation</li>
                        <li>• Treatment mechanism understanding</li>
                        <li>• Case-based learning</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="systems">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Body Systems Analysis</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Comprehensive study of major body systems and their pathophysiological alterations
                  </p>
                </div>
                <AIButtons topic="body_systems_overview" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cardiovascular System */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Cardiovascular System</h3>
                    <AIButtons topic="cardiovascular_pathophysiology" />
                  </div>
                  <div className="space-y-4">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Cardiac conduction disorders</li>
                      <li>• Vascular system pathologies</li>
                      <li>• Heart failure mechanisms</li>
                      <li>• Circulatory compensation</li>
                    </ul>
                  </div>
                </div>

                {/* Respiratory System */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Respiratory System</h3>
                    <AIButtons topic="respiratory_pathophysiology" />
                  </div>
                  <div className="space-y-4">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Ventilation-perfusion disorders</li>
                      <li>• Respiratory failure mechanisms</li>
                      <li>• Gas exchange abnormalities</li>
                      <li>• Pulmonary vascular diseases</li>
                    </ul>
                  </div>
                </div>

                {/* Nervous System */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Nervous System</h3>
                    <AIButtons topic="nervous_system_pathophysiology" />
                  </div>
                  <div className="space-y-4">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Neurological disorders</li>
                      <li>• Neurotransmitter imbalances</li>
                      <li>• Brain injury mechanisms</li>
                      <li>• Spinal cord pathologies</li>
                    </ul>
                  </div>
                </div>

                {/* Endocrine System */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Endocrine System</h3>
                    <AIButtons topic="endocrine_system_pathophysiology" />
                  </div>
                  <div className="space-y-4">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Hormonal regulation disorders</li>
                      <li>• Diabetes pathophysiology</li>
                      <li>• Thyroid dysfunction</li>
                      <li>• Adrenal disorders</li>
                    </ul>
                  </div>
                </div>

                {/* Immune System */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Immune System</h3>
                    <AIButtons topic="immune_system_pathophysiology" />
                  </div>
                  <div className="space-y-4">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Autoimmune disorders</li>
                      <li>• Immunodeficiency states</li>
                      <li>• Inflammatory responses</li>
                      <li>• Hypersensitivity reactions</li>
                    </ul>
                  </div>
                </div>

                {/* Gastrointestinal System */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Gastrointestinal System</h3>
                    <AIButtons topic="gastrointestinal_pathophysiology" />
                  </div>
                  <div className="space-y-4">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Digestive disorders</li>
                      <li>• Hepatobiliary dysfunction</li>
                      <li>• Pancreatic disorders</li>
                      <li>• GI inflammatory conditions</li>
                    </ul>
                  </div>
                </div>

                {/* Renal System */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Renal System</h3>
                    <AIButtons topic="renal_system_pathophysiology" />
                  </div>
                  <div className="space-y-4">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Acute kidney injury</li>
                      <li>• Chronic kidney disease</li>
                      <li>• Fluid & electrolyte disorders</li>
                      <li>• Glomerular disorders</li>
                    </ul>
                  </div>
                </div>

                {/* Musculoskeletal System */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Musculoskeletal System</h3>
                    <AIButtons topic="musculoskeletal_pathophysiology" />
                  </div>
                  <div className="space-y-4">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Bone disorders</li>
                      <li>• Joint pathologies</li>
                      <li>• Muscle diseases</li>
                      <li>• Connective tissue disorders</li>
                    </ul>
                  </div>
                </div>

                {/* Reproductive System */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Reproductive System</h3>
                    <AIButtons topic="reproductive_pathophysiology" />
                  </div>
                  <div className="space-y-4">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li>• Hormonal disorders</li>
                      <li>• Reproductive tract pathologies</li>
                      <li>• Pregnancy complications</li>
                      <li>• Genetic disorders</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diseases">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Disease Processes</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Analysis of disease mechanisms, progression, and systemic effects
                  </p>
                </div>
                <AIButtons topic="disease_processes_overview" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Inflammatory Processes */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Inflammatory Processes</h3>
                    <AIButtons topic="inflammatory_processes" />
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>• Acute vs. chronic inflammation</li>
                    <li>• Inflammatory mediators</li>
                    <li>• Systemic inflammatory response</li>
                    <li>• Resolution and repair</li>
                  </ul>
                </div>

                {/* Immune Responses */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Immune Responses</h3>
                    <AIButtons topic="immune_responses" />
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>• Autoimmune mechanisms</li>
                    <li>• Immunodeficiency disorders</li>
                    <li>• Hypersensitivity reactions</li>
                    <li>• Immune system regulation</li>
                  </ul>
                </div>

                {/* Neoplastic Processes */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Neoplastic Processes</h3>
                    <AIButtons topic="neoplastic_processes" />
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>• Cancer development</li>
                    <li>• Metastatic mechanisms</li>
                    <li>• Tumor microenvironment</li>
                    <li>• Cancer metabolism</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Case Studies</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Apply pathophysiological concepts to real clinical scenarios
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAIHelp("generate_case_study")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate New Case
                  </Button>
                  <AIButtons topic="case_analysis" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Case studies will be dynamically loaded here */}
                <div className="text-center p-8 text-muted-foreground">
                  <p>Click "Generate New Case" to start analyzing clinical scenarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Pathophysiology Assistant - {currentTopic}
            </DialogTitle>
            <DialogDescription>
              Receive detailed explanations and insights about pathophysiological concepts
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
                  Preparing your personalized explanation...
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
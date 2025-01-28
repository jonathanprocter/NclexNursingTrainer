import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Bot, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ClinicalAnalysis() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [currentSection, setCurrentSection] = useState("");

  const aiHelpMutation = useMutation({
    mutationFn: async ({ section, context }: { section: string; context?: string }) => {
      const response = await fetch("/api/ai-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, context }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI help");
      }

      return response.json();
    },
  });

  const handleAIHelp = async (section: string, context?: string) => {
    setCurrentSection(section);
    setIsDialogOpen(true);

    try {
      const result = await aiHelpMutation.mutateAsync({ section, context });
      setAiContent(result.content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI assistance. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Clinical Analysis</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master the art of clinical reasoning through systematic analysis of patient data, pattern recognition, and hypothesis formation
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          <TabsTrigger value="clinical-reasoning">Clinical Reasoning</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Learning Path Overview</CardTitle>
              <p className="text-muted-foreground mt-2">
                Develop advanced clinical reasoning skills through structured learning modules that progress from basic pattern recognition to complex case analysis.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Pattern Recognition</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Learn to identify and interpret clinical patterns through systematic analysis of patient data.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("pattern_recognition")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Vital Sign Patterns
                        <p className="ml-6 mt-1">
                          Identify significant changes and trends in vital signs that indicate clinical deterioration or improvement.
                        </p>
                      </li>
                      <li>Laboratory Data Analysis
                        <p className="ml-6 mt-1">
                          Interpret laboratory results in context with clinical presentation and patient history.
                        </p>
                      </li>
                      <li>Symptom Clustering
                        <p className="ml-6 mt-1">
                          Group related symptoms to identify potential underlying conditions and syndromes.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Clinical Reasoning</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Develop structured approaches to clinical problem-solving and decision-making.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("clinical_reasoning")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Hypothesis Generation
                      <p className="ml-6 mt-1">
                        Formulate and test clinical hypotheses based on available data and evidence.
                      </p>
                    </li>
                    <li>Differential Diagnosis
                      <p className="ml-6 mt-1">
                        Develop and refine differential diagnoses through systematic evaluation of clinical evidence.
                      </p>
                    </li>
                    <li>Clinical Decision Making
                      <p className="ml-6 mt-1">
                        Apply evidence-based decision-making frameworks to complex clinical scenarios.
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Advanced Analysis</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Master complex clinical analysis through integration of multiple data sources.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("advanced_analysis")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Multisystem Assessment
                      <p className="ml-6 mt-1">
                        Evaluate complex interactions between multiple body systems and their clinical implications.
                      </p>
                    </li>
                    <li>Risk Stratification
                      <p className="ml-6 mt-1">
                        Apply risk assessment tools and clinical judgment to prioritize patient care needs.
                      </p>
                    </li>
                    <li>Outcome Prediction
                      <p className="ml-6 mt-1">
                        Use clinical data and evidence-based tools to predict and improve patient outcomes.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="case-studies">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Case Studies</CardTitle>
              <p className="text-muted-foreground mt-2">
                Apply clinical reasoning skills to real-world scenarios through interactive case studies.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Coming soon content will be replaced with actual case studies */}
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Interactive Cases Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Practice your clinical analysis skills with our comprehensive case library, featuring:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                    <li>Real-world patient scenarios</li>
                    <li>Progressive complexity levels</li>
                    <li>Immediate feedback and guidance</li>
                    <li>AI-powered learning support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical-reasoning">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Reasoning Frameworks</CardTitle>
              <p className="text-muted-foreground mt-2">
                Learn and apply systematic approaches to clinical reasoning and decision-making.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Reasoning Models</h3>
                      <p className="text-muted-foreground mt-1">
                        Explore different approaches to clinical reasoning and decision-making.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("reasoning_models")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Content for this section is under development. Check back soon for:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      <li>Hypothesis-driven reasoning</li>
                      <li>Pattern recognition approaches</li>
                      <li>Evidence-based frameworks</li>
                      <li>Decision analysis tools</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle>Practice Exercises</CardTitle>
              <p className="text-muted-foreground mt-2">
                Strengthen your clinical analysis skills through targeted practice exercises.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Practice Modules Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Interactive exercises designed to enhance your clinical reasoning skills:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
                    <li>Pattern recognition exercises</li>
                    <li>Hypothesis testing scenarios</li>
                    <li>Decision-making simulations</li>
                    <li>Clinical documentation practice</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentSection}</DialogTitle>
            <DialogDescription>
              AI-powered learning assistance
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-4">
              {aiContent ? (
                <div className="prose prose-sm">
                  <div dangerouslySetInnerHTML={{ __html: aiContent }} />
                </div>
              ) : (
                <p className="text-muted-foreground">Loading content...</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
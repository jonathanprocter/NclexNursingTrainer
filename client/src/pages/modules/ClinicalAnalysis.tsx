import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { Brain, FileCheck, AlertTriangle, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ClinicalAnalysis() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCaseContent, setCurrentCaseContent] = useState("");

  const handleGenerateCase = async () => {
    setIsDialogOpen(true);
    try {
      const response = await fetch("/api/chat/clinical-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "clinical_analysis",
          type: "case_generation"
        }),
      });
      const data = await response.json();
      setCurrentCaseContent(data.content);
    } catch (error) {
      console.error("Error generating case:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Clinical Analysis</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Develop advanced clinical analysis skills through systematic patient assessment
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-primary" />
            Clinical Decision Making
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Systematic assessment approaches</li>
            <li>• Evidence-based practice integration</li>
            <li>• Priority setting frameworks</li>
            <li>• Risk-benefit analysis</li>
          </ul>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => handleGenerateCase("decision_making")}>
            Practice Cases
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <FileCheck className="h-5 w-5 mr-2 text-primary" />
            Diagnostic Reasoning
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Pattern recognition</li>
            <li>• Clinical manifestations analysis</li>
            <li>• Differential diagnosis development</li>
            <li>• Lab data interpretation</li>
          </ul>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => handleGenerateCase("diagnostic_reasoning")}>
            Analyze Cases
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Patient Assessment
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Comprehensive health assessment</li>
            <li>• Systems-based evaluation</li>
            <li>• Documentation standards</li>
            <li>• Care planning integration</li>
          </ul>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => handleGenerateCase("patient_assessment")}>
            Practice Assessment
          </Button>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Data Analysis</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Lab result interpretation</li>
            <li>• Vital signs trending</li>
            <li>• Diagnostic test analysis</li>
            <li>• Clinical data patterns</li>
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Clinical Assessment</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Systematic evaluation</li>
            <li>• Symptom analysis</li>
            <li>• Physical findings</li>
            <li>• Health history</li>
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Decision Making</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Evidence analysis</li>
            <li>• Risk assessment</li>
            <li>• Care prioritization</li>
            <li>• Intervention planning</li>
          </ul>
        </Card>
      </div>

      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cases">Case Studies</TabsTrigger>
          <TabsTrigger value="practice">Practice Analysis</TabsTrigger>
          <TabsTrigger value="skills">Analytical Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Clinical Case Analysis</CardTitle>
                <Button onClick={handleGenerateCase}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Case
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    title: "Complex Patient Assessment",
                    description: "Analyze multiple comorbidities and develop care plans",
                    icon: Brain
                  },
                  {
                    title: "Lab Data Interpretation",
                    description: "Evaluate laboratory results and identify abnormalities",
                    icon: FileCheck
                  },
                  {
                    title: "Risk Factor Analysis",
                    description: "Identify and assess potential complications",
                    icon: AlertTriangle
                  }
                ].map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Practice Scenarios</CardTitle>
                <AIHelpButton
                  title="Analysis Practice"
                  description="Get AI assistance with clinical analysis practice"
                  topic="clinical_analysis_practice"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Practice your analytical skills with realistic clinical scenarios
                </p>
                <div className="grid gap-4">
                  {[
                    "Vital Signs Interpretation",
                    "Lab Results Analysis",
                    "Diagnostic Test Evaluation",
                    "Risk Assessment Practice"
                  ].map((item, index) => (
                    <Button key={index} variant="outline" className="justify-start">
                      <FileCheck className="h-4 w-4 mr-2" />
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Analytical Skills Development</CardTitle>
                <AIHelpButton
                  title="Skills Development"
                  description="Get guidance on developing analytical skills"
                  topic="analytical_skills"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Pattern Recognition",
                      description: "Learn to identify clinical patterns and correlations"
                    },
                    {
                      title: "Critical Thinking",
                      description: "Develop systematic analytical approaches"
                    },
                    {
                      title: "Data Integration",
                      description: "Combine multiple data sources for analysis"
                    },
                    {
                      title: "Decision Making",
                      description: "Practice evidence-based decision making"
                    }
                  ].map((skill, index) => (
                    <Card key={index} className="p-4">
                      <h3 className="font-semibold mb-2">{skill.title}</h3>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Clinical Case Analysis</DialogTitle>
            <DialogDescription>
              Analyze the following case and develop your clinical reasoning
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 space-y-4">
              {currentCaseContent || (
                <p className="text-center text-muted-foreground">
                  Generating clinical case...
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
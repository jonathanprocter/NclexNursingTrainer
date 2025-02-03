import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { Brain, FileCheck, AlertTriangle, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ClinicalAnalysis() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCaseContent, setCurrentCaseContent] = useState("");
  const cases = [
    {
      id: 1,
      title: "Complex Patient Assessment",
      description: "Analyze multiple comorbidities and develop care plans"
    },
    {
      id: 2,
      title: "Lab Data Interpretation",
      description: "Evaluate laboratory results and identify abnormalities"
    },
    {
      id: 3,
      title: "Risk Factor Analysis",
      description: "Identify and assess potential complications"
    }
  ];


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

  const handleCaseAnalysis = (caseId) => {
    //Implementation for handling case analysis
    console.log("Analyzing case:", caseId);
  };

  const handleGenerateScenario = (scenarioType) => {
    //Implementation for generating scenarios
    console.log("Generating", scenarioType, "scenario");
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Clinical Analysis</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Develop advanced clinical analysis skills through systematic assessment and evidence-based practice
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Case Studies</TabsTrigger>
          <TabsTrigger value="practice">Practice Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Analysis Framework</CardTitle>
              <CardDescription>
                Master the systematic approach to clinical analysis through evidence-based methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Assessment Skills</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Systematic data collection</li>
                    <li>• Clinical pattern recognition</li>
                    <li>• Critical finding identification</li>
                    <li>• Priority determination</li>
                  </ul>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Clinical Reasoning</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Evidence interpretation</li>
                    <li>• Clinical decision making</li>
                    <li>• Outcome evaluation</li>
                    <li>• Care plan development</li>
                  </ul>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases">
          <div className="grid gap-4">
            {cases.map((caseStudy, index) => (
              <Card key={index} className="p-4">
                <CardHeader>
                  <CardTitle>{caseStudy.title}</CardTitle>
                  <CardDescription>{caseStudy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleCaseAnalysis(caseStudy.id)}>
                    Analyze Case
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle>Practice Scenarios</CardTitle>
              <CardDescription>
                Apply clinical analysis skills to real-world scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => handleGenerateScenario('basic')}>
                  Generate Basic Scenario
                </Button>
                <Button onClick={() => handleGenerateScenario('advanced')} className="ml-4">
                  Generate Advanced Scenario
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-3 mt-8">
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
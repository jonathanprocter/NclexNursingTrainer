import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Pharmacology() {
  const { toast } = useToast();

  const handleAIHelp = (section: string) => {
    toast({
      title: "AI Assistant",
      description: `Getting additional help for ${section}...`,
    });
    // AI help integration will be implemented here
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Pharmacology & Parenteral</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master drug classifications, mechanisms of action, and nursing implications
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="calculations">Calculations</TabsTrigger>
          <TabsTrigger value="administration">Administration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
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
                    <CardHeader>
                      <CardTitle className="text-lg">Topics Covered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/12</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Practice Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/50</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Time Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0h</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Learning Objectives</h3>
                  <div className="grid gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Knowledge</h4>
                        <Button variant="outline" size="sm" onClick={() => handleAIHelp("knowledge_objectives")}>
                          <Bot className="h-4 w-4 mr-2" />
                          AI Help
                        </Button>
                      </div>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Understand drug classifications and their clinical implications</li>
                        <li>Master pharmacokinetics and pharmacodynamics principles</li>
                        <li>Comprehend medication safety protocols and guidelines</li>
                        <li>Know drug interactions and contraindications</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Skills</h4>
                        <Button variant="outline" size="sm" onClick={() => handleAIHelp("skills_objectives")}>
                          <Bot className="h-4 w-4 mr-2" />
                          AI Help
                        </Button>
                      </div>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Perform accurate drug calculations</li>
                        <li>Demonstrate proper medication administration techniques</li>
                        <li>Apply critical thinking in medication management</li>
                        <li>Execute proper documentation procedures</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Awareness</h4>
                        <Button variant="outline" size="sm" onClick={() => handleAIHelp("awareness_objectives")}>
                          <Bot className="h-4 w-4 mr-2" />
                          AI Help
                        </Button>
                      </div>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Recognize high-alert medications and special precautions</li>
                        <li>Identify potential medication errors and prevention strategies</li>
                        <li>Understand cultural considerations in medication therapy</li>
                        <li>Stay current with medication safety updates and guidelines</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medication Overview</CardTitle>
              <Button variant="outline" size="icon" onClick={() => handleAIHelp("medications_overview")}>
                <Bot className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <section>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Drug Classifications</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("drug_classifications")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Antimicrobials</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Antibiotics: penicillins, cephalosporins, macrolides</li>
                        <li>Antifungals: azoles, polyenes</li>
                        <li>Antivirals: nucleoside analogs, protease inhibitors</li>
                        <li>Clinical implications and resistance patterns</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Cardiovascular Medications</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Antihypertensives: ACE inhibitors, beta blockers, calcium channel blockers</li>
                        <li>Anticoagulants: heparins, direct oral anticoagulants</li>
                        <li>Antiarrhythmics: sodium channel blockers, potassium channel blockers</li>
                        <li>Heart failure medications: diuretics, inotropes</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Pain Management</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Opioids: morphine, fentanyl, hydromorphone</li>
                        <li>NSAIDs: mechanisms, contraindications</li>
                        <li>Adjuvant analgesics: gabapentinoids, antidepressants</li>
                        <li>Pain assessment and documentation requirements</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Mechanisms of Action</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("mechanisms_of_action")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Pharmacodynamics</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Receptor types and drug-receptor interactions</li>
                        <li>Agonist and antagonist mechanisms</li>
                        <li>Dose-response relationships</li>
                        <li>Therapeutic index and safety margins</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Pharmacokinetics</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Absorption factors and bioavailability</li>
                        <li>Distribution and protein binding</li>
                        <li>Metabolism pathways and drug interactions</li>
                        <li>Elimination routes and half-life considerations</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Drug Calculations</CardTitle>
              <Button variant="outline" size="icon" onClick={() => handleAIHelp("calculations_overview")}>
                <Bot className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <section>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Basic Calculations</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("basic_calculations")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Tablet and Capsule Calculations</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Converting between units (mg, g, mcg)</li>
                        <li>Calculating doses from available strengths</li>
                        <li>Multiple tablet calculations</li>
                        <li>Practice problems with solutions</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Weight-Based Dosing</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>mg/kg calculations</li>
                        <li>Body Surface Area (BSA) calculations</li>
                        <li>Pediatric dosing considerations</li>
                        <li>Maximum/minimum dose limits</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">IV Calculations</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("iv_calculations")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Flow Rates</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>mL/hr calculations</li>
                        <li>Drops per minute conversion</li>
                        <li>Weight-based IV rates</li>
                        <li>Critical care drip rates</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Complex IV Calculations</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Multiple medication infusions</li>
                        <li>Concentration calculations</li>
                        <li>Time duration calculations</li>
                        <li>Practice scenarios with rationales</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="administration">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medication Administration</CardTitle>
              <Button variant="outline" size="icon" onClick={() => handleAIHelp("administration_overview")}>
                <Bot className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <section>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Administration Routes</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("administration_routes")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Oral Administration</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Proper techniques for different formulations</li>
                        <li>Crushing and splitting guidelines</li>
                        <li>Enteral tube administration</li>
                        <li>Common errors and prevention</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Parenteral Administration</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Subcutaneous injection techniques</li>
                        <li>Intramuscular injection sites and methods</li>
                        <li>IV push medication guidelines</li>
                        <li>Central line medication administration</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Safety Guidelines</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("safety_guidelines")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">The Rights of Medication Administration</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Right patient verification methods</li>
                        <li>Right medication and dose verification</li>
                        <li>Right time and frequency considerations</li>
                        <li>Right route and documentation requirements</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Error Prevention</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>High-alert medication precautions</li>
                        <li>Double-check requirements</li>
                        <li>Environmental considerations</li>
                        <li>Technology use in medication safety</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
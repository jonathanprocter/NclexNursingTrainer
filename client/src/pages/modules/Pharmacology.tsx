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
                        <li>Receptor types and drug-receptor interactions
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>G-protein coupled receptors</li>
                            <li>Ion channels and transporters</li>
                            <li>Nuclear receptors</li>
                            <li>Enzyme-linked receptors</li>
                          </ul>
                        </li>
                        <li>Agonist and antagonist mechanisms
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Full vs. partial agonists</li>
                            <li>Competitive vs. non-competitive antagonists</li>
                            <li>Inverse agonists</li>
                            <li>Allosteric modulators</li>
                          </ul>
                        </li>
                        <li>Dose-response relationships
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>ED50 and LD50 concepts</li>
                            <li>Therapeutic window determination</li>
                            <li>Potency vs. efficacy</li>
                            <li>Concentration-effect curves</li>
                          </ul>
                        </li>
                        <li>Signal transduction pathways
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Second messenger systems</li>
                            <li>Cellular response mechanisms</li>
                            <li>Receptor regulation and desensitization</li>
                            <li>Cross-talk between pathways</li>
                          </ul>
                        </li>
                      </ul>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => handleAIHelp("pharmacodynamics_details")}>
                        <Bot className="h-4 w-4 mr-2" />
                        Get Detailed Examples
                      </Button>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Pharmacokinetics (ADME)</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Absorption
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Passive diffusion mechanisms
                              <ul className="list-disc list-inside ml-4">
                                <li>pH-dependent ionization</li>
                                <li>Lipid solubility factors</li>
                                <li>Surface area effects</li>
                              </ul>
                            </li>
                            <li>Active transport systems
                              <ul className="list-disc list-inside ml-4">
                                <li>P-glycoprotein role</li>
                                <li>Carrier-mediated transport</li>
                                <li>Ion channels</li>
                              </ul>
                            </li>
                            <li>Bioavailability factors
                              <ul className="list-disc list-inside ml-4">
                                <li>First-pass metabolism</li>
                                <li>Food effects</li>
                                <li>Drug formulation impact</li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                        <li>Distribution
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Plasma protein binding
                              <ul className="list-disc list-inside ml-4">
                                <li>Albumin interactions</li>
                                <li>Alpha-1 acid glycoprotein</li>
                                <li>Binding competition</li>
                              </ul>
                            </li>
                            <li>Tissue distribution patterns
                              <ul className="list-disc list-inside ml-4">
                                <li>Blood-brain barrier</li>
                                <li>Placental transfer</li>
                                <li>Fat solubility effects</li>
                              </ul>
                            </li>
                            <li>Volume of distribution
                              <ul className="list-disc list-inside ml-4">
                                <li>Clinical significance</li>
                                <li>Calculation methods</li>
                                <li>Impact on dosing</li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                        <li>Metabolism
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Phase I reactions
                              <ul className="list-disc list-inside ml-4">
                                <li>Cytochrome P450 system</li>
                                <li>Oxidation processes</li>
                                <li>Reduction mechanisms</li>
                              </ul>
                            </li>
                            <li>Phase II reactions
                              <ul className="list-disc list-inside ml-4">
                                <li>Conjugation types</li>
                                <li>Glucuronidation</li>
                                <li>Sulfation pathways</li>
                              </ul>
                            </li>
                            <li>Metabolic interactions
                              <ul className="list-disc list-inside ml-4">
                                <li>Enzyme induction</li>
                                <li>Enzyme inhibition</li>
                                <li>Genetic polymorphisms</li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                        <li>Excretion
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Renal elimination
                              <ul className="list-disc list-inside ml-4">
                                <li>Glomerular filtration</li>
                                <li>Tubular secretion</li>
                                <li>Reabsorption factors</li>
                              </ul>
                            </li>
                            <li>Biliary excretion
                              <ul className="list-disc list-inside ml-4">
                                <li>Enterohepatic circulation</li>
                                <li>Conjugate elimination</li>
                                <li>Transport proteins</li>
                              </ul>
                            </li>
                            <li>Other routes
                              <ul className="list-disc list-inside ml-4">
                                <li>Pulmonary excretion</li>
                                <li>Sweat and saliva</li>
                                <li>Breast milk transfer</li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                      </ul>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => handleAIHelp("pharmacokinetics_case_studies")}>
                        <Bot className="h-4 w-4 mr-2" />
                        Explore Clinical Cases
                      </Button>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Clinical Applications</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Therapeutic Drug Monitoring
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Peak and trough levels</li>
                            <li>Steady-state concepts</li>
                            <li>Loading dose calculations</li>
                            <li>Maintenance dose adjustments</li>
                          </ul>
                        </li>
                        <li>Special Populations
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Pediatric considerations</li>
                            <li>Geriatric adaptations</li>
                            <li>Pregnancy categories</li>
                            <li>Organ dysfunction impact</li>
                          </ul>
                        </li>
                      </ul>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => handleAIHelp("clinical_applications")}>
                        <Bot className="h-4 w-4 mr-2" />
                        Practice Scenarios
                      </Button>
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
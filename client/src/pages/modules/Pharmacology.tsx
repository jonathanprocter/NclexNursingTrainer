import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPharmacokineticsCaseStudy } from "@/lib/ai-services";
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

// Helper function to format section names for display
const formatSectionName = (section: string): string => {
  return section
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to format AI response content
const formatAIContent = (content: string): string => {
  // Remove LaTeX formatting
  content = content
    .replace(/\\\[|\\\]/g, '')                  // Remove LaTeX block markers
    .replace(/\\text{([^}]+)}/g, '$1')          // Convert \text{} to plain text
    .replace(/\\frac{([^}]+)}{([^}]+)}/g, '$1/$2') // Convert fractions to plain text
    .replace(/\\cdot/g, '*')                    // Convert multiplication dots
    .replace(/\s*=\s*/g, ' = ')                // Standardize equals signs
    // Remove other mathematical formatting
    .replace(/#{1,6}\s/g, '')                  // Remove heading markers
    .replace(/\*\*/g, '')                      // Remove bold markers
    .replace(/\*/g, '')                        // Remove italic markers
    .replace(/`/g, '')                         // Remove code markers
    .replace(/\\[a-zA-Z]+/g, '')               // Remove other LaTeX commands
    .replace(/\n{3,}/g, '\n\n')                // Normalize multiple newlines
    .trim();

  // Convert bullet points to clearer format
  content = content.split('\n').map(line => {
    if (line.trim().startsWith('- ')) {
      return '• ' + line.trim().substring(2);
    }
    return line;
  }).join('\n');

  return content;
};

// Helper function to handle content export
const exportContent = (title: string, content: string) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = `${title.toLowerCase().replace(/\s+/g, '_')}_notes.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const AIHelpButton = ({ title, description, topic, context }: { title: string; description: string; topic: string; context?: string }) => {
  const { toast } = useToast();
  const aiHelpMutation = useMutation({
    mutationFn: async ({ section, context }: { section: string; context?: string }) => {
      const response = await fetch("/api/pharmacology-help", {
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

  const handleClick = async () => {
    try {
      const result = await aiHelpMutation.mutateAsync({ section: topic, context });
      // Handle the AI response here (e.g., display it in a modal)
      console.log("AI response:", result); // Replace with your modal logic
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI assistance. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <Bot className="h-4 w-4 mr-2" />
      {title}
    </Button>
  );
};


export default function Pharmacology() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [currentSection, setCurrentSection] = useState("");

  const aiHelpMutation = useMutation({
    mutationFn: async ({ section, context }: { section: string; context?: string }) => {
      const response = await fetch("/api/pharmacology-help", {
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
    setCurrentSection(formatSectionName(section));
    setIsDialogOpen(true);

    // Create a detailed context based on the section
    const sectionContexts: { [key: string]: string } = {
      'medications_overview': 'Explain drug classifications, clinical implications, and therapeutic effects for common medications',
      'complex_drug_classifications': 'Provide details about antimicrobials, cardiovascular medications, and pain management medications',
      'mechanisms_of_action': 'Explain pharmacodynamics, pharmacokinetics (ADME), and clinical applications',
      'pharmacodynamics_details': 'Detail receptor types, drug-receptor interactions, and dose-response relationships',
      'pharmacokinetics_case_studies': 'Provide clinical cases involving drug absorption, distribution, metabolism, and excretion',
      'clinical_applications': 'Explain therapeutic drug monitoring, special populations considerations, and clinical decision-making',
      'administration_routes': 'Detail oral, parenteral, and other medication administration routes with safety considerations',
      'safety_guidelines': 'Explain medication administration rights and error prevention strategies'
    };

    const enhancedContext = context || sectionContexts[section] || '';

    try {
      const result = await aiHelpMutation.mutateAsync({ 
        section,
        context: enhancedContext,
        topic: 'pharmacology'
      });
      setAiContent(formatAIContent(result.content));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI assistance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (aiContent) {
      exportContent(currentSection, aiContent);
      toast({
        title: "Success",
        description: "Content exported successfully!",
        duration: 3000,
      });
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Pharmacology & Parenteral</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master drug classifications, mechanisms of action, and nursing implications through comprehensive study of pharmacological principles and clinical applications.
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
              <CardTitle>Learning Path Overview</CardTitle>
              <p className="text-muted-foreground mt-2">
                This module is designed to build your understanding progressively, from foundational concepts to complex clinical applications. Each section includes interactive elements and real-world scenarios to reinforce your learning.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Knowledge Development</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Build a strong foundation in pharmacological principles through structured learning objectives and comprehensive understanding of drug mechanisms.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAIHelp("pharmacology_knowledge", "Explain medication classifications, drug mechanisms of action, pharmacokinetics, drug interactions, and therapeutic monitoring in pharmacy practice")}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Core Understanding</h4>
                      <p className="text-muted-foreground mb-2">
                        Master these fundamental concepts that form the basis of safe medication administration:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Drug Classifications and Clinical Implications
                          <p className="ml-6 mt-1">
                            Learn to categorize medications based on their therapeutic effects, understanding how different drug classes interact with body systems.
                          </p>
                        </li>
                        <li>Pharmacokinetics & Pharmacodynamics
                          <p className="ml-6 mt-1">
                            Understand how drugs move through and affect the body, including absorption, distribution, metabolism, and excretion processes.
                          </p>
                        </li>
                        <li>Safety Protocols and Guidelines
                          <p className="ml-6 mt-1">
                            Master essential safety measures, including proper medication verification, documentation, and error prevention strategies.
                          </p>
                        </li>
                        <li>Drug Interactions and Contraindications
                          <p className="ml-6 mt-1">
                            Develop expertise in identifying potential drug interactions and understanding when medications should not be administered.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Skills Application</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Develop practical skills essential for safe and effective medication administration through hands-on practice and scenario-based learning.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAIHelp("medication_skills", "Explain medication preparation, administration routes, dosage calculations, and medication safety protocols in pharmacy practice")}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Clinical Competencies</h4>
                      <p className="text-muted-foreground mb-2">
                        Master these essential skills through progressive practice scenarios:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Medication Calculations
                          <p className="ml-6 mt-1">
                            Practice complex calculations including weight-based dosing, IV drip rates, and unit conversions using real-world scenarios.
                          </p>
                        </li>
                        <li>Administration Techniques
                          <p className="ml-6 mt-1">
                            Master various administration routes including oral, parenteral, and specialized delivery methods, understanding the nuances of each.
                          </p>
                        </li>
                        <li>Critical Thinking in Medication Management
                          <p className="ml-6 mt-1">
                            Develop decision-making skills through case studies that challenge you to apply pharmacological knowledge in complex clinical situations.
                          </p>
                        </li>
                        <li>Documentation and Communication
                          <p className="ml-6 mt-1">
                            Learn proper documentation techniques and effective communication strategies with healthcare team members regarding medication therapy.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Clinical Awareness</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Develop advanced clinical judgment and situation awareness needed for complex medication management scenarios.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAIHelp("pharmacology_clinical", "Explain medication interactions, adverse reactions, contraindications, and pharmacological monitoring in drug therapy")}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Safety and Risk Management</h4>
                      <p className="text-muted-foreground mb-2">
                        Develop advanced awareness of medication safety considerations:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>High-Alert Medications
                          <p className="ml-6 mt-1">
                            Understand special precautions for medications that carry heightened risk, including insulin, anticoagulants, and concentrated electrolytes.
                          </p>
                        </li>
                        <li>Error Prevention Strategies
                          <p className="ml-6 mt-1">
                            Learn to identify potential medication errors before they occur and implement preventive measures in high-risk situations.
                          </p>
                        </li>
                        <li>Cultural Considerations
                          <p className="ml-6 mt-1">
                            Understand how cultural factors influence medication therapy, including dietary restrictions, beliefs about medicine, and communication preferences.
                          </p>
                        </li>
                        <li>Current Guidelines
                          <p className="ml-6 mt-1">
                            Stay informed about the latest medication safety updates, including new medications, black box warnings, and practice guidelines.
                          </p>
                        </li>
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
              <div>
                <CardTitle>Medication Overview</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Master drug classifications and their clinical implications through comprehensive study of commonly tested medications, including those frequently featured in next-generation NCLEX examinations.
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={() => handleAIHelp("medications_overview")}>
                <Bot className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <section>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Complex Drug Classifications</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Focus on medications that require careful consideration of multiple factors, including timing, monitoring, and patient-specific considerations.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("complex_drug_classifications")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">High-Risk Antimicrobials</h4>
                      <p className="text-muted-foreground mb-2">
                        Understanding complex antimicrobial therapy requires knowledge of resistance patterns, monitoring parameters, and potential adverse effects:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Advanced Antibiotics
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Vancomycin: therapeutic monitoring, nephrotoxicity risks</li>
                            <li>Carbapenems: spectrum of activity, seizure precautions</li>
                            <li>Aminoglycosides: ototoxicity monitoring, peak/trough levels</li>
                          </ul>
                        </li>
                        <li>Antifungal Considerations
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Azoles: drug interactions, hepatic monitoring</li>
                            <li>Echinocandins: cost considerations, resistance patterns</li>
                            <li>Amphotericin B: infusion reactions, electrolyte monitoring</li>
                          </ul>
                        </li>
                        <li>Complex Antivirals
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>HIV medications: adherence importance, resistance development</li>
                            <li>Hepatitis treatments: viral load monitoring, duration concerns</li>
                            <li>Neuraminidase inhibitors: timing of administration, resistance</li>
                          </ul>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Critical Cardiovascular Medications</h4>
                      <p className="text-muted-foreground mb-2">
                        Managing cardiovascular medications requires understanding of complex pathophysiology and careful monitoring:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Advanced Antihypertensives
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>ACE inhibitors/ARBs: renal function monitoring, angioedema risks</li>
                            <li>Beta blockers: heart rate/blood pressure targets, withdrawal risks</li>
                            <li>Calcium channel blockers: gingival hyperplasia, interaction with statins</li>
                          </ul>
                        </li>
                        <li>Anticoagulation Therapy
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Direct oral anticoagulants: reversal agents, bridging therapy</li>
                            <li>Heparin protocols: weight-based dosing, monitoring parameters</li>
                            <li>Antithrombotic combinations: bleeding risk assessment</li>
                          </ul>
                        </li>
                        <li>Heart Failure Medications
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>SGLT2 inhibitors: new indications, monitoring requirements</li>
                            <li>Sacubitril/valsartan: timing with ACE inhibitors, monitoring</li>
                            <li>Inotropes: continuous monitoring requirements, weaning protocols</li>
                          </ul>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Complex Pain Management</h4>
                      <p className="text-muted-foreground mb-2">
                        Understanding multimodal pain management and risk mitigation strategies:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Opioid Considerations
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Patient-controlled analgesia: programming, safety limits</li>
                            <li>Methadone: QT prolongation, conversion calculations</li>
                            <li>Fentanyl patches: heat exposure risks, proper disposal</li>
                          </ul>
                        </li>
                        <li>Non-opioid Approaches
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>COX-2 inhibitors: cardiovascular risks, renal monitoring</li>
                            <li>Ketamine: emergence phenomena, monitoring requirements</li>
                            <li>Cannabinoids: legal considerations, drug interactions</li>
                          </ul>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">High-Alert Medications</h4>
                      <p className="text-muted-foreground mb-2">
                        Critical medications requiring extra safety precautions and monitoring:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Insulin Management
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>U-500 insulin: documentation requirements, safety checks</li>
                            <li>Insulin pumps: troubleshooting, site rotation</li>
                            <li>Sliding scale protocols: individualization, monitoring</li>
                          </ul>
                        </li>
                        <li>Chemotherapy Agents
                          <ul className="list-disc list-inside ml-4 mt-2">
                            <li>Vesicant medications: extravasation protocols</li>
                            <li>Oral chemotherapy: handling precautions, adherence</li>
                            <li>Targeted therapies: specific side effect monitoring</li>
                          </ul>
                        </li>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4" 
                        onClick={async () => {
                          try {
                            const result = await getPharmacokineticsCaseStudy('ADME');
                            setAiContent(result.content);
                            setCurrentSection('Pharmacokinetics Case Studies');
                            setIsDialogOpen(true);
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to load case study. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
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
              <div>
                <CardTitle>Drug Calculations</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Master essential medication calculations through progressive learning, from basic unit conversions to complex IV drip rates. Each section includes detailed explanations and interactive practice scenarios.
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={() => handleAIHelp("calculations_overview")}>
                <Bot className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <section>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Basic Calculations</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Develop proficiency in foundational medication calculations essential for safe medication administration. Start with simple conversions and progress to more complex scenarios.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("basic_calculations")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Tablet and Capsule Calculations</h4>
                      <p className="text-muted-foreground mb-4">
                        Understanding how to calculate correct dosages from available medication forms is crucial for safe administration. Begin with:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Unit Conversions
                          <p className="ml-6 mt-1">
                            Practice converting between milligrams (mg), grams (g), and micrograms (mcg). Understanding these conversions is fundamental for accurate dosing.
                          </p>
                        </li>
                        <li>Available Strength Calculations
                          <p className="ml-6 mt-1">
                            Learn to determine the number of tablets or capsules needed when the ordered dose differs from the available medication strength.
                          </p>
                        </li>
                        <li>Multiple Tablet Calculations
                          <p className="ml-6 mt-1">
                            Master complex scenarios where multiple tablets of different strengths may be needed to achieve the prescribed dose.
                          </p>
                        </li>
                      </ul>
                      <Button
                        className="mt-4"
                        onClick={() => handleAIHelp("practice_basic_calculations", "Practice converting medication doses and calculating tablet quantities")}
                      >
                        Practice Scenarios
                      </Button>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Weight-Based Dosing</h4>
                      <p className="text-muted-foreground mb-4">
                        Mastering weight-based calculations is essential for pediatric and specialized medication administration:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>mg/kg Calculations
                          <p className="ml-6 mt-1">
                            Learn to calculate precise doses based on patient weight, considering safe dosing ranges and maximum limits.
                          </p>
                        </li>
                        <li>Body SurfaceArea (BSA) Calculations
                          <p className="ml-6 mt-1">
                            Understand how to use BSA for medication dosing, particularly important in chemotherapy and pediatric medications.
                          </p>
                        </li>
                        <li>Pediatric Considerations
                          <p className="ml-6 mt-1">
                            Special focus on safe dosing ranges for pediatric patients, including weight-based calculations and age-specific considerations.
                          </p>
                        </li>
                      </ul>
                      <AIHelpButton 
                        title="Practice Cases"
                        description="Get AI assistance with pharmacology practice cases"
                        topic="practice_weight_based"
                        context="pediatric_calculations"
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">IV Calculations</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Master intravenous medication calculations through progressive complexity, from basic flow rates to advanced critical care infusions.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAIHelp("IV_calculations")}>
                      <Bot className="h-4 w-4 mr-2" />
                      AI Help
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">IV Flow Rate Calculations</h4>
                      <p className="text-muted-foreground mb-4">
                        Understand the principles of IV flow rates and their clinical applications:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Basic Flow Rates
                          <p className="ml-6 mt-1">
                            Calculate mL/hr rates for standard IV solutions, considering concentration and ordered dose.
                          </p>
                        </li>
                        <li>Complex IV Calculations
                          <p className="ml-6 mt-1">
                            Master advanced calculations for critical medications, including vasoactive drugs and continuous infusions.
                          </p>
                        </li>
                        <li>Weight-Based IV Rates
                          <p className="ml-6 mt-1">
                            Calculate mcg/kg/min and other weight-based IV medication rates commonly used in critical care.
                          </p>
                        </li>
                      </ul>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleAIHelp("practice_IV_basic", "flow_rates")}>
                          Basic Scenarios
                        </Button>
                        <Button 
                        onClick={() => handleAIHelp("practice_IV_advanced", "Generate advanced IV medication scenarios including critical care drips, multiple concurrent infusions, and complex titration protocols with detailed explanations and step-by-step solutions")}
                      >
                        Advanced Cases
                      </Button>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Complex IV Therapy</h4>
                      <p className="text-muted-foreground mb-4">
                        Advanced concepts in IV therapy calculations:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Multiple IV Medications
                          <p className="ml-6 mt-1">
                            Calculate total fluid rates when multiple IV medications are runningsimultaneously.
                          </p>
                        </li>
                        <li>Titration Calculations
                          <p className="ml-6 mt-1">
                            Learn to adjust IV rates based on patient response and prescribed titration parameters.
                          </p>
                        </li>
                        <li>Advanced Critical Care
                          <p className="ml-6 mt-1">
                            Master complex calculations for high-risk medications in critical care settings.
                          </p>
                        </li>
                      </ul>
                      <Button
                        className="mt-4"
                        onClick={() => handleAIHelp("practice_complex_IV", "critical_scenarios")}
                      >
                        Practice Complex Cases
                      </Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader className="space-y-1.5 pb-4">
            <DialogTitle className="text-2xl font-bold">
              {currentSection}
            </DialogTitle>
            <DialogDescription>
              AI-powered assistance for your learning journey
            </DialogDescription>
          </DialogHeader>

          <div className="absolute right-4 top-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleExport}
              title="Export content"
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {aiHelpMutation.isPending ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-[calc(80vh-12rem)] pr-4">
              <div className="prose prose-sm max-w-none">
                {aiContent.split('\n').map((paragraph, index) =>
                  paragraph.trim() && (
                    <div key={index} className="mb-4 text-foreground">
                      {paragraph}
                    </div>
                  )
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
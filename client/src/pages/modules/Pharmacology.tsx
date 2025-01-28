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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medication Overview</CardTitle>
              <Button variant="outline" size="icon" onClick={() => handleAIHelp("medications")}>
                <Bot className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <section>
                  <h3 className="text-lg font-semibold mb-2">Drug Classifications</h3>
                  <p className="text-muted-foreground mb-4">
                    Learn about major drug classes including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Antimicrobials</li>
                    <li>Cardiovascular medications</li>
                    <li>Pain management drugs</li>
                    <li>Psychiatric medications</li>
                    <li>Endocrine medications</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">Mechanisms of Action</h3>
                  <p className="text-muted-foreground mb-4">
                    Understand how different medications work in the body:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Receptor interactions</li>
                    <li>Pharmacokinetics</li>
                    <li>Drug absorption and distribution</li>
                    <li>Metabolism and excretion</li>
                  </ul>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Drug Calculations</CardTitle>
              <Button variant="outline" size="icon" onClick={() => handleAIHelp("calculations")}>
                <Bot className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <section>
                  <h3 className="text-lg font-semibold mb-2">Basic Calculations</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Tablet and capsule calculations</li>
                    <li>Liquid medication calculations</li>
                    <li>Weight-based dosing</li>
                    <li>Conversion between units</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">IV Calculations</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>IV flow rates</li>
                    <li>Drip rates</li>
                    <li>IV push medications</li>
                    <li>Complex IV calculations</li>
                  </ul>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="administration">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medication Administration</CardTitle>
              <Button variant="outline" size="icon" onClick={() => handleAIHelp("administration")}>
                <Bot className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <section>
                  <h3 className="text-lg font-semibold mb-2">Administration Routes</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Oral administration</li>
                    <li>Parenteral administration</li>
                    <li>Topical application</li>
                    <li>Inhalation methods</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">Safety Guidelines</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>The Rights of Medication Administration</li>
                    <li>Documentation requirements</li>
                    <li>Error prevention strategies</li>
                    <li>Special considerations</li>
                  </ul>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
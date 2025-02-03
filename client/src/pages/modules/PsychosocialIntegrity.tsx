
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { Progress } from "@/components/ui/progress";

export default function PsychosocialIntegrity() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Psychosocial Integrity</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master mental health concepts and therapeutic communication
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mental-health">Mental Health</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="support">Support Systems</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Psychosocial Care</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Mental Health Concepts</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Psychiatric disorders</li>
                      <li>• Crisis intervention</li>
                      <li>• Behavioral management</li>
                      <li>• Coping mechanisms</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Therapeutic Communication</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Communication techniques</li>
                      <li>• Cultural considerations</li>
                      <li>• Family dynamics</li>
                      <li>• Support resources</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mental-health">
          <Card>
            <CardHeader>
              <CardTitle>Mental Health Concepts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Assessment</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Mental Status Evaluation</li>
                      <li>• Risk Assessment</li>
                      <li>• Behavioral Analysis</li>
                      <li>• Crisis Management</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Interventions</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Crisis Prevention</li>
                      <li>• De-escalation Techniques</li>
                      <li>• Support Resources</li>
                      <li>• Treatment Planning</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Therapeutic Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Communication Skills</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Therapeutic Techniques</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Active listening</li>
                          <li>• Open-ended questions</li>
                          <li>• Reflection & clarification</li>
                          <li>• Empathetic responses</li>
                        </ul>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Cultural Competency</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Cultural awareness</li>
                          <li>• Language considerations</li>
                          <li>• Religious beliefs</li>
                          <li>• Family dynamics</li>
                        </ul>
                      </Card>
                    </div>
                    <div className="mt-4">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Communication Barriers</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Language differences</li>
                          <li>• Cultural misunderstandings</li>
                          <li>• Physical limitations</li>
                          <li>• Emotional barriers</li>
                        </ul>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Family Support</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Family Dynamics</li>
                      <li>• Caregiver Support</li>
                      <li>• Resource Navigation</li>
                      <li>• Education Planning</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Community Resources</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Support Groups</li>
                      <li>• Crisis Services</li>
                      <li>• Advocacy Programs</li>
                      <li>• Social Services</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


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
      </Tabs>
    </div>
  );
}

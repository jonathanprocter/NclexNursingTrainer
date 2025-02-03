
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { Progress } from "@/components/ui/progress";

export default function SafetyInfectionControl() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Safety & Infection Control</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master essential safety protocols and infection prevention strategies
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="infection">Infection Prevention</TabsTrigger>
          <TabsTrigger value="safety">Safety Protocols</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Response</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Safety Fundamentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Infection Control</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Standard precautions</li>
                      <li>• Transmission-based precautions</li>
                      <li>• Sterile technique</li>
                      <li>• Healthcare-associated infections</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Safety Measures</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Fall prevention</li>
                      <li>• Medication safety</li>
                      <li>• Environmental safety</li>
                      <li>• Emergency protocols</li>
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

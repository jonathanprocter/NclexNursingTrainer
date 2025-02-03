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
        <TabsContent value="infection">
          <Card>
            <CardHeader>
              <CardTitle>Infection Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Standard Precautions</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Hand Hygiene
                      <ul className="ml-4 mt-1">
                        <li>- Before and after patient contact</li>
                        <li>- Before aseptic procedures</li>
                        <li>- After body fluid exposure</li>
                        <li>- After touching patient surroundings</li>
                      </ul>
                    </li>
                    <li>• Personal Protective Equipment (PPE)
                      <ul className="ml-4 mt-1">
                        <li>- Proper sequence of donning/doffing</li>
                        <li>- Glove usage guidelines</li>
                        <li>- Mask and respirator indications</li>
                        <li>- Eye protection requirements</li>
                      </ul>
                    </li>
                    <li>• Sharps Safety
                      <ul className="ml-4 mt-1">
                        <li>- Proper disposal techniques</li>
                        <li>- Prevention of needlestick injuries</li>
                        <li>- Safety device activation</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Transmission-Based Precautions</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Contact Precautions
                      <ul className="ml-4 mt-1">
                        <li>- MRSA protocols</li>
                        <li>- C. difficile management</li>
                        <li>- Environmental cleaning</li>
                      </ul>
                    </li>
                    <li>• Droplet Precautions
                      <ul className="ml-4 mt-1">
                        <li>- Influenza guidelines</li>
                        <li>- Mask requirements</li>
                        <li>- Patient placement</li>
                      </ul>
                    </li>
                    <li>• Airborne Precautions
                      <ul className="ml-4 mt-1">
                        <li>- TB isolation requirements</li>
                        <li>- Negative pressure rooms</li>
                        <li>- Respirator fit testing</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Healthcare-Associated Infections</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Central Line-Associated Bloodstream Infections
                      <ul className="ml-4 mt-1">
                        <li>- Bundle compliance</li>
                        <li>- Sterile technique</li>
                        <li>- Site care protocols</li>
                      </ul>
                    </li>
                    <li>• Catheter-Associated Urinary Tract Infections
                      <ul className="ml-4 mt-1">
                        <li>- Insertion guidelines</li>
                        <li>- Maintenance care</li>
                        <li>- Early removal protocols</li>
                      </ul>
                    </li>
                    <li>• Surgical Site Infections
                      <ul className="ml-4 mt-1">
                        <li>- Pre-operative preparation</li>
                        <li>- Post-operative care</li>
                        <li>- Wound management</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle>Safety Protocols</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Patient Safety Protocols</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Fall Prevention
                      <ul className="ml-4 mt-1">
                        <li>- Risk assessment tools</li>
                        <li>- Environmental safety measures</li>
                        <li>- Patient education</li>
                        <li>- Documentation requirements</li>
                      </ul>
                    </li>
                    <li>• Medication Safety
                      <ul className="ml-4 mt-1">
                        <li>- Rights of medication administration</li>
                        <li>- High-alert medications</li>
                        <li>- Double-check protocols</li>
                        <li>- Safe medication storage</li>
                      </ul>
                    </li>
                    <li>• Patient Identification
                      <ul className="ml-4 mt-1">
                        <li>- Two-identifier protocol</li>
                        <li>- Wristband verification</li>
                        <li>- Time-out procedures</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Clinical Safety Measures</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Equipment Safety
                      <ul className="ml-4 mt-1">
                        <li>- Proper operation procedures</li>
                        <li>- Maintenance schedules</li>
                        <li>- Safety checks documentation</li>
                      </ul>
                    </li>
                    <li>• Body Mechanics
                      <ul className="ml-4 mt-1">
                        <li>- Proper lifting techniques</li>
                        <li>- Transfer protocols</li>
                        <li>- Equipment utilization</li>
                      </ul>
                    </li>
                    <li>• Environmental Safety
                      <ul className="ml-4 mt-1">
                        <li>- Hazard identification</li>
                        <li>- Spill management</li>
                        <li>- Fire safety protocols</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Emergency Response Protocols</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Code Response
                      <ul className="ml-4 mt-1">
                        <li>- Code Blue (cardiac/respiratory arrest)</li>
                        <li>- Code Red (fire)</li>
                        <li>- Code Gray (combative person)</li>
                        <li>- Rapid Response Team activation</li>
                      </ul>
                    </li>
                    <li>• Disaster Response
                      <ul className="ml-4 mt-1">
                        <li>- Evacuation procedures</li>
                        <li>- Communication protocols</li>
                        <li>- Resource management</li>
                        <li>- Documentation requirements</li>
                      </ul>
                    </li>
                    <li>• Medical Emergencies
                      <ul className="ml-4 mt-1">
                        <li>- Initial assessment protocols</li>
                        <li>- Emergency equipment location</li>
                        <li>- Documentation guidelines</li>
                        <li>- Team roles and responsibilities</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
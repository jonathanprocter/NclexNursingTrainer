
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { Progress } from "@/components/ui/progress";
import { Heart, Brain, Activity, UserCheck } from "lucide-react";

export default function BasicCare() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-[100vw] overflow-x-hidden">
      <div className="text-center mb-4 sm:mb-8 px-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Basic Care and Comfort</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Master foundational nursing care principles focusing on patient comfort, mobility, nutrition, and basic needs
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="mobility">Mobility</TabsTrigger>
          <TabsTrigger value="hygiene">Personal Care</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Core Principles of Basic Care</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-4">
                    <Heart className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium mb-2">Comfort Management</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Pain assessment and interventions</li>
                      <li>• Position and comfort measures</li>
                      <li>• Sleep promotion strategies</li>
                      <li>• Environmental comfort factors</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <Brain className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium mb-2">Patient Assessment</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Basic health assessment</li>
                      <li>• Vital signs monitoring</li>
                      <li>• Activity tolerance evaluation</li>
                      <li>• Nutritional status assessment</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <Activity className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium mb-2">Mobility Support</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Range of motion exercises</li>
                      <li>• Transfer techniques</li>
                      <li>• Ambulation assistance</li>
                      <li>• Fall prevention strategies</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <UserCheck className="h-6 w-6 text-primary mb-2" />
                    <h3 className="font-medium mb-2">Personal Care</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Hygiene maintenance</li>
                      <li>• Oral care protocols</li>
                      <li>• Skin integrity maintenance</li>
                      <li>• Grooming assistance</li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Clinical Application</h3>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Assessment Techniques</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Systematic head-to-toe assessment</li>
                        <li>• Documentation of findings</li>
                        <li>• Recognition of abnormalities</li>
                        <li>• Communication with healthcare team</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Intervention Planning</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Care prioritization</li>
                        <li>• Resource management</li>
                        <li>• Patient education</li>
                        <li>• Family involvement</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Outcome Evaluation</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Progress monitoring</li>
                        <li>• Care plan adjustments</li>
                        <li>• Patient satisfaction assessment</li>
                        <li>• Quality improvement measures</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Nutrition Management</CardTitle>
                <AIHelpButton
                  title="Nutrition Care"
                  description="Get AI assistance with nutrition assessment and interventions"
                  topic="nutrition_management"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Nutritional Assessment</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Dietary history evaluation</li>
                      <li>• Anthropometric measurements</li>
                      <li>• Laboratory value interpretation</li>
                      <li>• Nutritional risk screening</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Feeding Assistance</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Feeding techniques</li>
                      <li>• Swallowing assessment</li>
                      <li>• Positioning for meals</li>
                      <li>• Assistive device use</li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Special Considerations</h3>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Therapeutic Diets</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Cardiac and renal diets</li>
                        <li>• Diabetic meal planning</li>
                        <li>• Texture modifications</li>
                        <li>• Cultural preferences</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Enteral Nutrition</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Tube feeding management</li>
                        <li>• Complication prevention</li>
                        <li>• Rate and volume monitoring</li>
                        <li>• Site care protocols</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobility">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Mobility and Exercise</CardTitle>
                <AIHelpButton
                  title="Mobility Support"
                  description="Get AI assistance with mobility assessment and interventions"
                  topic="mobility_support"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Activity Assessment</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Mobility level evaluation</li>
                      <li>• Balance assessment</li>
                      <li>• Strength testing</li>
                      <li>• Gait analysis</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Exercise Programs</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Range of motion exercises</li>
                      <li>• Strengthening activities</li>
                      <li>• Endurance building</li>
                      <li>• Balance training</li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Safe Patient Handling</h3>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Transfer Techniques</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Bed to chair transfers</li>
                        <li>• Stand pivot technique</li>
                        <li>• Mechanical lift use</li>
                        <li>• Team lifting protocols</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Fall Prevention</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Risk assessment tools</li>
                        <li>• Environmental modifications</li>
                        <li>• Patient education</li>
                        <li>• Safety equipment use</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hygiene">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Personal Care and Hygiene</CardTitle>
                <AIHelpButton
                  title="Personal Care"
                  description="Get AI assistance with hygiene and personal care interventions"
                  topic="personal_care"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Bathing and Hygiene</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Bed bath techniques</li>
                      <li>• Shower assistance</li>
                      <li>• Skin assessment</li>
                      <li>• Privacy measures</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Oral Care</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Oral assessment</li>
                      <li>• Brushing techniques</li>
                      <li>• Denture care</li>
                      <li>• Special mouth care</li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Specialized Care</h3>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Skin Care</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Pressure injury prevention</li>
                        <li>• Moisture management</li>
                        <li>• Skin barrier protection</li>
                        <li>• Wound prevention</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Grooming</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Hair care</li>
                        <li>• Nail care</li>
                        <li>• Shaving assistance</li>
                        <li>• Dressing assistance</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

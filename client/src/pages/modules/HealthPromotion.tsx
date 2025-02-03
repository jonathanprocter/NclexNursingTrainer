import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { Brain, Heart, Activity, Apple, Users, Stethoscope } from "lucide-react";

export default function HealthPromotion() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Health Promotion</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master health promotion and disease prevention strategies across the lifespan
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prevention">Prevention Strategies</TabsTrigger>
          <TabsTrigger value="assessment">Health Assessment</TabsTrigger>
          <TabsTrigger value="education">Patient Education</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <div className="grid gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Core Concepts</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-4">
                    <Heart className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-medium mb-2">Prevention Levels</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Primary Prevention</li>
                      <li>• Secondary Prevention</li>
                      <li>• Tertiary Prevention</li>
                      <li>• Risk Assessment</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <Brain className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-medium mb-2">Health Education</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Lifestyle Modification</li>
                      <li>• Behavior Change</li>
                      <li>• Self-Management</li>
                      <li>• Health Literacy</li>
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <Activity className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-medium mb-2">Wellness Promotion</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Physical Activity</li>
                      <li>• Nutrition</li>
                      <li>• Stress Management</li>
                      <li>• Sleep Hygiene</li>
                    </ul>
                  </Card>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Specialized Areas</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-4">
                      <Users className="h-6 w-6 text-primary mb-2" />
                      <h4 className="font-medium mb-2">Population Health</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Community Assessment</li>
                        <li>• Health Disparities</li>
                        <li>• Cultural Competence</li>
                        <li>• Social Determinants</li>
                      </ul>
                      <AIHelpButton topic="population_health" className="mt-4" />
                    </Card>

                    <Card className="p-4">
                      <Stethoscope className="h-6 w-6 text-primary mb-2" />
                      <h4 className="font-medium mb-2">Clinical Prevention</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Screening Guidelines</li>
                        <li>• Immunizations</li>
                        <li>• Risk Factor Modification</li>
                        <li>• Early Detection</li>
                      </ul>
                      <AIHelpButton topic="clinical_prevention" className="mt-4" />
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
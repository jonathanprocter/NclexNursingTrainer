
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { Progress } from "@/components/ui/progress";

export default function HealthPromotion() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Health Promotion & Maintenance</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn preventive healthcare and developmental stages across the lifespan
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prevention">Prevention</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="screening">Health Screening</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Health Promotion Principles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Prevention Strategies</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Primary prevention measures</li>
                      <li>• Health education</li>
                      <li>• Immunization schedules</li>
                      <li>• Lifestyle modifications</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Growth & Development</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Developmental stages</li>
                      <li>• Age-specific health needs</li>
                      <li>• Health screening guidelines</li>
                      <li>• Anticipatory guidance</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prevention">
          <Card>
            <CardHeader>
              <CardTitle>Prevention Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Primary Prevention</h3>
                    <p className="text-muted-foreground">Health education, immunizations, and lifestyle counseling</p>
                    <div className="grid gap-2">
                      <Button variant="outline" className="justify-start">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Immunization Schedules
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <HeartPulse className="mr-2 h-4 w-4" />
                        Health Screening Guidelines
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development">
          <Card>
            <CardHeader>
              <CardTitle>Growth & Development</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Life Stages</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Infant & Child Development</li>
                      <li>• Adolescent Health</li>
                      <li>• Adult Wellness</li>
                      <li>• Geriatric Care</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Assessment Skills</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Developmental Milestones</li>
                      <li>• Growth Parameters</li>
                      <li>• Nutritional Status</li>
                      <li>• Physical Assessment</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening">
          <Card>
            <CardHeader>
              <CardTitle>Health Screening</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Screening Guidelines</h3>
                    <p className="text-muted-foreground">Evidence-based screening recommendations across the lifespan</p>
                    <div className="grid gap-2">
                      <Button variant="outline" className="justify-start">
                        <Activity className="mr-2 h-4 w-4" />
                        Preventive Services
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <TestTube className="mr-2 h-4 w-4" />
                        Diagnostic Tests
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

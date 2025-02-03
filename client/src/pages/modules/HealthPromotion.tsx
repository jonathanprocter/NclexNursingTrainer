
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
      </Tabs>
    </div>
  );
}

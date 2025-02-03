
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { Progress } from "@/components/ui/progress";

export default function ManagementOfCare() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Management of Care</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn to coordinate patient care, delegate tasks, and manage resources effectively
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="delegation">Delegation</TabsTrigger>
          <TabsTrigger value="prioritization">Prioritization</TabsTrigger>
          <TabsTrigger value="coordination">Care Coordination</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Care Management Principles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Assignment & Delegation</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Task delegation principles</li>
                      <li>• Staff assignment strategies</li>
                      <li>• Scope of practice considerations</li>
                      <li>• Supervision requirements</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Care Coordination</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Interdisciplinary collaboration</li>
                      <li>• Resource management</li>
                      <li>• Care transitions</li>
                      <li>• Documentation requirements</li>
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

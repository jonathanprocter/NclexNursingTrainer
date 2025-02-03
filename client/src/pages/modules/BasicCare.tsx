
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { Progress } from "@/components/ui/progress";

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
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="mobility">Mobility</TabsTrigger>
          <TabsTrigger value="hygiene">Personal Care</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Basic Care Principles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={0} className="w-full" />
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {/* Add content here */}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

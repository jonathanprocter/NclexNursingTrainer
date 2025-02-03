import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { Progress } from "@/components/ui/progress";

export default function HealthPromotion() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Health Promotion and Maintenance</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn preventive care strategies and health maintenance across the lifespan
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prevention">Prevention</TabsTrigger>
          <TabsTrigger value="screening">Health Screening</TabsTrigger>
          <TabsTrigger value="education">Patient Education</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Health Promotion Fundamentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Preventive Care</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Immunization schedules</li>
                      <li>• Health screenings</li>
                      <li>• Lifestyle modifications</li>
                      <li>• Risk factor reduction</li>
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Health Education</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Patient teaching methods</li>
                      <li>• Wellness promotion</li>
                      <li>• Self-care strategies</li>
                      <li>• Community resources</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <AIHelpButton 
          title="Health Promotion Guidance"
          description="Get AI assistance with health promotion strategies"
          topic="health_promotion"
        />
      </div>
    </div>
  );
}
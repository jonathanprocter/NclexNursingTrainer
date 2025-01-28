import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function RiskReduction() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Risk Reduction</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn to identify and minimize patient safety risks in healthcare settings
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="safety">Safety Measures</TabsTrigger>
          <TabsTrigger value="prevention">Prevention</TabsTrigger>
          <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
                
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Topics Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/15</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Scenarios Solved</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/30</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Time Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0h</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Learn about essential safety measures and protocols in healthcare settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prevention">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Study preventive measures and best practices for risk mitigation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Learn how to assess and evaluate potential risks in clinical settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

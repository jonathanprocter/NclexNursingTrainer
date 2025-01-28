import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function Calculations() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Drug Calculations</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master medication dosage calculations and conversions
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="basics">Basic Calculations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Topics</TabsTrigger>
          <TabsTrigger value="practice">Practice Problems</TabsTrigger>
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
                      <CardTitle className="text-lg">Problems Solved</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/100</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Topics Mastered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/8</p>
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

        <TabsContent value="basics">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Learn fundamental drug calculations, including unit conversions and dosage calculations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Advanced topics including IV drip rates, weight-based dosing, and complex calculations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Practice problems with step-by-step solutions and explanations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

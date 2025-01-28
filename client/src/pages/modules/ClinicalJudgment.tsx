import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function ClinicalJudgment() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Clinical Judgment</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master nursing process and clinical decision-making skills
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="process">Nursing Process</TabsTrigger>
          <TabsTrigger value="decision">Decision Making</TabsTrigger>
          <TabsTrigger value="practice">Practice Cases</TabsTrigger>
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
                      <CardTitle className="text-lg">Cases Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/25</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skills Mastered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/10</p>
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

        <TabsContent value="process">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Learn about the nursing process and its application in clinical settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decision">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Master clinical decision-making skills with interactive scenarios.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Practice your clinical judgment skills with real-world cases.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

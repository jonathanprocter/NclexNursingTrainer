import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function Pharmacology() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Pharmacology & Parenteral</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master drug classifications, mechanisms of action, and nursing implications
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="calculations">Calculations</TabsTrigger>
          <TabsTrigger value="administration">Administration</TabsTrigger>
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
                      <CardTitle className="text-lg">Topics Covered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/12</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Practice Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/50</p>
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

        <TabsContent value="medications">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                This section will contain detailed information about different drug classes,
                mechanisms of action, and nursing considerations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                This section will contain practice problems for drug calculations,
                including dosage calculations and IV drip rates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="administration">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                This section will cover safe medication administration practices,
                including the rights of medication administration.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

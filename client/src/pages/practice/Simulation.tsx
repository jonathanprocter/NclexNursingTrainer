import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Simulation() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Simulation</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience complex clinical scenarios in an interactive learning environment
        </p>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="skills">Skills Lab</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">Critical Care Simulation</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Advanced</Badge>
                      <Badge variant="outline">60 minutes</Badge>
                    </div>
                  </div>
                  <Button>Start Simulation</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage multiple critically ill patients in a simulated ICU environment.
                  Practice prioritization, delegation, and critical thinking skills.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Patient Assessment</Badge>
                  <Badge variant="outline">Critical Thinking</Badge>
                  <Badge variant="outline">Time Management</Badge>
                  <Badge variant="outline">Clinical Decision Making</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">Emergency Response</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Advanced</Badge>
                      <Badge variant="outline">45 minutes</Badge>
                    </div>
                  </div>
                  <Button>Start Simulation</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Respond to various emergency situations in a fast-paced environment.
                  Focus on rapid assessment and intervention skills.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Emergency Response</Badge>
                  <Badge variant="outline">Quick Decision Making</Badge>
                  <Badge variant="outline">Team Communication</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Virtual Skills Lab</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Practice specific nursing skills in a virtual environment before 
                attempting complex scenarios.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Basic Skills</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Patient Assessment</li>
                      <li>• Vital Signs Monitoring</li>
                      <li>• Medication Administration</li>
                      <li>• Documentation</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Advanced Skills</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Complex Procedures</li>
                      <li>• Emergency Interventions</li>
                      <li>• Critical Care Monitoring</li>
                      <li>• Team Leadership</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Competency</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
                
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Simulations Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/12</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skills Mastered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/15</p>
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
      </Tabs>
    </div>
  );
}

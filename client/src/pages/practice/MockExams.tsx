import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function MockExams() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Mock NCLEX Exams</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Take full-length practice exams in both CAT and Standard NCLEX formats
        </p>
      </div>

      <Tabs defaultValue="cat" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cat">CAT NCLEX</TabsTrigger>
          <TabsTrigger value="standard">Standard NCLEX</TabsTrigger>
          <TabsTrigger value="history">Exam History</TabsTrigger>
        </TabsList>

        <TabsContent value="cat">
          <Card>
            <CardHeader>
              <CardTitle>Computer Adaptive Testing (CAT)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Take a simulated CAT exam that adapts to your performance level.
                  Questions become harder or easier based on your answers.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Exam Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>• Adaptive difficulty</p>
                      <p>• 75-145 questions</p>
                      <p>• 5 hour time limit</p>
                      <p>• All question types</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>Attempts: 0</p>
                        <p>Best Score: N/A</p>
                        <p>Average Score: N/A</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button className="w-full mt-4">Start CAT Exam</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standard">
          <Card>
            <CardHeader>
              <CardTitle>Standard NCLEX Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Take a traditional NCLEX-style exam with a fixed set of questions.
                  Great for practicing time management and building endurance.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Exam Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>• Fixed difficulty</p>
                      <p>• 100 questions</p>
                      <p>• 3 hour time limit</p>
                      <p>• Mixed content areas</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>Attempts: 0</p>
                        <p>Best Score: N/A</p>
                        <p>Average Score: N/A</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button className="w-full mt-4">Start Standard Exam</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Exam History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No exam attempts yet. Start an exam to build your history.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

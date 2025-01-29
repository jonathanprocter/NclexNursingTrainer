import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useLocation } from "wouter";
import { useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function MockExams() {
  const [, setLocation] = useLocation();
  const [showReadyDialog, setShowReadyDialog] = useState(false);
  const [examType, setExamType] = useState<'cat' | 'standard'>('cat');

  const startExam = (type: 'cat' | 'standard') => {
    setExamType(type);
    setShowReadyDialog(true);
  };

  const beginExam = () => {
    setShowReadyDialog(false);
    setLocation(`/practice/exam/${examType}`);
  };

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
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    CAT adapts to your performance level - questions become harder or easier based on your answers.
                  </AlertDescription>
                </Alert>

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
                      <div className="flex items-center mt-4">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Average completion: 3 hours</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Overall Performance</p>
                          <Progress value={65} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p>Attempts: 2</p>
                          <p>Best Score: 72%</p>
                          <p>Average Score: 68%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={() => startExam('cat')}
                >
                  Start CAT Exam
                </Button>
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
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Fixed-length exam with consistent difficulty. Great for building exam stamina and time management skills.
                  </AlertDescription>
                </Alert>

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
                      <div className="flex items-center mt-4">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Average completion: 2 hours</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Overall Performance</p>
                          <Progress value={70} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <p>Attempts: 3</p>
                          <p>Best Score: 78%</p>
                          <p>Average Score: 73%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={() => startExam('standard')}
                >
                  Start Standard Exam
                </Button>
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
              <div className="space-y-4">
                {/* Mock history items */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">CAT Exam</h3>
                      <span className="text-sm text-muted-foreground">January 25, 2025</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score:</span>
                        <span className="font-medium">72%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Questions:</span>
                        <span className="font-medium">85</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Time Spent:</span>
                        <span className="font-medium">2h 45m</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Standard Exam</h3>
                      <span className="text-sm text-muted-foreground">January 20, 2025</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score:</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Questions:</span>
                        <span className="font-medium">100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Time Spent:</span>
                        <span className="font-medium">2h 15m</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showReadyDialog} onOpenChange={setShowReadyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ready to Begin?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {examType === 'cat'
                  ? "This CAT exam will take approximately 2-4 hours. Questions will adapt to your performance level."
                  : "This standard exam contains 100 questions and will take approximately 2-3 hours."
                }
              </AlertDescription>
            </Alert>
            <ul className="space-y-2 text-sm">
              <li>• Ensure you have a stable internet connection</li>
              <li>• Find a quiet environment</li>
              <li>• Have scratch paper ready if needed</li>
              <li>• You can pause the exam if necessary</li>
            </ul>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReadyDialog(false)}>Cancel</Button>
              <Button onClick={beginExam}>Begin Exam</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
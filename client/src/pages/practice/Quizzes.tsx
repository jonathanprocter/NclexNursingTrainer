import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/nclex/QuestionCard";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Book, Activity, BarChart3 } from "lucide-react";

export default function Quizzes() {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Mock data for demonstration
  const mockQuestions = [
    {
      id: 1,
      text: "A client with type 2 diabetes mellitus has a blood glucose level of 180 mg/dL before lunch. Which of the following nursing actions is most appropriate?",
      options: [
        { id: "a", text: "Administer the prescribed insulin" },
        { id: "b", text: "Hold the lunch tray" },
        { id: "c", text: "Notify the healthcare provider" },
        { id: "d", text: "Document the finding and proceed with lunch" }
      ],
      correctAnswer: "d",
      explanation: "For a client with type 2 diabetes, a blood glucose level of 180 mg/dL before a meal is not unusually high and does not require immediate intervention. The nurse should document the finding and allow the client to eat lunch as scheduled.",
      category: "Endocrine",
      difficulty: "Medium"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice Quizzes</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test your knowledge with topic-specific quizzes and track your progress
        </p>
      </div>

      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Topics
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Badge variant="secondary">Question {currentQuestion + 1}</Badge>
                  <Badge variant="outline" className="ml-2">Endocrine</Badge>
                  <Badge variant="outline" className="ml-2">Medium</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Time: 02:45
                </div>
              </div>

              <QuestionCard
                question={mockQuestions[0]}
                onNext={() => setCurrentQuestion(c => c + 1)}
              />

              <div className="mt-4">
                <Progress value={(currentQuestion + 1) * 10} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>Progress</span>
                  <span>{currentQuestion + 1}/10 Questions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Study Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {['Fundamentals', 'Med-Surg', 'Pediatrics', 'OB/GYN', 'Mental Health', 'Leadership'].map((topic) => (
                  <Card key={topic}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{topic}</h3>
                      <Progress value={Math.random() * 100} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Questions: 50</span>
                        <span>Completed: 25</span>
                      </div>
                      <Button className="w-full mt-4">Practice</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span>65%</span>
                </div>
                <Progress value={65} className="h-2" />

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Questions Attempted</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">325/500</p>
                      <p className="text-sm text-muted-foreground">65% complete</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">72%</p>
                      <p className="text-sm text-muted-foreground">+5% this week</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Study Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">24h</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Review History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Practice Session #{index}</h3>
                        <span className="text-sm text-muted-foreground">January {25 + index}, 2025</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Score:</span>
                          <span className="font-medium">{70 + index}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Questions:</span>
                          <span className="font-medium">25</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Topics:</span>
                          <span className="font-medium">Med-Surg, Fundamentals</span>
                        </div>
                        <Progress value={70 + index} className="h-2" />
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        Review Answers
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
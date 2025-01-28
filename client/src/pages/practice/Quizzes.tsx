import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import QuestionCard from "@/components/nclex/QuestionCard";

export default function Quizzes() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice Quizzes</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test your knowledge with topic-specific quizzes and track your progress
        </p>
      </div>

      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <QuestionCard
            question={{
              id: 1,
              text: "A client with type 2 diabetes mellitus has a blood glucose level of 180 mg/dL before lunch. Which of the following nursing actions is most appropriate?",
              options: [
                { id: "a", text: "Administer the prescribed insulin" },
                { id: "b", text: "Hold the lunch tray" },
                { id: "c", text: "Notify the healthcare provider" },
                { id: "d", text: "Document the finding and proceed with lunch" }
              ],
              correctAnswer: "d",
              explanation: "For a client with type 2 diabetes, a blood glucose level of 180 mg/dL before a meal is not unusually high and does not require immediate intervention. The nurse should document the finding and allow the client to eat lunch as scheduled."
            }}
            onNext={() => {}}
          />
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
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
                
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Questions Attempted</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0/100</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">0%</p>
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

        <TabsContent value="review">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Review your previous quiz attempts and analyze your performance.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

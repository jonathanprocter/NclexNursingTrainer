import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import CourseProgress from "@/components/nclex/CourseProgress";
import TopicList from "@/components/nclex/TopicList";
import { Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Clock } from "lucide-react";
import { toast } from "react-hot-toast";

interface StudyTimeFormData {
  duration: string;
}

export default function Home() {
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const form = useForm<StudyTimeFormData>({
    defaultValues: {
      duration: "",
    },
  });

  const onSubmit = async (data: StudyTimeFormData) => {
    try {
      const response = await fetch('/api/study-guide/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeAvailable: parseInt(data.duration),
          focusAreas: studentProgress.areasForGrowth
        })
      });

      const plan = await response.json();

      const personalizedPlan = `
      📚 ${data.duration} Minute Personalized Study Plan for ${studentProgress.name}

      🎯 Focus Areas Based on Your Analytics:
      ${plan.weakAreas.map((area: any) => `
      ${area.topic} (Current Score: ${area.score}%)
      - ${area.improvement}
      - ${area.suggestedApproach}
      `).join('\n')}

      📋 Recommended Study Schedule:
      ${plan.adaptiveQuestions.map((topic: any, index: number) => `
      ${index + 1}. ${topic.topic} Practice (${Math.round(parseInt(data.duration) * 0.3)} mins)
      - Complete ${topic.questions.length} targeted practice questions
      - Review incorrect answers and explanations
      - Take notes on challenging concepts
      `).join('\n')}

      💡 Personalized Tips:
      - Focus on understanding core concepts before moving to complex scenarios
      - Use active recall techniques during practice
      - Take short breaks between topics
      - Review previous mistakes before starting new questions

      📊 Progress Tracking:
      - Initial assessment completed
      - Targeting improvement in identified weak areas
      - Adaptive questions will adjust based on your performance

      Keep going! You're making great progress in mastering these topics! 🌟
      `;
      setStudyPlan(plan.personalizedPlan || personalizedPlan);
    } catch (error) {
      console.error("Error generating study plan:", error);
      toast.error("Failed to generate study plan. Please try again.");
    }
  };

  const showToast = () => {
    toast.success("Welcome to NCLEX Prep!");
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <section className="text-center py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome Back, Bianca! 👋
          </h1>
          <p className="text-xl sm:text-2xl text-primary mb-4">
            Ready to ace your NCLEX? Let's do this! 💪
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Your personalized study guide for the National Council Licensure Examination. 
            Track your progress, practice with questions, and master key nursing concepts. 
            You've got this! ⭐
          </p>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Your Progress 📊</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseProgress />
            <div className="mt-4 flex justify-end">
              <Link href="/study-guide">
                <Button>Continue Learning 📚</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Practice Questions 📝</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Test your knowledge with our extensive question bank covering all NCLEX topics.
              Keep pushing forward! 🎯
            </p>
            <Link href="/questions">
              <Button className="w-full">Start Practice ✨</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            AI Study Planner ✨
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="w-full">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How much time do you have to study? (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30" 
                            {...field} 
                            className="w-full"
                            inputMode="numeric"
                            pattern="[0-9]*"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full sm:w-auto">Generate Study Plan 🎯</Button>
                </form>
              </Form>
            </div>
            {studyPlan && (
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {studyPlan}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Study Topics 📚</h2>
        <TopicList />
      </section>
    </div>
  );
}
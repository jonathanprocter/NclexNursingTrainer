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
import { useQuery } from "@tanstack/react-query";

interface StudyTimeFormData {
  duration: string;
}

interface Question {
  id: string;
  text: string;
  options: Array<{ id: string; text: string; }>;
  correctAnswer: string;
  category: string;
  difficulty: string;
}

interface QuestionsResponse {
  questions: Question[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function Home() {
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const form = useForm<StudyTimeFormData>({
    defaultValues: {
      duration: "",
    },
  });

  const { data: questionsData, isLoading: isLoadingQuestions, error: questionsError } = useQuery<QuestionsResponse>({
    queryKey: ['/api/questions'],
    queryFn: async () => {
      console.log('Fetching questions...');
      const response = await fetch('/api/questions?limit=3');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      console.log('Questions data:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const onSubmit = (data: StudyTimeFormData) => {
    const duration = parseInt(data.duration);
    if (isNaN(duration) || duration <= 0) {
      toast.error("Please enter a valid study duration");
      return;
    }

    const mockStudyPlan = `
      📚 ${data.duration} Minute Personalized Study Plan:

      1. Quick Review (5 mins)
      - Review your previous quiz results
      - Check areas needing improvement

      2. Focused Learning (${Math.floor(duration * 0.4)} mins)
      - Practice key concepts
      - Focus on weak areas

      3. Active Practice (${Math.floor(duration * 0.4)} mins)
      - Complete practice scenarios
      - Focus on clinical judgment

      4. Quick Assessment (${Math.floor(duration * 0.2)} mins)
      - Take a mini-quiz
      - Review incorrect answers

      💡 Pro Tips:
      - Take short breaks between sections
      - Use the AI companion for instant clarification
      - Record challenging concepts for review

      Keep going! You're making great progress! 🌟
    `;
    setStudyPlan(mockStudyPlan);
    toast.success("Study plan generated!");
  };

  const renderQuestionsSection = () => {
    if (isLoadingQuestions) {
      return (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      );
    }

    if (questionsError) {
      console.error('Questions error:', questionsError);
      return (
        <p className="text-muted-foreground">
          Unable to load questions. Please try again later.
        </p>
      );
    }

    if (!questionsData?.questions?.length) {
      return (
        <p className="text-muted-foreground">
          No questions available at the moment.
        </p>
      );
    }

    return (
      <>
        <p className="text-muted-foreground">
          Recent questions from your study path:
        </p>
        <ul className="space-y-2">
          {questionsData.questions.map((question) => (
            <li key={question.id} className="text-sm">
              • {question.text.substring(0, 100)}...
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <section className="text-center py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome to NCLEX Prep! 👋
          </h1>
          <p className="text-xl sm:text-2xl text-primary mb-4">
            Ready to ace your NCLEX? Let's do this! 💪
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Your personalized study guide for the National Council Licensure Examination. 
            Track your progress, practice with questions, and master key nursing concepts.
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
            <div className="space-y-4">
              {renderQuestionsSection()}
              <Link href="/questions">
                <Button className="w-full mt-4">Start Practice ✨</Button>
              </Link>
            </div>
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
                            min="1"
                            max="480"
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
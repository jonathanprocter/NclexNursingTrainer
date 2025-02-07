import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Analytics from "@/components/dashboard/Analytics";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import { useQuery } from "@tanstack/react-query";
import { useState } from 'react';
import { useForm, FormField, FormItem, FormLabel, FormControl } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";


export default function Dashboard() {
  const [studyPlan, setStudyPlan] = useState<{
    topics: string[];
    timeAllocation: Record<string, number>;
    recommendations: string[];
  } | null>(null);

  const form = useForm<{ duration: string }>({
    defaultValues: { duration: "" }
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/user/1"], // Replace with actual user ID
  });

  const generatePersonalizedPlan = async (duration: number) => {
    try {
      const performanceMetrics = analytics?.performance?.map(p => ({
        topic: p.topic,
        score: p.score,
        timeSpent: p.timeSpent
      })) || [];

      const studyPlan = await generateStudyPlan({
        duration,
        performance: performanceMetrics,
        focusAreas: analytics?.weakAreas || []
      });

      setStudyPlan({
        topics: studyPlan.topics,
        timeAllocation: studyPlan.timeAllocation,
        recommendations: studyPlan.recommendations
      });

      const plan = await response.json();
      setStudyPlan(plan);
    } catch (error) {
      console.error('Error generating study plan:', error);
    }
  };

  const onSubmit = (data: { duration: string }) => {
    // Handle form submission
    console.log("Form submitted:", data);
  };


  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back, Bianca!</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Let's make the most of your study session today
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Study Session Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How much time do you have to study today? (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 30" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          generatePersonalizedPlan(parseInt(e.target.value));
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </CardContent>
        </Card>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="instructor">Instructor View</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Analytics data={analytics} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMetrics data={analytics} />
        </TabsContent>

        <TabsContent value="instructor">
          <InstructorDashboard />
        </TabsContent>
      </Tabs>
    </div>
  </div>
  );
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Analytics from "@/components/dashboard/Analytics";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics/user/1"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/analytics/user/1");
        if (!response.ok) {
          // If the API fails, we'll use mock data
          return null;
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching analytics:", error);
        return null;
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your progress, view analytics, and manage your NCLEX preparation
        </p>
      </div>

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
  );
}
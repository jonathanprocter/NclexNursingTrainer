import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Analytics from "@/components/dashboard/Analytics";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["/api/analytics/user/1"], // Replace with actual user ID
    queryFn: async () => {
      try {
        const response = await fetch("/api/analytics/user/1");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const data = await response.json();
        return data;
      } catch (err) {
        console.error("Error fetching analytics:", err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 30000 // Cache for 30 seconds
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">
            Unable to load dashboard data. Please try again later.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your progress, view analytics, and manage your NCLEX preparation
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <Analytics data={analytics} />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceMetrics data={analytics} />
        </TabsContent>

        <TabsContent value="instructor" className="mt-6">
          <InstructorDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { memo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { AnalyticsData } from "../../types/analytics";
import AnalyticsContent from "./AnalyticsContent";
import PerformanceMetrics from "./PerformanceMetrics";
import InstructorDashboard from "./InstructorDashboard";

interface AnalyticsProps {
  analytics: AnalyticsData;
}

const ErrorFallback = memo(({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="p-4 bg-destructive/10 rounded-md">
    <h2 className="text-lg font-semibold mb-2">Something went wrong:</h2>
    <p className="text-sm text-destructive mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
    >
      Try again
    </button>
  </div>
));

function Analytics({ analytics }: AnalyticsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // Force a hard reload to ensure fresh data
          window.location.reload();
        }}
      >
        <AnalyticsContent data={analytics} />
      </ErrorBoundary>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="w-full flex flex-wrap md:flex-nowrap">
          <TabsTrigger value="performance" className="flex-1">Performance Details</TabsTrigger>
          <TabsTrigger value="instructor" className="flex-1">Instructor View</TabsTrigger>
        </TabsList>

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

ErrorFallback.displayName = "ErrorFallback";

export default memo(Analytics);
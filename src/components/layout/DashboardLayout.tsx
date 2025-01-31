import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import type { AnalyticsData } from "../../types/analytics";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <nav className="flex items-center space-x-4">
              <Link to="/practice">
                <span className="text-sm font-medium text-foreground/80 hover:text-primary cursor-pointer">
                  Practice Questions
                </span>
              </Link>
              <Link to="/simulations">
                <span className="text-sm font-medium text-foreground/80 hover:text-primary cursor-pointer">
                  Simulations
                </span>
              </Link>
            </nav>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="w-full justify-start bg-background">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="practice">Practice History</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">{children}</TabsContent>
            <TabsContent value="performance">
              <div className="space-y-4">
                {/* Performance content will be added here */}
              </div>
            </TabsContent>
            <TabsContent value="practice">
              <div className="space-y-4">
                {/* Practice history content will be added here */}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
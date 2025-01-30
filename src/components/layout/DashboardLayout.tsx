import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <nav className="flex items-center space-x-4">
            <Link href="/practice">
              <a className="text-sm font-medium hover:text-primary">Practice Questions</a>
            </Link>
            <Link href="/simulations">
              <a className="text-sm font-medium hover:text-primary">Simulations</a>
            </Link>
          </nav>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="practice">Practice History</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card className="p-6">
              {children}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

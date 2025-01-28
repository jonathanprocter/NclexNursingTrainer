import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Brain, PenSquare } from "lucide-react";

interface Module {
  id: number;
  title: string;
  description: string | null;
  type: string;
  orderIndex: number;
}

const moduleIcons = {
  pharmacology: BookOpen,
  fundamentals: Brain,
  assessment: PenSquare,
};

export default function Modules() {
  const { data: modules, isLoading } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
  });

  if (isLoading) {
    return <div>Loading modules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">NCLEX Study Modules</h1>
        <p className="text-muted-foreground">
          Master essential nursing concepts through our comprehensive modules
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules?.map((module) => {
          const Icon = moduleIcons[module.type as keyof typeof moduleIcons] || BookOpen;
          
          return (
            <Card key={module.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                <div className="space-y-4">
                  <Progress value={0} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">0% Complete</span>
                    <Link href={`/modules/${module.id}`}>
                      <Button>Start Learning</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

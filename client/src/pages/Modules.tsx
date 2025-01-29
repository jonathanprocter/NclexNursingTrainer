import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Brain, PenSquare, Beaker, Heart, Stethoscope } from "lucide-react";

interface Module {
  id: number;
  title: string;
  description: string | null;
  type: string;
  orderIndex: number;
}

const moduleIcons = {
  pharmacology: Beaker,
  pathophysiology: Heart,
  assessment: Stethoscope,
  fundamentals: Brain,
  psychiatric: PenSquare,
  medicalsurgical: BookOpen,
};

const mockModules = [
  {
    id: 1,
    title: "Pharmacology",
    description: "Master drug classifications, mechanisms of action, and nursing implications. Covers common medications, side effects, and patient education.",
    type: "pharmacology",
    orderIndex: 1,
  },
  {
    id: 2,
    title: "Advanced Pathophysiology",
    description: "Deep dive into disease processes, manifestations, and complications across body systems. Essential for clinical reasoning.",
    type: "pathophysiology",
    orderIndex: 2,
  },
  {
    id: 3,
    title: "Health Assessment",
    description: "Learn systematic assessment techniques, normal vs. abnormal findings, and documentation. Includes physical examination and interviewing skills.",
    type: "assessment",
    orderIndex: 3,
  },
  {
    id: 4,
    title: "Nursing Fundamentals",
    description: "Core nursing concepts, procedures, and patient care. Covers safety, comfort measures, and basic nursing interventions.",
    type: "fundamentals",
    orderIndex: 4,
  },
  {
    id: 5,
    title: "Psychiatric Nursing",
    description: "Mental health concepts, therapeutic communication, and psychiatric disorders. Focus on assessment and interventions.",
    type: "psychiatric",
    orderIndex: 5,
  },
  {
    id: 6,
    title: "Medical-Surgical Nursing",
    description: "Comprehensive coverage of adult health nursing, acute and chronic conditions, and evidence-based practices.",
    type: "medicalsurgical",
    orderIndex: 6,
  },
];

// Placeholder for the AIHelpButton component.  Replace with actual implementation.
const AIHelpButton = ({ title, description, topic }: { title: string; description: string; topic: string }) => (
  <Button variant="ghost">AI Help</Button>
);


export default function Modules() {
  const { data: modules, isLoading } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
    initialData: mockModules,
  });

  if (isLoading) {
    return <div>Loading modules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">NCLEX Study Modules</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master essential nursing concepts through our comprehensive modules. Each module is designed to build your knowledge and confidence for the NCLEX exam.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules?.map((module) => {
          const Icon = moduleIcons[module.type as keyof typeof moduleIcons] || BookOpen;

          return (
            <Card key={module.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{module.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course Progress</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm">
                      <p className="font-medium">0/10</p>
                      <p className="text-muted-foreground">Units completed</p>
                    </div>
                    <div className="flex gap-2">
                      <AIHelpButton
                        title={module.title}
                        description={`Get AI assistance with ${module.title.toLowerCase()} concepts and topics.`}
                        topic={module.type}
                      />
                      <Link href={`/modules/${module.id}`}>
                        <Button>Start Learning</Button>
                      </Link>
                    </div>
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
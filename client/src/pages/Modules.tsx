import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BookOpen,
  Brain,
  PenSquare,
  Beaker,
  Heart,
  Stethoscope,
} from "lucide-react";
import { AIHelpButton } from "@/components/ui/ai-help-button";

interface Module {
  id: number;
  title: string;
  description: string;
  type: string;
  orderIndex: number;
}

// Map module types to icons
const moduleIcons: Record<string, React.ElementType> = {
  pharmacology: Beaker,
  pathophysiology: Heart,
  assessment: Stethoscope,
  fundamentals: Brain,
  psychiatric: PenSquare,
  medicalsurgical: BookOpen,
};

// Fetch Modules Data (Mock API Call)
const fetchModules = async (): Promise<Module[]> => {
  return [
    {
      id: 1,
      title: "Pharmacology",
      description:
        "Master drug classifications, mechanisms of action, and nursing implications. Covers common medications, side effects, and patient education.",
      type: "pharmacology",
      orderIndex: 1,
    },
    {
      id: 2,
      title: "Advanced Pathophysiology",
      description:
        "Deep dive into disease processes, manifestations, and complications across body systems. Essential for clinical reasoning.",
      type: "pathophysiology",
      orderIndex: 2,
    },
    {
      id: 3,
      title: "Health Assessment",
      description:
        "Learn systematic assessment techniques, normal vs. abnormal findings, and documentation. Includes physical examination and interviewing skills.",
      type: "assessment",
      orderIndex: 3,
    },
    {
      id: 4,
      title: "Nursing Fundamentals",
      description:
        "Covers basic nursing principles, safety measures, infection control, and patient care techniques.",
      type: "fundamentals",
      orderIndex: 4,
    },
  ];
};

export default function Modules() {
  // Fetch module data using React Query
  const {
    data: modules = [],
    error,
    isLoading,
  } = useQuery(["modules"], fetchModules);

  if (isLoading) return <p>Loading modules...</p>;
  if (error) return <p className="text-red-500">Error fetching modules.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Study Modules</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => {
          const Icon = moduleIcons[module.type] || BookOpen;
          return (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-6 h-6 text-primary" />
                  {module.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{module.description}</p>
                <Progress
                  value={(module.orderIndex / modules.length) * 100}
                  className="mt-2"
                />
                <div className="flex justify-between items-center mt-4">
                  <Button asChild>
                    <Link href={`/module/${module.id}`}>Start Module</Link>
                  </Button>
                  <AIHelpButton />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

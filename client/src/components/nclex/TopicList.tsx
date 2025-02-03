
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Activity, Shield, Heart, Users, Hospital } from "lucide-react";
import Link from "next/link";

export default function TopicList() {
  const { data: metrics } = useQuery({
    queryKey: ["performance-metrics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/performance");
      return response.json();
    }
  });

  const topics = [
    {
      id: "clinical-judgment",
      title: "Clinical Judgment",
      icon: Brain,
      progress: metrics?.clinicalJudgment?.progress || 0,
      strength: metrics?.clinicalJudgment?.strength || "Needs Review",
      priority: metrics?.clinicalJudgment?.priority || "High"
    },
    {
      id: "patient-care",
      title: "Patient Care Management",
      icon: Activity,
      progress: metrics?.patientCare?.progress || 0,
      strength: metrics?.patientCare?.strength || "Good",
      priority: metrics?.patientCare?.priority || "Medium"
    },
    {
      id: "safety",
      title: "Safety & Infection Control",
      icon: Shield,
      progress: metrics?.safety?.progress || 0,
      strength: metrics?.safety?.strength || "Strong",
      priority: metrics?.safety?.priority || "Low"
    },
    {
      id: "health-promotion",
      title: "Health Promotion",
      icon: Heart,
      progress: metrics?.healthPromotion?.progress || 0,
      strength: metrics?.healthPromotion?.strength || "Needs Review",
      priority: metrics?.healthPromotion?.priority || "High"
    },
    {
      id: "psychosocial",
      title: "Psychosocial Integrity",
      icon: Users,
      progress: metrics?.psychosocial?.progress || 0,
      strength: metrics?.psychosocial?.strength || "Good",
      priority: metrics?.psychosocial?.priority || "Medium"
    },
    {
      id: "physiological",
      title: "Physiological Adaptation",
      icon: Hospital,
      progress: metrics?.physiological?.progress || 0,
      strength: metrics?.physiological?.strength || "Needs Review",
      priority: metrics?.physiological?.priority || "High"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <Link key={topic.id} href={`/study-guide/${topic.id}`}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <topic.icon className="h-5 w-5" />
                    <h3 className="font-semibold">{topic.title}</h3>
                  </div>
                  <Progress value={topic.progress} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Strength: {topic.strength}</span>
                    <span>Priority: {topic.priority}</span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

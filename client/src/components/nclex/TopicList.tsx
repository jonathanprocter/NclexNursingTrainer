import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Activity, Shield, Heart, Users, Hospital, MessagesSquare, Plus, BookOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";

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
      priority: metrics?.clinicalJudgment?.priority || "High",
      content: [
        {
          subtitle: "Critical Thinking Framework",
          points: [
            "Assessment techniques and data collection",
            "Analysis of clinical manifestations",
            "Care planning and interventions",
            "Evaluation of outcomes"
          ]
        },
        {
          subtitle: "Decision Making Process",
          points: [
            "Prioritization of care",
            "Resource management",
            "Risk-benefit analysis",
            "Evidence-based practice integration"
          ]
        }
      ]
    },
    {
      id: "patient-care",
      title: "Patient Care Management",
      icon: Activity,
      progress: metrics?.patientCare?.progress || 0,
      strength: metrics?.patientCare?.strength || "Good",
      priority: metrics?.patientCare?.priority || "Medium",
      content: [
        {
          subtitle: "Care Coordination",
          points: [
            "Interdisciplinary collaboration",
            "Care transitions management",
            "Patient advocacy",
            "Resource utilization"
          ]
        },
        {
          subtitle: "Treatment Planning",
          points: [
            "Individualized care approaches",
            "Cultural competency",
            "Family-centered care",
            "Documentation requirements"
          ]
        }
      ]
    },
    {
      id: "safety",
      title: "Safety & Infection Control",
      icon: Shield,
      progress: metrics?.safety?.progress || 0,
      strength: metrics?.safety?.strength || "Strong",
      priority: metrics?.safety?.priority || "Low",
      content: [
        {
          subtitle: "Infection Prevention",
          points: [
            "Standard precautions",
            "Transmission-based precautions",
            "Sterile technique",
            "Healthcare-associated infections"
          ]
        },
        {
          subtitle: "Patient Safety",
          points: [
            "Fall prevention",
            "Medication safety",
            "Environmental safety",
            "Emergency preparedness"
          ]
        }
      ]
    }
  ];

  const handleAIHelp = (topicId: string) => {
    console.log("AI help requested for topic:", topicId);
  };

  const handleGenerateContent = (topicId: string) => {
    console.log("Content generation requested for topic:", topicId);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <Card key={topic.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <topic.icon className="h-5 w-5" />
                  <h3 className="font-semibold">{topic.title}</h3>
                </div>
                <Progress value={topic.progress} className="w-20 h-2" />
              </div>

              <Accordion type="single" collapsible>
                {topic.content.map((section, index) => (
                  <AccordionItem key={index} value={`section-${index}`}>
                    <AccordionTrigger>{section.subtitle}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {section.points.map((point, pointIndex) => (
                          <li key={pointIndex} className="text-sm text-muted-foreground">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Strength: {topic.strength}</span>
                  <span>Priority: {topic.priority}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAIHelp(topic.id);
                    }}
                  >
                    <MessagesSquare className="h-4 w-4 mr-2" />
                    Ask AI
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGenerateContent(topic.id);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate More
                  </Button>
                </div>

                <Link to={`/study-guide/topic/${topic.id}`} className="w-full">
                  <Button variant="default" size="sm" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Study Topic
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TopicSection {
  subtitle: string;
  points: string[];
}

interface Topic {
  id: string;
  title: string;
  content: TopicSection[];
}

const topics: Topic[] = [
  {
    id: "safe-care",
    title: "Safe and Effective Care Environment",
    content: [
      {
        subtitle: "Management of Care",
        points: [
          "Advance Directives",
          "Advocacy",
          "Case Management",
          "Client Rights",
          "Confidentiality"
        ]
      },
      {
        subtitle: "Safety and Infection Control",
        points: [
          "Accident Prevention",
          "Error Prevention",
          "Handling Hazardous Materials",
          "Medical and Surgical Asepsis"
        ]
      }
    ]
  },
  // Add more topics as needed
];

export default function StudyGuide() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">NCLEX Study Guide</h1>
        <p className="text-muted-foreground">
          Comprehensive review materials for each exam topic
        </p>
      </div>

      <Tabs defaultValue={topics[0].id} className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-full md:w-auto">
            {topics.map((topic) => (
              <TabsTrigger key={topic.id} value={topic.id} className="min-w-[200px]">
                {topic.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {topics.map((topic) => (
          <TabsContent key={topic.id} value={topic.id} className="space-y-4">
            {topic.content.map((section, idx) => (
              <Card key={`${topic.id}-section-${idx}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.subtitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2">
                    {section.points.map((point, pointIdx) => (
                      <li key={`${topic.id}-point-${pointIdx}`} className="text-muted-foreground">
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => {
                        // AI help functionality will be implemented later
                        console.log('AI help requested for:', section.subtitle);
                      }}
                    >
                      <Brain className="h-4 w-4" />
                      AI Help
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
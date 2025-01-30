import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIHelpButton } from "@/components/ui/ai-help-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const topics = [
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
  // Add more topics
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
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.subtitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2">
                    {section.points.map((point, pointIdx) => (
                      <li key={pointIdx} className="text-muted-foreground">
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <AIHelpButton
                      title={section.subtitle}
                      description={`Get AI assistance with understanding and mastering ${section.subtitle} concepts`}
                      topic={topic.id}
                    />
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
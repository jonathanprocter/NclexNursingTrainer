
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessagesSquare, Plus, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface TopicDetailProps {
  topicId: string;
  title: string;
  content: {
    subtitle: string;
    points: string[];
  }[];
}

export default function TopicDetail({ topicId, title, content }: TopicDetailProps) {
  const [aiContent, setAiContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAIHelp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/topic-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicId })
      });
      const data = await response.json();
      setAiContent(data.content);
    } catch (error) {
      console.error("Error asking AI:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMoreContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicId, existingContent: aiContent })
      });
      const data = await response.json();
      setAiContent(prev => `${prev}\n\n${data.content}`);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="ai-help">AI Help</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            {content.map((section, idx) => (
              <Card key={idx} className="w-full">
                <CardHeader>
                  <CardTitle className="text-lg">{section.subtitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-6 space-y-2">
                    {section.points.map((point, pointIdx) => (
                      <li key={pointIdx} className="text-muted-foreground">{point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ai-help" className="space-y-4">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {aiContent ? (
                  <ReactMarkdown>{aiContent}</ReactMarkdown>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Click 'Ask AI' to get detailed explanations about this topic
                  </p>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Button 
                onClick={handleAIHelp} 
                disabled={isLoading}
                className="flex-1"
              >
                <MessagesSquare className="mr-2 h-4 w-4" />
                Ask AI
              </Button>
              <Button 
                onClick={generateMoreContent} 
                disabled={isLoading || !aiContent}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate More
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

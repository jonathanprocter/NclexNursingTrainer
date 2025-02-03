
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagesSquare, Plus } from "lucide-react";

interface TopicDetailProps {
  topicId: string;
  title: string;
}

export default function TopicDetail({ topicId, title }: TopicDetailProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const askAI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/topic-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicId })
      });
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error("Error asking AI:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicId, existingContent: content })
      });
      const data = await response.json();
      setContent(prev => `${prev}\n\n${data.content}`);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            <div className="prose dark:prose-invert">
              {content || "Click 'Ask AI' to start learning about this topic"}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={askAI} disabled={isLoading}>
                <MessagesSquare className="mr-2 h-4 w-4" />
                Ask AI
              </Button>
              <Button onClick={generateMore} disabled={isLoading || !content}>
                <Plus className="mr-2 h-4 w-4" />
                Generate More
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="practice">
            <div className="text-center py-8">
              Practice questions for this topic will appear here
            </div>
          </TabsContent>
          
          <TabsContent value="resources">
            <div className="text-center py-8">
              Additional learning resources will appear here
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

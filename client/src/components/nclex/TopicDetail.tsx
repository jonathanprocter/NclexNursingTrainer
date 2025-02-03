import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessagesSquare, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const topicContent = {
  "clinical-judgment": {
    title: "Clinical Judgment",
    content: [
      {
        subtitle: "Assessment & Data Collection",
        details: `
# Assessment & Data Collection

## Key Components
- Systematic assessment techniques
- Vital signs interpretation
- Physical examination findings
- Lab value analysis
- Patient history gathering

## Clinical Applications
- Head-to-toe assessment
- Focused assessments
- Documentation requirements
- Critical findings recognition
`
      },
      {
        subtitle: "Analysis & Care Planning",
        details: `
# Analysis & Care Planning

## Decision Making Process
- Prioritization of care
- Evidence-based interventions
- Risk assessment
- Expected outcomes
- Care plan development
`
      }
    ]
  },
  // Add more topics as needed
};

export default function TopicDetail() {
  const { id } = useParams();
  const [aiContent, setAiContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const topic = topicContent[id as keyof typeof topicContent];

  const handleAskAI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/topic-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: id })
      });
      const data = await response.json();
      setAiContent(data.content);
    } catch (error) {
      console.error('Error asking AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: id })
      });
      const data = await response.json();
      setAiContent(prev => `${prev}\n\n${data.content}`);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!topic) {
    return <div>Topic not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{topic.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="ai-help">AI Help</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <div className="space-y-6">
                {topic.content.map((section, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{section.subtitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="prose prose-sm dark:prose-invert">
                          <ReactMarkdown>{section.details}</ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai-help">
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button onClick={handleAskAI} disabled={isLoading} className="flex-1">
                    <MessagesSquare className="mr-2 h-4 w-4" />
                    Ask AI
                  </Button>
                  <Button onClick={handleGenerateMore} disabled={isLoading} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Generate More
                  </Button>
                </div>
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="prose prose-sm dark:prose-invert">
                    {aiContent ? (
                      <ReactMarkdown>{aiContent}</ReactMarkdown>
                    ) : (
                      <p className="text-center text-muted-foreground">
                        Click 'Ask AI' to get detailed explanations about this topic
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
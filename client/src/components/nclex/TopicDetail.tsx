
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessagesSquare, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';

export default function TopicDetail() {
  const { topicId } = useParams();
  const [aiContent, setAiContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const topicContent = {
    "clinical-judgment": {
      title: "Clinical Judgment",
      sections: [
        {
          subtitle: "Critical Thinking Framework",
          content: `
# Critical Thinking in Nursing Practice

## Key Components
- Assessment and Data Collection
- Analysis of Clinical Manifestations
- Care Planning and Interventions
- Evaluation of Outcomes

## Decision Making Process
1. Identify the problem
2. Gather relevant information
3. Generate potential solutions
4. Evaluate alternatives
5. Implement the best solution
6. Monitor outcomes

## Clinical Applications
- Patient assessment techniques
- Diagnostic reasoning
- Evidence-based interventions
- Outcome evaluation methods`
        },
        {
          subtitle: "Patient Care Planning",
          content: `
# Effective Care Planning

## Essential Elements
- Comprehensive assessment
- SMART goals
- Evidence-based interventions
- Outcome measures

## Implementation Strategies
1. Prioritization of care
2. Resource management
3. Risk-benefit analysis
4. Documentation requirements`
        }
      ]
    }
    // Add other topics as needed
  };

  const currentTopic = topicContent[topicId];

  const handleAskAI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/topic-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicId })
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
        body: JSON.stringify({ topic: topicId, existingContent: aiContent })
      });
      const data = await response.json();
      setAiContent(prev => `${prev}\n\n${data.content}`);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentTopic) {
    return <div>Topic not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{currentTopic.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="ai-help">AI Help</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <div className="space-y-6">
                {currentTopic.sections.map((section, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{section.subtitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="prose prose-sm dark:prose-invert">
                          <ReactMarkdown>{section.content}</ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai-help">
              <div className="space-y-4">
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

                <div className="flex gap-2">
                  <Button
                    onClick={handleAskAI}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <MessagesSquare className="mr-2 h-4 w-4" />
                    Ask AI
                  </Button>
                  <Button
                    onClick={handleGenerateMore}
                    disabled={isLoading || !aiContent}
                    className="flex-1"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate More
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { useParams } from 'wouter';
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
- Patient history gathering`
      }
    ]
  }
};

export default function TopicDetail() {
  const params = useParams<{ id: string }>();
  const topicId = params?.id;
  const [aiContent, setAiContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const topic = topicId ? topicContent[topicId as keyof typeof topicContent] : null;

  if (!topic) {
    return <div className="p-4">Topic not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{topic.title}</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
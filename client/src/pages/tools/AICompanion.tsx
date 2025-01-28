import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, History, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from 'react';
import { toast } from "@/components/ui/toast"; // Assuming a toast component exists


export default function AICompanion() {
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);

  const handleMicClick = async () => {
    try {
      if (!microphoneEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Process the audio stream (not implemented here)
        setMicrophoneEnabled(true);
      } else {
        // Stop audio stream (not implemented here)
        setMicrophoneEnabled(false);
      }
    } catch (error) {
      console.warn("Microphone access denied:", error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Voice Study Companion</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your interactive voice-based learning assistant
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice Interaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Ask questions, request explanations, or start practice sessions using your voice.
                </p>

                <div className="flex justify-center gap-4 py-8">
                  <Button size="lg" className="w-16 h-16 rounded-full" onClick={handleMicClick}>
                    {microphoneEnabled ? <StopCircle className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                  </Button>
                  {/*Removed StopCircle button as it's handled by the state*/}
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Try saying: "Explain the pathophysiology of diabetes" or
                    "Start a practice quiz on pharmacology"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  No conversation history yet. Start talking to build your learning journey.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  No recent topics. Your studied topics will appear here.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Study Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pharmacology Review</span>
                  <Badge variant="secondary">Recommended</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Clinical Judgment Practice</span>
                  <Badge variant="secondary">Suggested</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Patient Assessment</span>
                  <Badge variant="secondary">New</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voice Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Questions Asked</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Topics Covered</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Study Time</span>
                  <span className="font-medium">0h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
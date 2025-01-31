import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, History, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export default function AICompanion() {
  const { toast } = useToast();
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const getAIResponse = async (question: string) => {
    try {
      const response = await fetch('/api/ai-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: 'pharmacology',
          context: question.trim(),
          question: question.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error:', errorData);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.content) {
        throw new Error('Invalid response format');
      }

      setAiResponse(data.content);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAiResponse('');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error('Speech recognition not supported');
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setTranscript(transcript);
          if (event.results[0].isFinal) {
            getAIResponse(transcript);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setMicrophoneEnabled(false);
          toast({
            title: "Error",
            description: "Failed to record speech. Please try again.",
            variant: "destructive",
          });
        };

        recognition.onend = () => {
          setMicrophoneEnabled(false);
        };

        setRecognition(recognition);
      }
    } catch (error) {
      console.error('Speech recognition setup error:', error);
      toast({
        title: "Error",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleMicClick = async () => {
    try {
      if (!recognition) {
        toast({
          title: "Error",
          description: "Speech recognition is not supported in your browser.",
          variant: "destructive",
        });
        return;
      }

      if (!microphoneEnabled) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
        setMicrophoneEnabled(true);
      } else {
        recognition.stop();
        setMicrophoneEnabled(false);
      }
    } catch (error) {
      console.error("Microphone access denied:", error);
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
                  <Button 
                    size="lg" 
                    className="w-16 h-16 rounded-full"
                    onClick={handleMicClick}
                  >
                    {microphoneEnabled ? 
                      <StopCircle className="h-8 w-8" /> : 
                      <Mic className="h-8 w-8" />
                    }
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Try saying: "Explain the pathophysiology of diabetes" or
                    "Start a practice quiz on pharmacology"
                  </p>
                  {transcript && (
                    <div className="mt-4 p-3 bg-white rounded">
                      <p className="font-medium">Transcript:</p>
                      <p className="text-sm">{transcript}</p>
                      {aiResponse && (
                        <div className="mt-4">
                          <p className="font-medium">AI Response:</p>
                          <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
                        </div>
                      )}
                    </div>
                  )}
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
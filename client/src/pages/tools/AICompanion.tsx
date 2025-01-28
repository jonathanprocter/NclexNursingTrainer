import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, History, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AICompanion() {
  const [isRecording, setIsRecording] = useState(false);
  const [conversations, setConversations] = useState<Array<{
    question: string;
    answer: string;
    timestamp: Date;
  }>>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        // Here you would typically send this blob to your AI service
        // For now, let's simulate a response
        simulateAIResponse("What are the symptoms of diabetes?");
      };

      mediaRecorder.current.start();
      setIsRecording(true);

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone"
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access microphone. Please check your permissions."
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);

      toast({
        title: "Recording stopped",
        description: "Processing your question..."
      });
    }
  }, [isRecording, toast]);

  const simulateAIResponse = (question: string) => {
    // In a real implementation, this would come from your AI service
    const mockResponse = "Diabetes typically presents with symptoms including increased thirst (polydipsia), frequent urination (polyuria), unexplained weight loss, and fatigue. Other common symptoms include blurred vision, slow-healing wounds, and increased hunger. It's important to consult a healthcare provider if you experience these symptoms.";

    setConversations(prev => [{
      question,
      answer: mockResponse,
      timestamp: new Date()
    }, ...prev]);
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
                    className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                    onClick={startRecording}
                    disabled={isRecording}
                  >
                    <Mic className="h-8 w-8" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-16 h-16 rounded-full"
                    onClick={stopRecording}
                    disabled={!isRecording}
                  >
                    <StopCircle className="h-8 w-8" />
                  </Button>
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
                {conversations.length > 0 ? (
                  conversations.map((conv, index) => (
                    <div key={index} className="space-y-2 border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Question</Badge>
                        <span className="text-sm">{conv.question}</span>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">{conv.answer}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {conv.timestamp.toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    No conversation history yet. Start talking to build your learning journey.
                  </p>
                )}
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
                {conversations.length > 0 ? (
                  <div className="space-y-2">
                    {[...new Set(conversations.slice(0, 5).map(c => c.question))].map((q, i) => (
                      <p key={i} className="text-sm">{q}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No recent topics. Your studied topics will appear here.
                  </p>
                )}
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
                  <span className="font-medium">{conversations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Topics Covered</span>
                  <span className="font-medium">
                    {new Set(conversations.map(c => c.question)).size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Study Time</span>
                  <span className="font-medium">
                    {Math.round(conversations.length * 2)}m
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
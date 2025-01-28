import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, History, Lightbulb, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateDetailedExplanation } from "@/lib/ai/anthropic";
import OpenAI from "openai";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export default function AICompanion() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(false);
  const [conversations, setConversations] = useState<Array<{
    question: string;
    answer: string;
    timestamp: Date;
  }>>([]);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const silenceTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicrophoneAvailable(true);
      } catch (error) {
        console.error('Microphone access error:', error);
        setMicrophoneAvailable(false);
        toast({
          variant: "destructive",
          title: "Microphone Access Required",
          description: "Please enable microphone access in your browser settings"
        });
      }
    };

    if (typeof window !== 'undefined' && navigator?.mediaDevices) {
      checkMicrophoneAccess();
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    if (!microphoneAvailable) {
      toast({
        variant: "destructive",
        title: "Microphone Not Available",
        description: "Please ensure microphone access is enabled"
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          setIsProcessing(true);

          const formData = new FormData();
          formData.append('file', audioBlob);

          // Process audio with OpenAI Whisper
          const transcription = await openai.audio.transcriptions.create({
            file: new File([audioBlob], 'audio.webm', { type: 'audio/webm' }),
            model: "whisper-1"
          });

          if (!transcription.text) {
            throw new Error("Failed to transcribe audio");
          }

          // Get initial response
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
              role: "system",
              content: "You are a helpful NCLEX study assistant."
            }, {
              role: "user",
              content: transcription.text
            }]
          });

          const response = await generateDetailedExplanation({
            topic: transcription.text,
            concept: completion.choices[0].message.content || "",
            difficulty: "medium",
            learningStyle: "comprehensive"
          });

          setConversations(prev => [{
            question: transcription.text,
            answer: response,
            timestamp: new Date()
          }, ...prev]);

        } catch (error) {
          console.error('Error processing audio:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to process recording"
          });
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: "Speak your question clearly"
      });

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access microphone"
      });
    }
  }, [microphoneAvailable, toast]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Voice Study Companion</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your interactive voice-based learning assistant
        </p>
      </div>

      <Dialog>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Voice Interaction</DialogTitle>
          <div className="space-y-4" aria-label="Voice interaction controls">
            {!microphoneAvailable && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">Microphone Access Required</p>
                    <p className="text-sm mt-1">
                      Please enable microphone access in your browser settings
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4 py-8">
              <Button
                size="lg"
                className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                onClick={startRecording}
                disabled={isRecording || isProcessing || !microphoneAvailable}
              >
                <Mic className="h-8 w-8" />
                <VisuallyHidden>Start Recording</VisuallyHidden>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-16 h-16 rounded-full"
                onClick={stopRecording}
                disabled={!isRecording || isProcessing}
              >
                <StopCircle className="h-8 w-8" />
                <VisuallyHidden>Stop Recording</VisuallyHidden>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.map((conv, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Question</Badge>
                      <span>{conv.question}</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">{conv.answer}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {conv.timestamp.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conversations.slice(0, 5).map((conv, index) => (
                  <p key={index} className="text-sm">{conv.question}</p>
                ))}
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
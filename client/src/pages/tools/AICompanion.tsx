import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, History, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateDetailedExplanation } from "@/lib/ai/anthropic";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export default function AICompanion() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    return () => {
      // Cleanup on component unmount
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const checkForSilence = useCallback((dataArray: Uint8Array) => {
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    if (average < 5) { // Threshold for silence
      if (silenceTimeout.current === null) {
        silenceTimeout.current = setTimeout(() => {
          stopRecording();
        }, 2000); // Stop after 2 seconds of silence
      }
    } else {
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
        silenceTimeout.current = null;
      }
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio context and analyzer for silence detection
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      analyser.current.fftSize = 256;

      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Start monitoring audio levels
      const checkAudioLevel = () => {
        if (analyser.current && isRecording) {
          analyser.current.getByteFrequencyData(dataArray);
          checkForSilence(dataArray);
          requestAnimationFrame(checkAudioLevel);
        }
      };

      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true);
        try {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });

          toast({
            title: "Processing",
            description: "Transcribing your question..."
          });

          // Transcribe audio using Whisper
          const transcription = await openai.audio.transcriptions.create({
            model: "whisper-1",
            file: new File([audioBlob], 'audio.webm', { type: 'audio/webm' })
          });

          if (!transcription.text) {
            throw new Error("Failed to transcribe audio");
          }

          toast({
            title: "Processing",
            description: "Generating response..."
          });

          // Generate initial response using GPT-4
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a knowledgeable nursing assistant helping students prepare for the NCLEX exam. Provide accurate, concise medical information."
              },
              {
                role: "user",
                content: transcription.text
              }
            ]
          });

          const initialResponse = completion.choices[0].message.content;

          // Get detailed explanation from Claude
          const detailedResponse = await generateDetailedExplanation({
            topic: transcription.text,
            concept: initialResponse || "",
            difficulty: "medium",
            learningStyle: "comprehensive"
          });

          setConversations(prev => [{
            question: transcription.text,
            answer: detailedResponse,
            timestamp: new Date()
          }, ...prev]);

          toast({
            title: "Success",
            description: "Response generated successfully"
          });

        } catch (error) {
          console.error('Error processing audio:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to process your question. Please try again."
          });
        } finally {
          setIsProcessing(false);
          if (audioContext.current) {
            audioContext.current.close();
            audioContext.current = null;
          }
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      checkAudioLevel();

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone. Recording will stop automatically after 2 seconds of silence."
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access microphone. Please check your permissions."
      });
    }
  }, [toast, isRecording, checkForSilence]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      if (silenceTimeout.current) {
        clearTimeout(silenceTimeout.current);
        silenceTimeout.current = null;
      }

      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);

      toast({
        title: "Recording stopped",
        description: "Processing your question..."
      });
    }
  }, [isRecording, toast]);

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
                    disabled={isRecording || isProcessing}
                  >
                    <Mic className="h-8 w-8" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-16 h-16 rounded-full"
                    onClick={stopRecording}
                    disabled={!isRecording || isProcessing}
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
                        <p className="text-sm whitespace-pre-wrap">{conv.answer}</p>
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
                    {Array.from(new Set(conversations.slice(0, 5).map(c => c.question))).map((q, i) => (
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
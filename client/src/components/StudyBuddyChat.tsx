import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Mic, MicOff } from "lucide-react";
import { ToneSelector } from "./ToneSelector";
import type { StudyBuddyTone } from "./ToneSelector";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message?: string;
}

export function StudyBuddyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<StudyBuddyTone>("professional");
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Mock student ID for now - in a real app this would come from auth context
  const studentId = 1;

  const startSession = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch("/api/study-buddy/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            tone: selectedTone,
            topic: "NCLEX preparation"
          }),
        });
        if (!response.ok) throw new Error("Failed to start session");
        return response.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start study session. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.message,
        timestamp: new Date()
      }]);
    }
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      try {
        const response = await fetch("/api/study-buddy/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            sessionId,
            message,
            context: {
              tone: selectedTone,
              recentMessages: messages.slice(-3)
            }
          }),
        });
        if (!response.ok) throw new Error("Failed to send message");
        return response.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.message,
        timestamp: new Date()
      }]);
    }
  });

  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Error",
          description: `Speech recognition error: ${event.message || event.error}`,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    sendMessage.mutate(input);
  };

  const toggleVoiceInput = async () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome for this feature.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!isListening) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: "Listening",
          description: "Speak now...",
        });
      } else {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    } catch (error) {
      console.error("Microphone access error:", error);
      toast({
        title: "Error",
        description: "Unable to access microphone. Please check your permissions.",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };

  // Start session on component mount
  useEffect(() => {
    if (!sessionId) {
      startSession.mutate();
    }
  }, [sessionId]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b flex justify-between items-center">
        <ToneSelector
          selectedTone={selectedTone}
          onToneChange={setSelectedTone}
        />
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-50">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {(startSession.isPending || sendMessage.isPending) && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about NCLEX..."
            disabled={startSession.isPending || sendMessage.isPending}
          />
          <Button
            type="submit"
            disabled={startSession.isPending || sendMessage.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={toggleVoiceInput}
            className={`relative ${isListening ? 'bg-primary text-primary-foreground' : ''}`}
          >
            {isListening ? (
              <Mic className="h-4 w-4 animate-pulse" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isListening ? "Stop recording" : "Start recording"}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}
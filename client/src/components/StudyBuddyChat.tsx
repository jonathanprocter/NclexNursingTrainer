import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Mic, MicOff } from "lucide-react";
import { ToneSelector } from "./ToneSelector";
import type { StudyBuddyTone } from "./ToneSelector";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface StudyBuddyChatProps {
  isListening?: boolean;
  onVoiceInputToggle?: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface StudyBuddyChatHandle {
  handleVoiceInput: (transcript: string) => void;
}

export const StudyBuddyChat = forwardRef<StudyBuddyChatHandle, StudyBuddyChatProps>(
  ({ isListening = false, onVoiceInputToggle }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [selectedTone, setSelectedTone] = useState<StudyBuddyTone>("professional");
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

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

    useEffect(() => {
      if (!sessionId) {
        startSession.mutate();
      }
    }, []);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages]);

    useEffect(() => {
      if (isListening) {
        inputRef.current?.blur();
      } else {
        inputRef.current?.focus();
      }
    }, [isListening]);

    const sendMessage = useMutation({
      mutationFn: async (message: string) => {
        if (!message.trim()) return null;

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
      },
      onSuccess: (data) => {
        if (!data) return;

        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.message,
          timestamp: new Date()
        }]);
        setInput("");

        if (!isListening) {
          inputRef.current?.focus();
        }
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    });

    useImperativeHandle(ref, () => ({
      handleVoiceInput: async (transcript: string) => {
        try {
          if (!transcript.trim()) return;

          const userMessage = {
            role: "user" as const,
            content: transcript,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, userMessage]);
          sendMessage.mutate(transcript);
        } catch (error) {
          console.error('Microphone error:', error);
          alert('Please enable microphone access to use voice input');
        }
      }
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const userMessage = {
        role: "user" as const,
        content: input,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      sendMessage.mutate(input);
      setInput("");
    };

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
                  <div className="prose prose-sm dark:prose-invert">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <span className="text-xs opacity-50 block mt-1">
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
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about NCLEX..."
              disabled={isListening || startSession.isPending || sendMessage.isPending}
              aria-label="Type your message"
            />
            <Button
              type="submit"
              disabled={isListening || startSession.isPending || sendMessage.isPending}
              title="Send message"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onVoiceInputToggle}
              disabled={startSession.isPending || sendMessage.isPending}
              className={isListening ? "text-primary" : ""}
              title={isListening ? "Stop recording" : "Start recording"}
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
);

StudyBuddyChat.displayName = "StudyBuddyChat";
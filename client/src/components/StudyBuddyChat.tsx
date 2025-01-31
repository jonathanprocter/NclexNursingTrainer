import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { ToneSelector } from "./ToneSelector";
import type { StudyBuddyTone } from "./ToneSelector";
import { useToast } from "@/hooks/use-toast";

interface StudyBuddyChatProps {
  isListening?: boolean;
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
  ({ isListening = false }, ref) => {
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
        setInput("");

        // Focus the input field after sending a message
        if (!isListening) {
          inputRef.current?.focus();
        }
      }
    });

    useEffect(() => {
      // Start session on component mount
      if (!sessionId) {
        startSession.mutate();
      }
    }, []);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages]);

    // Handle voice input state changes
    useEffect(() => {
      if (isListening) {
        // Blur input field when voice input is active
        inputRef.current?.blur();
      } else {
        // Focus input field when voice input ends
        inputRef.current?.focus();
      }
    }, [isListening]);

    // Expose handleVoiceInput method to parent
    useImperativeHandle(ref, () => ({
      handleVoiceInput: (transcript: string) => {
        if (!transcript.trim()) return;

        const userMessage = {
          role: "user" as const,
          content: transcript,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        sendMessage.mutate(transcript);
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
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      // Submit on Enter (without Shift)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
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
            {isListening && (
              <div className="flex justify-center">
                <div className="bg-primary/10 rounded-lg px-4 py-2 animate-pulse">
                  Listening...
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
              onKeyPress={handleKeyPress}
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
          </div>
        </form>
      </div>
    );
  }
);

StudyBuddyChat.displayName = "StudyBuddyChat";
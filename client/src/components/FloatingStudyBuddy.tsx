import { useState, useRef, useEffect } from "react";
import { StudyBuddyChat, type StudyBuddyChatHandle } from "./StudyBuddyChat";
import { Button } from "@/components/ui/button";
import { X, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function FloatingStudyBuddy() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  const [isBrowserSupported, setIsBrowserSupported] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatComponentRef = useRef<StudyBuddyChatHandle>(null);

  // Check browser support on mount
  useEffect(() => {
    const isSupported = !!(window.webkitSpeechRecognition || window.SpeechRecognition);
    setIsBrowserSupported(isSupported);

    if (!isSupported) {
      toast({
        title: "Browser Not Supported",
        description: "Voice recognition requires Chrome or Edge browser.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Initialize speech recognition
  useEffect(() => {
    if (!isBrowserSupported) return;

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Voice Input Active",
        description: "Speak your message...",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscriptBuffer("");
      toast({
        title: "Voice Input Ended",
        description: "Click the microphone icon to speak again.",
      });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      try {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');

        setTranscriptBuffer(transcript);

        // If this is a final result, trigger the chat input
        if (event.results[event.results.length - 1].isFinal) {
          chatComponentRef.current?.handleVoiceInput(transcript);
          setTranscriptBuffer("");
        }
      } catch (error) {
        console.error("Speech recognition result error:", error);
        toast({
          title: "Error",
          description: "Failed to process voice input. Please try again.",
          variant: "destructive",
        });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setTranscriptBuffer("");

      const errorMessages: Record<string, string> = {
        'not-allowed': "Microphone access denied. Please check your browser permissions.",
        'network': "Network error occurred. Please check your internet connection.",
        'no-speech': "No speech detected. Please try speaking again.",
        'aborted': "Voice input was aborted.",
      };

      toast({
        title: "Error",
        description: errorMessages[event.error] || `Speech recognition error: ${event.message || event.error}`,
        variant: "destructive",
      });
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isBrowserSupported, toast]);

  const toggleVoiceInput = async () => {
    if (!isBrowserSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!isListening) {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Release the stream immediately

        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } else {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
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

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 20 }}
            className="mr-4"
          >
            <div className="bg-card border rounded-lg shadow-lg w-[400px] h-[600px] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label="bee">🐝</span>
                  Bee Wise
                </h2>
                <div className="flex items-center gap-2">
                  {isBrowserSupported && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleVoiceInput}
                      className={cn(
                        "relative",
                        isListening && "text-primary"
                      )}
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
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    title="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <StudyBuddyChat 
                  ref={chatComponentRef}
                  isListening={isListening}
                />
              </div>
              {isListening && transcriptBuffer && (
                <div className="px-4 py-2 bg-primary/5 border-t">
                  <p className="text-sm text-muted-foreground">
                    {transcriptBuffer}...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "rounded-full w-12 h-12 shadow-lg transition-colors duration-200",
          isOpen ? "bg-yellow-500/10 hover:bg-yellow-500/20" : "bg-yellow-500 hover:bg-yellow-600"
        )}
        variant={isOpen ? "ghost" : "default"}
        title={isOpen ? "Hide Bee Wise" : "Show Bee Wise"}
      >
        <span 
          className={cn(
            "text-xl",
            isOpen ? "text-yellow-600" : "text-white"
          )} 
          role="img" 
          aria-label="bee"
        >
          🐝
        </span>
      </Button>
    </div>
  );
}
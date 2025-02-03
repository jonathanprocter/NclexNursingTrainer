
import { Bot } from "lucide-react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { useState } from "react";
import { ScrollArea } from "./scroll-area";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

interface AIFeedbackButtonProps {
  topic: string;
  context?: string;
  buttonText?: string;
  variant?: "default" | "outline" | "secondary";
}

export function AIFeedbackButton({ 
  topic, 
  context, 
  buttonText = "Get AI Feedback",
  variant = "outline" 
}: AIFeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, context })
      });
      const data = await response.json();
      setContent(data.content);
      setOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant={variant}
        size="sm"
        onClick={handleFeedback}
        disabled={isLoading}
        className="gap-2"
      >
        <Bot className="h-4 w-4" />
        {buttonText}
      </Button>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Feedback - {topic}</DialogTitle>
          <DialogDescription>Get instant AI assistance and feedback</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

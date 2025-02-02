import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getPharmacologyHelp } from "@/lib/ai-services";

interface AIHelpButtonProps {
  title: string;
  description: string;
  topic: string;
  context?: string;
}

export function AIHelpButton({ title, description, topic, context }: AIHelpButtonProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAIHelp = async () => {
    setIsLoading(true);
    try {
      const response = await getPharmacologyHelp(topic, context);
      setContent(response.content);
      setOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI assistance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAIHelp}
          disabled={isLoading}
          className="gap-2"
        >
          <Brain className="h-4 w-4" />
          AI Help
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
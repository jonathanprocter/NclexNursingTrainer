function ai-help-button() {
  return null;
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Send, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast"; // Ensure this hook is properly implemented

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIHelpButtonProps {
  title: string;
  description: string;
  topic: string;
}

export function AIHelpButton({ title, description, topic }: AIHelpButtonProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); // Ensure toast is available

  // Function to Export Messages as a Text File
  const handleExport = () => {
    if (messages.length === 0) return;

    const content = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");

    const fileName = `${topic.toLowerCase().replace(/\s+/g, "_")}_ai_help.txt`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });

    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Success",
      description: "Content exported successfully!",
      duration: 3000,
    });
  };

  // Function to Handle User Input Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/risk-reduction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, question: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Brain className="h-4 w-4" />
          AI Help
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export Button */}
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={messages.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Chat Messages Display */}
          <ScrollArea className="h-[400px] pr-4">
            {messages.length === 0 ? (
              <div className="text-sm">
                <p>Ask me anything about {topic}, such as:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Understanding evidence-based safety protocols</li>
                  <li>Implementation strategies for safety measures</li>
                  <li>Risk assessment techniques</li>
                  <li>Best practices for patient safety</li>
                </ul>
              </div>
            ) : (
              messages.map((message, i) => (
                <div
                  key={`message-${i}`}
                  className={`mb-4 ${
                    message.role === "assistant"
                      ? "bg-muted p-4 rounded-lg"
                      : "border-l-4 border-primary pl-3"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>

          {/* Input Field */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default ai-help-button;

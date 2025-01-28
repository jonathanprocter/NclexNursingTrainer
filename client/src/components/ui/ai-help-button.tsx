import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AIHelpButtonProps {
  title: string;
  description: string;
  topic: string;
}

export function AIHelpButton({ title, description, topic }: AIHelpButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Brain className="h-4 w-4" />
          AI Help
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm">
            <p>Ask me anything about {topic}, such as:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Clarification on concepts</li>
              <li>Real-world applications</li>
              <li>NCLEX-style question breakdowns</li>
              <li>Evidence-based practices</li>
            </ul>
          </div>
          {/* AI chat interface will be implemented here */}
          <p className="text-sm text-muted-foreground">
            Coming soon: Interactive AI assistance for personalized learning
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

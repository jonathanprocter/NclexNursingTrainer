import { useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export type StudyBuddyTone = 
  | "professional" 
  | "friendly" 
  | "socratic" 
  | "encouraging";

interface ToneSelectorProps {
  selectedTone: StudyBuddyTone;
  onToneChange: (tone: StudyBuddyTone) => void;
}

const toneOptions: Array<{
  value: StudyBuddyTone;
  label: string;
  description: string;
}> = [
  {
    value: "professional",
    label: "Professional",
    description: "Clear and concise explanations with clinical focus"
  },
  {
    value: "friendly",
    label: "Friendly",
    description: "Casual and supportive learning environment"
  },
  {
    value: "socratic",
    label: "Socratic",
    description: "Guided discovery through thoughtful questions"
  },
  {
    value: "encouraging",
    label: "Encouraging",
    description: "Extra motivation and positive reinforcement"
  }
];

export function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        {toneOptions.find(t => t.value === selectedTone)?.label || "Select Tone"}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 p-2 w-64 z-50">
          <div className="space-y-1">
            {toneOptions.map((tone) => (
              <motion.button
                key={tone.value}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  onToneChange(tone.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start p-2 text-left rounded-lg hover:bg-accent group ${
                  selectedTone === tone.value ? "bg-accent" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tone.label}</span>
                    {selectedTone === tone.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tone.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

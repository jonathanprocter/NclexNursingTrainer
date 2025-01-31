import { useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { cn } from "../lib/utils";

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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={false}
          className="gap-2 w-[180px] justify-start"
          aria-label="Select chat tone"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="truncate">
            {toneOptions.find(t => t.value === selectedTone)?.label || "Select Tone"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-2" align="start">
        <div className="space-y-1">
          {toneOptions.map((tone) => (
            <button
              key={tone.value}
              onClick={() => onToneChange(tone.value)}
              className={cn(
                "w-full flex items-start p-2 text-left rounded-lg hover:bg-accent transition-colors",
                selectedTone === tone.value ? "bg-accent" : "bg-background"
              )}
              role="option"
              aria-selected={selectedTone === tone.value}
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
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
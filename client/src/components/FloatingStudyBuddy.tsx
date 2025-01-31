import { useState } from "react";
import { StudyBuddyChat } from "./StudyBuddyChat";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import * as React from "react";

export function FloatingStudyBuddy() {
  const [isOpen, setIsOpen] = useState(false);

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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <StudyBuddyChat />
              </div>
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
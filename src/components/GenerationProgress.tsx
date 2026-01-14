import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Layers } from "lucide-react";

interface GenerationProgressProps {
  type: "explanation" | "flashcards";
  className?: string;
}

const messages = {
  explanation: [
    "Understanding your topic...",
    "Breaking it down...",
    "Making it clear...",
    "Almost there...",
  ],
  flashcards: [
    "Analyzing the concept...",
    "Creating questions...",
    "Crafting answers...",
    "Finalizing cards...",
  ],
};

const GenerationProgress: React.FC<GenerationProgressProps> = ({ 
  type, 
  className 
}) => {
  const [messageIndex, setMessageIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const typeMessages = messages[type];
  
  // Cycle through messages
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % typeMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [typeMessages.length]);

  // Animate progress bar
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const Icon = type === "explanation" ? Sparkles : Layers;

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Generating ${type}`}
    >
      {/* Icon with animation */}
      <motion.div
        className="mb-6"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-6">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Message with fade animation */}
      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-body-lg text-muted-foreground"
      >
        {typeMessages[messageIndex]}
      </motion.p>

      {/* Assistive text */}
      <span className="sr-only">
        Please wait while we generate your {type}
      </span>
    </div>
  );
};

export { GenerationProgress };

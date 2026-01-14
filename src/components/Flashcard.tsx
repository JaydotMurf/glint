import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

const Flashcard: React.FC<FlashcardProps> = ({
  front,
  back,
  isFlipped,
  onFlip,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative w-full aspect-[4/3] cursor-pointer perspective-1000",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:rounded-3xl",
        className
      )}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFlip();
        }
      }}
      style={{ perspective: "1000px" }}
      tabIndex={0}
      role="button"
      aria-pressed={isFlipped}
      aria-label={isFlipped ? `Answer: ${back}` : `Question: ${front}. Press to reveal answer.`}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.4, 0, 0.2, 1],
          type: "tween"
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front */}
        <div
          className={cn(
            "absolute inset-0 bg-flashcard rounded-3xl border border-border shadow-elevated p-8 flex items-center justify-center",
            "transition-shadow duration-200 hover:shadow-glow-primary"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center">
            <p className="text-small text-muted-foreground mb-3 uppercase tracking-wide">
              Question
            </p>
            <p className="text-heading text-flashcard-foreground leading-relaxed">
              {front}
            </p>
            <p className="text-caption text-muted-foreground mt-6">
              Tap to reveal answer
            </p>
          </div>
        </div>

        {/* Back */}
        <div
          className={cn(
            "absolute inset-0 bg-card rounded-3xl border border-primary/20 shadow-elevated p-8 flex items-center justify-center",
            "transition-shadow duration-200 hover:shadow-glow-success"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-center">
            <p className="text-small text-primary mb-3 uppercase tracking-wide font-medium">
              Answer
            </p>
            <p className="text-body-lg text-card-foreground leading-relaxed">
              {back}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { Flashcard };

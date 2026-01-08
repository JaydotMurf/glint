import * as React from "react";
import { cn } from "@/lib/utils";

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
        className
      )}
      onClick={onFlip}
      style={{ perspective: "1000px" }}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500 ease-out",
          "preserve-3d"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-flashcard rounded-3xl border border-border shadow-elevated p-8 flex items-center justify-center backface-hidden"
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
          className="absolute inset-0 bg-card rounded-3xl border border-primary/20 shadow-elevated p-8 flex items-center justify-center"
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
      </div>
    </div>
  );
};

export { Flashcard };

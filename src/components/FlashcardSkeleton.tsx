import * as React from "react";
import { cn } from "@/lib/utils";

interface FlashcardSkeletonProps {
  className?: string;
}

const FlashcardSkeleton: React.FC<FlashcardSkeletonProps> = ({ className }) => {
  return (
    <div 
      className={cn("animate-pulse", className)}
      role="status"
      aria-label="Loading flashcard"
    >
      {/* Card skeleton */}
      <div className="w-full aspect-[4/3] bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center">
        <div className="h-3 w-16 bg-muted rounded-md mb-4" />
        <div className="space-y-3 w-full max-w-xs">
          <div className="h-5 w-full bg-muted rounded-md mx-auto" />
          <div className="h-5 w-4/5 bg-muted rounded-md mx-auto" />
        </div>
        <div className="h-3 w-32 bg-muted rounded-md mt-6" />
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading flashcard content...</span>
    </div>
  );
};

export { FlashcardSkeleton };

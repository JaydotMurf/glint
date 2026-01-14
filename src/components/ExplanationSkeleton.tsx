import * as React from "react";
import { cn } from "@/lib/utils";

interface ExplanationSkeletonProps {
  className?: string;
}

const ExplanationSkeleton: React.FC<ExplanationSkeletonProps> = ({ className }) => {
  return (
    <div 
      className={cn("animate-pulse space-y-6", className)}
      role="status"
      aria-label="Loading explanation"
    >
      {/* Topic skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-20 bg-muted rounded-md" />
        <div className="h-8 w-3/4 bg-muted rounded-lg" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        <div className="h-10 w-24 bg-muted rounded-xl" />
        <div className="h-10 w-24 bg-muted rounded-xl" />
        <div className="h-10 w-28 bg-muted rounded-xl" />
      </div>

      {/* Card skeleton */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted rounded-lg" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted rounded-md" />
          <div className="h-4 w-5/6 bg-muted rounded-md" />
          <div className="h-4 w-4/6 bg-muted rounded-md" />
          <div className="h-4 w-full bg-muted rounded-md" />
          <div className="h-4 w-3/4 bg-muted rounded-md" />
        </div>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading explanation content...</span>
    </div>
  );
};

export { ExplanationSkeleton };

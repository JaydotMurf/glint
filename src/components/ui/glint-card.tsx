import * as React from "react";
import { cn } from "@/lib/utils";

interface GlintCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flashcard" | "concept" | "glass" | "feature";
}

const GlintCard = React.forwardRef<HTMLDivElement, GlintCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300",
          {
            // Default card with subtle hover
            "bg-card/80 backdrop-blur-sm border border-border p-6 shadow-card hover:shadow-medium hover:border-border-medium hover:translate-y-[-2px]":
              variant === "default",
            
            // Elevated card with stronger shadow
            "bg-card border border-border p-6 shadow-elevated hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] hover:translate-y-[-4px]":
              variant === "elevated",
            
            // Flashcard with premium gradient
            "bg-gradient-to-br from-flashcard to-card border border-border p-8 shadow-elevated rounded-3xl":
              variant === "flashcard",
            
            // Concept card for library items
            "bg-card/60 backdrop-blur-sm border border-border p-5 shadow-sm hover:shadow-card hover:border-border-medium hover:bg-card cursor-pointer hover:translate-y-[-2px]":
              variant === "concept",
            
            // Glass morphism card
            "bg-card/40 backdrop-blur-xl border border-white/10 p-6 shadow-soft":
              variant === "glass",
            
            // Feature card with gradient hover
            "relative bg-card/50 backdrop-blur-sm border border-border p-6 hover:border-primary/30 hover:shadow-lg overflow-hidden":
              variant === "feature",
          },
          className
        )}
        {...props}
      />
    );
  }
);

GlintCard.displayName = "GlintCard";

export { GlintCard };

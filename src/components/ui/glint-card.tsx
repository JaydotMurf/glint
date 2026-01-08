import * as React from "react";
import { cn } from "@/lib/utils";

interface GlintCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flashcard" | "concept";
}

const GlintCard = React.forwardRef<HTMLDivElement, GlintCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-200",
          {
            "bg-card border border-border p-6 shadow-card hover:shadow-soft hover:border-border-medium":
              variant === "default",
            "bg-card border border-border p-6 shadow-elevated":
              variant === "elevated",
            "bg-flashcard border border-border p-8 shadow-elevated rounded-3xl":
              variant === "flashcard",
            "bg-card border border-border p-5 shadow-sm hover:shadow-card hover:border-border-medium cursor-pointer":
              variant === "concept",
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

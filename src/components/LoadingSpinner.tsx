import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  message,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div
        className={cn(
          "rounded-full border-primary/20 border-t-primary animate-spin",
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="text-body text-muted-foreground animate-pulse-soft">
          {message}
        </p>
      )}
    </div>
  );
};

export { LoadingSpinner };

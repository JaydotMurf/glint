import * as React from "react";
import { cn } from "@/lib/utils";

interface SkipToContentProps {
  targetId?: string;
  className?: string;
}

const SkipToContent: React.FC<SkipToContentProps> = ({ 
  targetId = "main-content",
  className 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        "sr-only focus:not-sr-only",
        "fixed top-4 left-4 z-[100]",
        "px-4 py-2 bg-primary text-primary-foreground",
        "rounded-lg text-sm font-medium",
        "focus:outline-none focus:ring-4 focus:ring-primary/30",
        "transition-transform duration-200",
        className
      )}
    >
      Skip to content
    </a>
  );
};

export { SkipToContent };

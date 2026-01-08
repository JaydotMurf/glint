import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className, showIcon = true }) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <div className="relative">
          <Sparkles className={cn("text-primary", iconSizes[size])} />
          <div className="absolute inset-0 blur-sm opacity-50">
            <Sparkles className={cn("text-primary", iconSizes[size])} />
          </div>
        </div>
      )}
      <span
        className={cn(
          "font-bold tracking-tight text-foreground",
          sizeClasses[size]
        )}
      >
        Glint
      </span>
    </div>
  );
};

export { Logo };

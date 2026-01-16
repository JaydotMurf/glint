import * as React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "gradient";
}

const Logo: React.FC<LogoProps> = ({ 
  size = "md", 
  className, 
  showIcon = true,
  variant = "default" 
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  const iconContainerSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {showIcon && (
        <div 
          className={cn(
            "relative flex items-center justify-center rounded-xl",
            "bg-gradient-to-br from-primary to-purple-500",
            "shadow-glow-primary",
            iconContainerSizes[size]
          )}
        >
          <Sparkles className={cn("text-white", iconSizes[size])} />
          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      <span
        className={cn(
          "font-bold tracking-tight",
          variant === "gradient" 
            ? "bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent"
            : "text-foreground",
          sizeClasses[size]
        )}
      >
        Glint
      </span>
    </div>
  );
};

export { Logo };

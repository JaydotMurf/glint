import * as React from "react";
import { cn } from "@/lib/utils";

interface GlintProgressProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

const GlintProgress: React.FC<GlintProgressProps> = ({
  value,
  max,
  className,
  showLabel = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 glint-progress">
        <div
          className="glint-progress-bar"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground min-w-[3rem] text-right">
          {value}/{max}
        </span>
      )}
    </div>
  );
};

export { GlintProgress };

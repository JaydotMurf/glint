import * as React from "react";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";
import { parseExplanation } from "@/utils/parseExplanation";

interface EnhancedExplanationProps extends React.HTMLAttributes<HTMLDivElement> {
  level: "simplest" | "standard" | "deepDive";
  content: string;
}

const EnhancedExplanation = React.forwardRef<HTMLDivElement, EnhancedExplanationProps>(
  ({ className, level, content, ...props }, ref) => {
    const parsed = useMemo(() => parseExplanation(content), [content]);
    const hasStructuredContent = parsed.steps.length > 0;

    const levelConfig: Record<EnhancedExplanationProps["level"], { icon: string; label: string }> = {
      simplest: { icon: "🧩", label: "Simplest Explanation" },
      standard: { icon: "📚", label: "Standard Explanation" },
      deepDive: { icon: "🔬", label: "Deep Dive" },
    };

    const config = levelConfig[level];

    return (
      <div
        ref={ref}
        className={cn("bg-card rounded-xl border border-border p-5 md:p-6", className)}
        style={{ maxWidth: "680px", margin: "0 auto" }}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <span className="text-2xl">{config.icon}</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {config.label}
          </span>
        </div>

        {/* Lead / Intro */}
        {parsed.intro && (
          <div className="lead-statement mb-6">
            <ReactMarkdown>{parsed.intro}</ReactMarkdown>
          </div>
        )}

        {/* Steps OR plain markdown */}
        {hasStructuredContent ? (
          <ol className="space-y-3.5 mb-6">
            {parsed.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="step-badge" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="flex-1 text-reading">
                  <span className="font-semibold text-foreground">{step.title}</span>
                  {step.description ? (
                    <span className="text-muted-foreground">{" — "}{step.description}</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-reading">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        {/* Remainder */}
        {parsed.remainder && (
          <div className={cn("text-reading", hasStructuredContent ? "mb-6" : "mt-4")}> 
            <ReactMarkdown>{parsed.remainder}</ReactMarkdown>
          </div>
        )}

        {/* Key Takeaway */}
        {parsed.keyTakeaway && (
          <div className="key-takeaway mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 key-takeaway__icon" />
              <span className="text-xs font-semibold uppercase tracking-wide key-takeaway__label">
                Key Takeaway
              </span>
            </div>
            <p className="text-reading font-medium text-foreground">{parsed.keyTakeaway}</p>
          </div>
        )}
      </div>
    );
  }
);

EnhancedExplanation.displayName = "EnhancedExplanation";

export { EnhancedExplanation };
export type { EnhancedExplanationProps };


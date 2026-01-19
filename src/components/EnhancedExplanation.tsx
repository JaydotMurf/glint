import * as React from "react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface EnhancedExplanationProps extends React.HTMLAttributes<HTMLDivElement> {
  level: "simplest" | "standard" | "deepDive";
  content: string;
}

interface ParsedContent {
  intro: string;
  steps: { title: string; description: string }[];
  keyTakeaway: string | null;
  remainder: string;
}

/**
 * Parses explanation content to extract numbered steps and key takeaways.
 * Looks for patterns like "1. **Step Title** - Description" or numbered lists.
 */
function parseExplanation(content: string): ParsedContent {
  const lines = content.split("\n");
  const steps: { title: string; description: string }[] = [];
  let intro = "";
  let keyTakeaway: string | null = null;
  let remainder = "";
  let inSteps = false;
  let afterSteps = false;

  // Regex to match numbered steps: "1. **Title** - Description" or "1. Title: Description"
  const stepRegex = /^(\d+)\.\s*\*?\*?([^*\-:]+)\*?\*?\s*[\-:]\s*(.+)$/;
  const simpleStepRegex = /^(\d+)\.\s+(.+)$/;
  
  // Check for "Key Takeaway" or summary at the end
  const takeawayIndicators = [
    /^(?:\*\*)?(?:key\s*takeaway|takeaway|in\s*short|in\s*summary|to\s*summarize|bottom\s*line|tldr|tl;dr)(?:\*\*)?[:\s]/i,
    /^(?:\*\*)?(?:remember|the\s*key\s*point|most\s*importantly)(?:\*\*)?[:\s]/i
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      if (afterSteps && remainder) remainder += "\n";
      continue;
    }

    // Check for key takeaway
    const isTakeaway = takeawayIndicators.some(regex => regex.test(line));
    if (isTakeaway) {
      // Extract the takeaway content
      const takeawayContent = line.replace(takeawayIndicators[0], "").replace(takeawayIndicators[1], "").trim();
      keyTakeaway = takeawayContent || lines.slice(i + 1).join(" ").trim();
      break;
    }

    // Check for numbered step
    let stepMatch = line.match(stepRegex);
    if (!stepMatch) {
      stepMatch = line.match(simpleStepRegex);
    }

    if (stepMatch) {
      inSteps = true;
      if (stepMatch.length === 4) {
        // Has title and description
        steps.push({
          title: stepMatch[2].trim().replace(/\*\*/g, ""),
          description: stepMatch[3].trim()
        });
      } else if (stepMatch.length === 3) {
        // Simple numbered item
        const text = stepMatch[2].trim();
        // Try to split on dash or colon
        const splitMatch = text.match(/^([^–\-:]+)[–\-:]\s*(.+)$/);
        if (splitMatch) {
          steps.push({
            title: splitMatch[1].trim().replace(/\*\*/g, ""),
            description: splitMatch[2].trim()
          });
        } else {
          steps.push({
            title: text.replace(/\*\*/g, ""),
            description: ""
          });
        }
      }
    } else if (!inSteps) {
      // Before steps - this is intro
      intro += (intro ? " " : "") + line;
    } else {
      // After steps
      afterSteps = true;
      remainder += (remainder ? " " : "") + line;
    }
  }

  return { intro, steps, keyTakeaway, remainder };
}

const EnhancedExplanation = React.forwardRef<HTMLDivElement, EnhancedExplanationProps>(
  ({ className, level, content, ...props }, ref) => {
    const parsed = useMemo(() => parseExplanation(content), [content]);
    const hasStructuredContent = parsed.steps.length >= 2;

    const levelConfig = {
      simplest: { icon: "🧩", label: "Simplest Explanation", color: "hsl(142 72% 45%)" },
      standard: { icon: "📚", label: "Standard Explanation", color: "hsl(235 85% 65%)" },
      deepDive: { icon: "🔬", label: "Deep Dive", color: "hsl(280 85% 65%)" }
    };

    const config = levelConfig[level];

    // If we can't parse structured content, fall back to simple markdown rendering
    if (!hasStructuredContent) {
      return (
        <div
          ref={ref}
          className={cn(
            "bg-card rounded-xl border border-border p-5 md:p-6",
            className
          )}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{config.icon}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {config.label}
            </span>
          </div>

          {/* Content with enhanced typography */}
          <div className="text-reading-dark prose prose-neutral dark:prose-invert max-w-none prose-p:my-2 prose-strong:text-foreground prose-em:text-foreground/90">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* Key Takeaway if found */}
          {parsed.keyTakeaway && (
            <div className="key-takeaway mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-[hsl(199_89%_48%)]" />
                <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(199_89%_40%)]">
                  Key Takeaway
                </span>
              </div>
              <p className="text-reading-dark font-medium">
                {parsed.keyTakeaway}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Structured content with numbered steps
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card rounded-xl border border-border p-5 md:p-6",
          className
        )}
        style={{ maxWidth: "680px", margin: "0 auto" }}
        {...props}
      >
        {/* Header Strip */}
        <div 
          className="flex items-center gap-2 mb-5 pb-3 border-b border-border"
        >
          <span className="text-2xl">{config.icon}</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {config.label}
          </span>
        </div>

        {/* Lead Statement / Intro */}
        {parsed.intro && (
          <div className="mb-6">
            <p className="text-reading-dark leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <>{children}</>,
                  strong: ({ children }) => (
                    <span
                      className="font-semibold"
                      style={{
                        background: "linear-gradient(180deg, transparent 60%, rgba(14,165,233,0.22) 60%)"
                      }}
                    >
                      {children}
                    </span>
                  ),
                  em: ({ children }) => (
                    <em className="text-foreground/90">{children}</em>
                  )
                }}
              >
                {parsed.intro}
              </ReactMarkdown>
            </p>
          </div>
        )}

        {/* Numbered Steps */}
        <ol className="space-y-3.5 mb-6">
          {parsed.steps.map((step, index) => (
            <li 
              key={index} 
              className="flex items-start gap-3 group"
            >
              <span className="step-badge" aria-hidden="true">
                {index + 1}
              </span>
              <div className="flex-1 text-reading">
                <span className="font-semibold text-foreground">
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-muted-foreground">
                    {" — "}{step.description}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Remainder text if any */}
        {parsed.remainder && (
          <div className="text-reading mb-6">
            <ReactMarkdown>{parsed.remainder}</ReactMarkdown>
          </div>
        )}

        {/* Key Takeaway Box */}
        {parsed.keyTakeaway && (
          <div className="key-takeaway">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-[hsl(199_89%_48%)]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(199_89%_40%)]">
                Key Takeaway
              </span>
            </div>
            <p className="text-[17px] leading-[1.75] text-foreground font-medium">
              {parsed.keyTakeaway}
            </p>
          </div>
        )}

        {/* Fallback key insight if no explicit takeaway */}
        {!parsed.keyTakeaway && parsed.steps.length > 0 && (
          <div className="key-takeaway">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-[hsl(199_89%_48%)]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(199_89%_40%)]">
                Key Takeaway
              </span>
            </div>
            <p className="text-[17px] leading-[1.75] text-foreground font-medium">
              {parsed.steps[0].title}
              {parsed.steps[0].description && ` — ${parsed.steps[0].description}`}
            </p>
          </div>
        )}
      </div>
    );
  }
);

EnhancedExplanation.displayName = "EnhancedExplanation";

export { EnhancedExplanation };
export type { EnhancedExplanationProps };

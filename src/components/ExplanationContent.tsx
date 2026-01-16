import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplanationContentProps {
  content: string;
  level: "simplest" | "standard" | "deepDive";
}

const levelConfig = {
  simplest: { icon: "🧩", label: "Simplest Explanation" },
  standard: { icon: "📚", label: "Standard Explanation" },
  deepDive: { icon: "🔬", label: "Deep Dive" },
};

// Approximate threshold: if content is longer than ~200 chars, show toggle
const COLLAPSE_THRESHOLD = 200;

export function ExplanationContent({ content, level }: ExplanationContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = levelConfig[level];
  
  // Only show toggle if content is long enough
  const shouldShowToggle = content.length > COLLAPSE_THRESHOLD;

  return (
    <div className="space-y-3 xs:space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg xs:text-xl sm:text-2xl">{config.icon}</span>
        <span className="text-xs xs:text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {config.label}
        </span>
      </div>

      {/* Content Container */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={isExpanded ? "expanded" : "collapsed"}
            initial={false}
            animate={{ opacity: 1 }}
            className={cn(
              "prose prose-neutral dark:prose-invert max-w-none",
              // Responsive typography
              "prose-p:text-sm prose-p:xs:text-base prose-p:sm:text-lg",
              "prose-p:leading-relaxed prose-p:sm:leading-loose",
              "prose-p:my-2 prose-p:sm:my-3",
              // Strong and emphasis
              "prose-strong:text-foreground prose-strong:font-semibold",
              "prose-em:text-foreground/90",
              // List styling
              "prose-ul:text-sm prose-ul:xs:text-base prose-ul:sm:text-lg",
              "prose-ol:text-sm prose-ol:xs:text-base prose-ol:sm:text-lg",
              "prose-li:my-1",
              // Collapsed state
              !isExpanded && shouldShowToggle && [
                "max-h-[180px] xs:max-h-[220px] sm:max-h-[280px]",
                "overflow-hidden"
              ]
            )}
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </motion.div>
        </AnimatePresence>

        {/* Gradient fade overlay when collapsed */}
        {!isExpanded && shouldShowToggle && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-16 xs:h-20 sm:h-24 pointer-events-none"
            style={{
              background: "linear-gradient(to top, hsl(var(--card)) 0%, hsl(var(--card) / 0.8) 40%, transparent 100%)"
            }}
          />
        )}
      </div>

      {/* Toggle Button */}
      {shouldShowToggle && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-1.5 mx-auto",
            "text-xs xs:text-sm font-medium",
            "text-primary hover:text-primary/80",
            "transition-colors duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "rounded-md px-3 py-1.5"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isExpanded ? (
            <>
              Show less
              <ChevronUp className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
            </>
          ) : (
            <>
              Show more
              <ChevronDown className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}

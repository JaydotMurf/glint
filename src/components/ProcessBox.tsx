import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Link2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProcessStep {
  title: string;
  description: string;
}

interface ProcessBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  leadStatement: string;
  keyTerms?: string[];
  steps: ProcessStep[];
  sources?: { text: string; url?: string }[];
  footnote?: string;
  sectionId?: string;
}

const ProcessBox = React.forwardRef<HTMLDivElement, ProcessBoxProps>(
  (
    {
      className,
      label = "Process",
      leadStatement,
      keyTerms = [],
      steps,
      sources = [],
      footnote,
      sectionId,
      ...props
    },
    ref
  ) => {
    const [showSources, setShowSources] = useState(false);
    const [isOutlined, setIsOutlined] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);

    // Highlight key terms in text with gradient underline
    const highlightKeyTerms = useCallback(
      (text: string) => {
        if (keyTerms.length === 0) return text;

        let result: React.ReactNode[] = [];
        let lastIndex = 0;
        let key = 0;

        const regex = new RegExp(
          `(${keyTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
          "gi"
        );

        text.replace(regex, (match, _p1, offset) => {
          if (offset > lastIndex) {
            result.push(text.slice(lastIndex, offset));
          }
          result.push(
            <span
              key={key++}
              className="font-medium"
              style={{
                background:
                  "linear-gradient(180deg, transparent 60%, rgba(14,165,233,0.22) 60%)",
              }}
            >
              {match}
            </span>
          );
          lastIndex = offset + match.length;
          return match;
        });

        if (lastIndex < text.length) {
          result.push(text.slice(lastIndex));
        }

        return result.length > 0 ? result : text;
      },
      [keyTerms]
    );

    // Handle anchor click with smooth scroll and outline animation
    const handleAnchorClick = () => {
      if (boxRef.current) {
        boxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setIsOutlined(true);
        setTimeout(() => setIsOutlined(false), 800);
      }
    };

    return (
      <div
        ref={(node) => {
          boxRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        id={sectionId}
        className={cn(
          "bg-white rounded-xl p-5 transition-all duration-200",
          "border border-[hsl(210_40%_89%)]",
          isOutlined && "outline outline-2 outline-[hsl(199_89%_60%)] animate-fade-out-outline",
          className
        )}
        style={{
          maxWidth: "680px",
          boxSizing: "border-box",
        }}
        {...props}
      >
        {/* Header Strip */}
        <div
          className="flex items-center justify-between -mx-5 -mt-5 mb-5 px-5 rounded-t-xl"
          style={{
            height: "36px",
            backgroundColor: "hsl(210 40% 98%)",
            borderBottom: "1px solid hsl(210 40% 89%)",
          }}
        >
          <span
            className="uppercase tracking-wide font-medium"
            style={{
              fontSize: "12px",
              lineHeight: "1",
              color: "hsl(215 16% 47%)",
            }}
          >
            {label}
          </span>
          <button
            onClick={handleAnchorClick}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
            aria-label="Jump to section"
          >
            <Link2
              className="h-4 w-4 transition-all duration-200 group-hover:underline group-hover:underline-offset-4"
              style={{ width: "16px", height: "16px" }}
            />
          </button>
        </div>

        {/* Lead Statement */}
        <p
          className="mb-6"
          style={{
            fontSize: "18px",
            lineHeight: "1.6",
            fontWeight: 500,
            color: "hsl(222 47% 11%)",
          }}
        >
          {highlightKeyTerms(leadStatement)}
        </p>

        {/* Numbered Steps */}
        <ol
          className="list-none p-0 m-0 space-y-3.5"
          style={{ counterReset: "step-counter" }}
        >
          {steps.map((step, index) => (
            <li
              key={index}
              className="flex items-start gap-3 group focus-within:outline-none"
              style={{ counterIncrement: "step-counter" }}
            >
              <span
                className="flex-shrink-0 flex items-center justify-center rounded-md font-semibold transition-all duration-150 group-focus-within:translate-y-[-1px] group-focus-within:ring-2 group-focus-within:ring-[rgba(79,70,229,0.35)]"
                style={{
                  width: "22px",
                  height: "22px",
                  fontSize: "12px",
                  backgroundColor: "hsl(226 100% 97%)",
                  color: "hsl(243 75% 59%)",
                }}
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div
                className="flex-1"
                style={{ fontSize: "16px", lineHeight: "1.6" }}
              >
                <span
                  className="font-semibold"
                  style={{ fontWeight: 600, color: "hsl(222 47% 11%)" }}
                  tabIndex={0}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span style={{ color: "hsl(215 16% 47%)" }}>
                    {" "}
                    — {step.description}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Footnote Zone */}
        {(footnote || sources.length > 0) && (
          <div
            className="mt-5 pt-4"
            style={{ borderTop: "1px solid hsl(210 40% 93%)" }}
          >
            {footnote && (
              <p
                className="mb-2"
                style={{
                  fontSize: "12.5px",
                  lineHeight: "1.6",
                  color: "hsl(215 16% 47%)",
                }}
              >
                {footnote}
              </p>
            )}

            {sources.length > 0 && (
              <>
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded"
                  style={{ fontSize: "12.5px", lineHeight: "1.6" }}
                  aria-expanded={showSources}
                >
                  <span>Show sources</span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      showSources && "rotate-180"
                    )}
                    style={{ width: "12px", height: "12px" }}
                  />
                </button>

                <AnimatePresence>
                  {showSources && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <ul
                        className="mt-3 grid gap-2 list-disc pl-4"
                        style={{
                          gridTemplateColumns: "repeat(2, 1fr)",
                          fontSize: "12px",
                          color: "hsl(215 16% 47%)",
                        }}
                      >
                        {sources.map((source, idx) => (
                          <li key={idx}>
                            {source.url ? (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground hover:underline transition-colors"
                              >
                                {source.text}
                              </a>
                            ) : (
                              source.text
                            )}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        )}

        <style>{`
          @keyframes fade-out-outline {
            0% { outline-color: hsl(199 89% 60%); }
            100% { outline-color: transparent; }
          }
          .animate-fade-out-outline {
            animation: fade-out-outline 800ms ease-out forwards;
          }
        `}</style>
      </div>
    );
  }
);

ProcessBox.displayName = "ProcessBox";

export { ProcessBox };
export type { ProcessStep, ProcessBoxProps };

import * as React from "react";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

interface GlintInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  onSubmitValue?: (value: string) => void;
  showSubmitButton?: boolean;
}

const GlintInput = React.forwardRef<HTMLTextAreaElement, GlintInputProps>(
  ({ className, onSubmitValue, showSubmitButton = false, ...props }, ref) => {
    const [value, setValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && onSubmitValue) {
          onSubmitValue(value.trim());
        }
      }
    };

    const handleSubmitClick = () => {
      if (value.trim() && onSubmitValue) {
        onSubmitValue(value.trim());
      }
    };

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    };

    React.useEffect(() => {
      adjustHeight();
    }, [value]);

    return (
      <div className={cn(
        "relative w-full group",
        isFocused && "ring-4 ring-primary/10 rounded-2xl"
      )}>
        <div 
          className={cn(
            "absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none",
            "bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20",
            "opacity-0 blur-xl",
            isFocused && "opacity-100"
          )}
        />
        <textarea
          ref={(node) => {
            (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={1}
          className={cn(
            "w-full px-6 py-5 text-lg bg-card/80 backdrop-blur-sm",
            "border border-border rounded-2xl",
            "transition-all duration-300 ease-out",
            "placeholder:text-muted-foreground/50",
            "focus:outline-none focus:border-primary/50",
            "focus:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]",
            "hover:border-border-medium hover:bg-card",
            "resize-none overflow-hidden",
            "min-h-[64px] md:min-h-[72px]",
            showSubmitButton && "pr-14",
            className
          )}
          {...props}
        />
        {showSubmitButton && (
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={!value.trim()}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "h-10 w-10 rounded-xl",
              "flex items-center justify-center",
              "bg-gradient-to-r from-primary to-purple-500",
              "text-white shadow-lg",
              "transition-all duration-300",
              "hover:shadow-glow-primary hover:scale-105",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

GlintInput.displayName = "GlintInput";

export { GlintInput };

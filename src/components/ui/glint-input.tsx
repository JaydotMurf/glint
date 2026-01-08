import * as React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface GlintInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  onSubmitValue?: (value: string) => void;
}

const GlintInput = React.forwardRef<HTMLTextAreaElement, GlintInputProps>(
  ({ className, onSubmitValue, ...props }, ref) => {
    const [value, setValue] = React.useState("");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && onSubmitValue) {
          onSubmitValue(value.trim());
        }
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
      <div className="relative w-full">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50">
          <Search className="h-5 w-5" />
        </div>
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
          rows={1}
          className={cn(
            "glint-input pl-14 pr-6 resize-none overflow-hidden",
            "min-h-[60px] md:min-h-[72px]",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

GlintInput.displayName = "GlintInput";

export { GlintInput };

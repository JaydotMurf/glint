import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glintButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-300 ease-out focus:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground hover:shadow-glow-primary hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98] focus:ring-4 focus:ring-primary/30",
        secondary:
          "bg-card/60 backdrop-blur-sm text-foreground border border-border hover:bg-card hover:border-border-medium hover:translate-y-[-1px] hover:shadow-soft active:translate-y-0 active:scale-[0.98] focus:ring-4 focus:ring-primary/10",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:scale-[0.98]",
        success:
          "bg-gradient-to-r from-success to-teal-400 text-success-foreground hover:shadow-glow-success hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98]",
        danger:
          "bg-destructive text-destructive-foreground hover:opacity-90 active:scale-[0.98]",
        accent:
          "bg-gradient-to-r from-accent to-teal-400 text-accent-foreground hover:shadow-glow-accent hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98]",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",
        outline:
          "border-2 border-primary/50 text-primary bg-transparent hover:bg-primary/10 hover:border-primary active:scale-[0.98] focus:ring-4 focus:ring-primary/20",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-lg",
        md: "h-11 px-6 text-base rounded-xl",
        lg: "h-14 px-8 text-base rounded-xl",
        xl: "h-16 px-10 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface GlintButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glintButtonVariants> {
  asChild?: boolean;
}

const GlintButton = React.forwardRef<HTMLButtonElement, GlintButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(glintButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

GlintButton.displayName = "GlintButton";

export { GlintButton, glintButtonVariants };

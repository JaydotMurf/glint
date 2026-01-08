import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glintButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 ease-out focus:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 focus:ring-4 focus:ring-primary/20",
        secondary:
          "bg-card text-foreground border-2 border-border hover:bg-muted hover:border-border-medium focus:ring-4 focus:ring-primary/10",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-muted",
        success:
          "bg-success text-success-foreground hover:opacity-90 hover:shadow-lg hover:shadow-success/20",
        danger:
          "bg-destructive text-destructive-foreground hover:opacity-90",
        accent:
          "bg-accent text-accent-foreground hover:opacity-90",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
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

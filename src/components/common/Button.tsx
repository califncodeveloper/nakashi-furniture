import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-primary via-[oklch(0.48_0.19_18)] to-primary text-primary-foreground shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-white/10",
        secondary:
          "bg-charcoal text-white hover:bg-dark-wood shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-white/5",
        outline:
          "border border-foreground/20 bg-background/80 backdrop-blur-sm text-foreground hover:bg-foreground hover:text-background hover:border-foreground shadow-xs hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        ghost: "text-foreground hover:bg-muted/80 hover:text-primary active:scale-[0.98]",
        offer:
          "bg-gradient-to-r from-brand-yellow via-[oklch(0.92_0.15_90)] to-brand-yellow text-charcoal font-semibold shadow-soft hover:shadow-lift hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-black/5",
        link: "px-0 text-primary underline-offset-4 hover:underline hover:text-brand-red-hover",
        luxury:
          "bg-gradient-to-r from-burgundy via-[oklch(0.32_0.08_350)] to-burgundy text-white shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:scale-[0.98] border border-brand-yellow/30",
      },
      size: {
        sm: "h-9 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg",
        md: "h-11 px-6 text-sm font-medium",
        lg: "h-13 px-8 text-base font-semibold shadow-soft",
        icon: "h-10 w-10 rounded-xl",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin text-current" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

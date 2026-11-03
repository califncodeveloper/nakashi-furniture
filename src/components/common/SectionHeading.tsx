import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  const prefersReduced = useReducedMotion();

  return (
    <div
      className={cn(
        "mb-12 flex flex-col gap-6 md:mb-16",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow && (
          <div
            className={cn(
              "mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary shadow-xs backdrop-blur-xs",
              centered && "mx-auto",
            )}
          >
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            <span>{eyebrow}</span>
          </div>
        )}

        <h2 className="font-display text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h2>

        {/* Elegant luxury separator with scroll-triggered width reveal */}
        <div
          className={cn("mt-4 flex items-center gap-2", centered && "justify-center")}
          aria-hidden="true"
        >
          {prefersReduced ? (
            <>
              <span className="h-[2px] w-12 rounded-full bg-gradient-to-r from-primary via-brand-yellow to-transparent" />
              <span className="h-1.5 w-1.5 rotate-45 rounded-xs bg-brand-yellow" />
              <span className="h-[2px] w-6 rounded-full bg-gradient-to-l from-brand-yellow to-transparent" />
            </>
          ) : (
            <>
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: 48, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-[2px] rounded-full bg-gradient-to-r from-primary via-brand-yellow to-transparent"
              />
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="h-1.5 w-1.5 rotate-45 rounded-xs bg-brand-yellow"
              />
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: 24, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-[2px] rounded-full bg-gradient-to-l from-brand-yellow to-transparent"
              />
            </>
          )}
        </div>

        {description && (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
      </div>

      {action && <div className={cn("shrink-0 pt-2 md:pt-0", centered && "mt-2")}>{action}</div>}
    </div>
  );
}

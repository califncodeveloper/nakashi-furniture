"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  direction?: "left" | "right";
  speed?: number; // duration in seconds
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({
  children,
  direction = "left",
  speed = 30,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div className={cn("flex overflow-x-auto gap-8 py-4 scrollbar-none", className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      <motion.div
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        className={cn(
          "flex min-w-full shrink-0 items-center gap-8 py-3",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

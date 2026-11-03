"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

type FadeDirection = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: ReactNode;
  direction?: FadeDirection;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "span" | "p" | "h1" | "h2" | "h3" | "h4";
}

const offsets: Record<FadeDirection, { x: number; y: number }> = {
  up: { x: 0, y: 20 },
  down: { x: 0, y: -20 },
  left: { x: 20, y: 0 },
  right: { x: -20, y: 0 },
  none: { x: 0, y: 0 },
};

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  className,
  as = "div",
}: FadeInProps) {
  const prefersReduced = useReducedMotion();
  const Component = motion[as] as typeof motion.div;

  if (prefersReduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const offset = offsets[direction];

  return (
    <Component
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}

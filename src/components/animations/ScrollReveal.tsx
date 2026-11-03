"use client";

import { type ReactNode } from "react";
import { motion, type Variant, type Variants } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  /** Additional distance to travel (px) */
  distance?: number;
  className?: string;
  once?: boolean;
  /** Viewport margin for triggering earlier/later */
  viewportMargin?: string;
  as?: "div" | "section" | "article" | "figure" | "li" | "header" | "footer";
}

const directionMap: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance,
  className,
  once = true,
  viewportMargin = "-80px",
  as = "div",
}: ScrollRevealProps) {
  const prefersReduced = useReducedMotion();
  const Component = motion[as] as typeof motion.div;

  if (prefersReduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const offset = directionMap[direction];
  const multiplier = distance ? distance / 40 : 1;

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x * multiplier,
      y: offset.y * multiplier,
    } as Variant,
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    } as Variant,
  };

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin }}
      variants={variants}
      className={className}
    >
      {children}
    </Component>
  );
}

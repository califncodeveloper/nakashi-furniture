"use client";

import { type ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface ParallaxSectionProps {
  children: ReactNode;
  /** Amount of parallax offset in pixels (positive = move up on scroll) */
  offset?: number;
  className?: string;
  as?: "div" | "section" | "figure";
}

export function ParallaxSection({
  children,
  offset = 50,
  className,
  as = "div",
}: ParallaxSectionProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  if (prefersReduced) {
    const Tag = as;
    return (
      <Tag className={className} ref={ref as React.Ref<any>}>
        {children}
      </Tag>
    );
  }

  const Component = motion[as] as typeof motion.div;

  return (
    <Component ref={ref} style={{ y }} className={className}>
      {children}
    </Component>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface AnimatedCounterProps {
  /** Target numeric value to count to */
  value: number;
  /** Optional suffix like "+" or "%" */
  suffix?: string;
  /** Optional prefix like "₹" */
  prefix?: string;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1.5,
  className,
  once = true,
}: AnimatedCounterProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: "-60px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (prefersReduced || !isInView) {
      if (isInView) setDisplayValue(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });

    return () => controls.stop();
  }, [isInView, value, duration, prefersReduced]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
}

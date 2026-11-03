"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

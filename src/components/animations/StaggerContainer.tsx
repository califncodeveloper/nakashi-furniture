"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface StaggerContainerProps {
  children: ReactNode;
  /** Delay between each child animation */
  stagger?: number;
  /** Initial delay before the first child animates */
  delay?: number;
  className?: string;
  once?: boolean;
  viewportMargin?: string;
  as?: "div" | "section" | "ul" | "ol";
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "scale";
  as?: "div" | "li" | "article";
}

const containerVariants = (stagger: number, delay: number): Variants => ({
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

const itemDirections = {
  up: { opacity: 0, y: 30, scale: 1 },
  down: { opacity: 0, y: -30, scale: 1 },
  left: { opacity: 0, x: 30, scale: 1 },
  right: { opacity: 0, x: -30, scale: 1 },
  scale: { opacity: 0, scale: 0.92, y: 0, x: 0 },
};

const itemVariants = (direction: "up" | "down" | "left" | "right" | "scale"): Variants => ({
  hidden: itemDirections[direction],
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
});

export function StaggerContainer({
  children,
  stagger = 0.1,
  delay = 0,
  className,
  once = true,
  viewportMargin = "-60px",
  as = "div",
}: StaggerContainerProps) {
  const prefersReduced = useReducedMotion();
  const Component = motion[as] as typeof motion.div;

  if (prefersReduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin }}
      variants={containerVariants(stagger, delay)}
      className={className}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  direction = "up",
  as = "div",
}: StaggerItemProps) {
  const prefersReduced = useReducedMotion();
  const Component = motion[as] as typeof motion.div;

  if (prefersReduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Component variants={itemVariants(direction)} className={className}>
      {children}
    </Component>
  );
}

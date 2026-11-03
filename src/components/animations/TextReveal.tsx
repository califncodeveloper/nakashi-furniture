"use client";

import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface TextRevealProps {
  text: string;
  className?: string;
  /** Animation mode: word-by-word or character-by-character */
  mode?: "word" | "char";
  delay?: number;
  stagger?: number;
  once?: boolean;
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

const tokenVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function TextReveal({
  text,
  className,
  mode = "word",
  delay = 0,
  stagger = 0.04,
  once = true,
}: TextRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  const tokens = mode === "word" ? text.split(" ") : text.split("");

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      variants={containerVariants(stagger, delay)}
      className={className}
      aria-label={text}
    >
      {tokens.map((token, i) => (
        <motion.span
          key={`${token}-${i}`}
          variants={tokenVariants}
          className="inline-block"
          aria-hidden="true"
        >
          {token}
          {mode === "word" && i < tokens.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealProps = {
  as?: "div" | "section" | "li" | "article" | "span";
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  className?: string;
  children: React.ReactNode;
};

export default function Reveal({
  as = "div",
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 0.5,
  className,
  children,
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  const directionMap = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const { x, y } = directionMap[direction];

  return (
    <MotionTag
      className={cn(className)}
      initial={reduce ? { opacity: 0 } : { opacity: 0, x, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reduce ? 0.2 : duration,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
    >
      {children}
    </MotionTag>
  );
}

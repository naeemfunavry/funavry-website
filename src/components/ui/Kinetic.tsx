"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Display type entrance. Each word rides up out of a clipping slot and the
 * whole line un-blurs — the letters resolve rather than fade in.
 *
 * The in-view trigger sits on the (stationary) wrapper: a word that starts
 * fully clipped by its slot would never intersect the viewport on its own.
 */
export function KineticWords({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.055,
  once = true,
  trigger = "inView",
}: {
  text: string;
  className?: string;
  wordClassName?: (word: string, i: number) => string | undefined;
  delay?: number;
  stagger?: number;
  once?: boolean;
  /** "mount" for above-the-fold copy that must not wait on an observer. */
  trigger?: "inView" | "mount";
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  const variants: Variants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { y: "112%", filter: "blur(6px)" },
        visible: (i: number) => ({
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: 0.85,
            ease: [0.19, 1, 0.22, 1],
            delay: delay + i * stagger,
          },
        }),
      };

  const activate =
    trigger === "mount"
      ? { animate: "visible" as const }
      : { whileInView: "visible" as const, viewport: { once, margin: "-70px" } };

  return (
    <motion.span className={cn("inline", className)} initial="hidden" {...activate}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="-mb-[0.16em] inline-block overflow-hidden pb-[0.16em] align-bottom"
        >
          <motion.span
            className={cn("inline-block", wordClassName?.(word, i))}
            custom={i}
            variants={variants}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/**
 * A block that wipes into view under a travelling clip edge, rather than
 * fading. Used for images, panels, and rules.
 */
export function Wipe({
  children,
  className,
  delay = 0,
  from = "bottom",
  duration = 1,
  bleed = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left";
  duration?: number;
  /** Let children overflow the bottom edge once revealed — a settled clip of
      inset(0) would still crop, e.g. a card's hover drawer. */
  bleed?: boolean;
}) {
  const reduce = useReducedMotion();

  const hidden =
    from === "bottom"
      ? { clipPath: "inset(100% 0% 0% 0%)" }
      : { clipPath: "inset(0% 100% 0% 0%)" };

  const shown = bleed
    ? { clipPath: "inset(0% 0% -150% 0%)" }
    : { clipPath: "inset(0% 0% 0% 0%)" };

  return (
    <motion.div
      className={cn(className)}
      initial={reduce ? { opacity: 0 } : hidden}
      whileInView={reduce ? { opacity: 1 } : shown}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: reduce ? 0.3 : duration, ease: [0.19, 1, 0.22, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/** A hairline that draws itself left-to-right. */
export function Rule({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={cn("block h-px w-full origin-left bg-line", className)}
      initial={reduce ? { opacity: 0 } : { scaleX: 0 }}
      whileInView={reduce ? { opacity: 1 } : { scaleX: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay }}
    />
  );
}

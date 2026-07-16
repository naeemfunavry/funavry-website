"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import Button from "@/components/ui/Button";

export default function MagneticButton({
  href,
  children,
  className,
  arrow = false,
  variant = "accent",
  size = "md",
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  arrow?: boolean;
  variant?: "primary" | "accent" | "secondary" | "ink";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15 });
  const sy = useSpring(y, { stiffness: 150, damping: 15 });

  const MAX = 8;

  const handleMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-MAX, Math.min(MAX, relX * 0.4)));
    y.set(Math.max(-MAX, Math.min(MAX, relY * 0.4)));
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={reduce ? undefined : { x: sx, y: sy }}
      className="inline-block"
    >
      <Button variant={variant} size={size} arrow={arrow} href={href} className={className} onClick={onClick}>
        {children}
      </Button>
    </motion.div>
  );
}

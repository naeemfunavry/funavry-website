"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

export default function CountUp({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
  /** Thousands separators and the like; the raw count is otherwise unreadable. */
  format = (n: number) => String(n),
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  /* No negative margin here. This one fails worse than the wipes do: the
     display sits at 0 until the observer fires, so a trigger that never lands
     doesn't hide the stat — it shows a confidently wrong one. Firing as soon
     as any part of the number is on screen costs nothing and can't
     misreport. */
  const inView = useInView(ref, { once: true, amount: 0 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {format(display)}
      {suffix}
    </span>
  );
}

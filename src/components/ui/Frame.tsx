"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The site's card. Not a rounded box with a shadow — a drafting frame:
 * hairline rules and four corner ticks that extend on hover, the way a CAD
 * drawing marks a datum. A cursor-tracked wash tints the surface.
 */
export default function Frame({
  as: Tag = "div",
  className,
  innerClassName,
  tint = "68,158,216",
  interactive = true,
  children,
  ...props
}: {
  as?: "div" | "article" | "li" | "a" | "section" | "button";
  className?: string;
  innerClassName?: string;
  /** "r,g,b" of the phase colour this frame belongs to. */
  tint?: string;
  interactive?: boolean;
  children: React.ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement | null>(null);
  const [hover, setHover] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const tickBase =
    "pointer-events-none absolute h-[7px] w-[7px] transition-all duration-500 ease-expo";

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag
      ref={ref as any}
      onMouseMove={interactive ? onMove : undefined}
      onMouseEnter={interactive ? () => setHover(true) : undefined}
      onMouseLeave={interactive ? () => setHover(false) : undefined}
      className={cn(
        "group/frame relative border border-line bg-paper-white transition-colors duration-500",
        interactive && "hover:border-line-strong",
        className
      )}
      {...props}
    >
      {/* Cursor wash. */}
      {interactive && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: hover ? 1 : 0,
            background: `radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(${tint},0.08), transparent 70%)`,
          }}
        />
      )}

      {/* Corner ticks — they grow outward on hover. */}
      <span aria-hidden style={{ color: `rgb(${tint})` }}>
        <span
          className={cn(tickBase, "left-[-1px] top-[-1px] border-l border-t", hover ? "h-[13px] w-[13px]" : "")}
          style={{ borderColor: hover ? `rgb(${tint})` : "transparent" }}
        />
        <span
          className={cn(tickBase, "right-[-1px] top-[-1px] border-r border-t", hover ? "h-[13px] w-[13px]" : "")}
          style={{ borderColor: hover ? `rgb(${tint})` : "transparent" }}
        />
        <span
          className={cn(tickBase, "bottom-[-1px] left-[-1px] border-b border-l", hover ? "h-[13px] w-[13px]" : "")}
          style={{ borderColor: hover ? `rgb(${tint})` : "transparent" }}
        />
        <span
          className={cn(tickBase, "bottom-[-1px] right-[-1px] border-b border-r", hover ? "h-[13px] w-[13px]" : "")}
          style={{ borderColor: hover ? `rgb(${tint})` : "transparent" }}
        />
      </span>

      <div className={cn("relative z-10 h-full", innerClassName)}>{children}</div>
    </Tag>
  );
}

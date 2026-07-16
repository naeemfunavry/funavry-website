"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A drafting crosshair that replaces the pointer on fine-pointer devices.
 * It snaps open over interactive targets. Positions are written straight to
 * the transform each frame — no React state in the move path.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.body.classList.add("has-cursor");

    // The ring trails the dot with a light spring for weight.
    const target = { x: -100, y: -100 };
    const eased = { x: -100, y: -100 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      const el = e.target as HTMLElement | null;
      setActive(!!el?.closest('a, button, [role="tab"], input, select, textarea'));
    };

    const tick = () => {
      eased.x += (target.x - eased.x) * 0.18;
      eased.y += (target.y - eased.y) * 0.18;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${eased.x}px, ${eased.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {/* Centre dot — pinned exactly to the pointer. */}
      <div ref={dot} className="absolute left-0 top-0">
        <span
          className={`absolute block rounded-full bg-azure transition-all duration-300 ease-expo ${
            active ? "-ml-[3px] -mt-[3px] h-1.5 w-1.5" : "-ml-[2px] -mt-[2px] h-1 w-1"
          }`}
        />
      </div>

      {/* Crosshair ring — trails, and opens over targets. */}
      <div ref={ring} className="absolute left-0 top-0">
        <svg
          viewBox="0 0 40 40"
          className={`absolute -left-5 -top-5 h-10 w-10 transition-all duration-500 ease-expo ${
            active ? "scale-100 opacity-100" : "scale-[0.55] opacity-40"
          }`}
        >
          <circle cx="20" cy="20" r="15" fill="none" stroke="#449ED8" strokeWidth="1" />
          <path d="M20 1v7M20 32v7M1 20h7M32 20h7" stroke="#449ED8" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

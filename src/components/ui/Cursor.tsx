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

    /* Parks itself once the ring has caught up. This used to run for the life
       of the page, easing a value that had already converged — a wakeup every
       frame, forever, to move nothing. An idle pointer now costs zero frames,
       and `onMove` restarts the loop. */
    const tick = () => {
      const dx = target.x - eased.x;
      const dy = target.y - eased.y;
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        raf = 0;
        return;
      }
      eased.x += dx * 0.18;
      eased.y += dy * 0.18;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${eased.x}px, ${eased.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* The hit test used to live in `onMove` — a `closest()` walk up the DOM
       tree on every pointermove, 120+ times a second on a high-refresh
       display, to answer a question whose answer only changes when the
       pointer crosses an element boundary. `pointerover` fires on exactly
       those crossings, so the same state costs a few walks per second. */
    const onOver = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      setActive(
        !!el?.closest('a, button, [role="tab"], input, select, textarea'),
      );
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {/* Centre dot — pinned exactly to the pointer. Fixed at the larger of
          the two sizes and scaled down at rest: the previous version swapped
          `h`/`w`/`ml`/`mt` between states, so every hover ran layout on a
          `transition-all` that had to diff every animatable property. Same
          1px → 1.5px result, on the compositor. */}
      <div ref={dot} className="absolute left-0 top-0">
        <span
          className={`absolute -ml-[3px] -mt-[3px] block h-1.5 w-1.5 rounded-full bg-azure transition-transform duration-300 ease-expo ${
            active ? "scale-100" : "scale-[0.667]"
          }`}
        />
      </div>

      {/* Crosshair ring — trails, and opens over targets. */}
      <div ref={ring} className="absolute left-0 top-0">
        <svg
          viewBox="0 0 40 40"
          className={`absolute -left-5 -top-5 h-10 w-10 transition-[transform,opacity] duration-500 ease-expo ${
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

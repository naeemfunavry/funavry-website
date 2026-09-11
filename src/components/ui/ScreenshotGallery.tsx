"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Wipe } from "@/components/ui/Kinetic";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { type DetailScreenshot } from "@/lib/case-study-details";

/**
 * The case study's screenshot grid, with a lightbox.
 *
 * The grid tiles are deliberately cropped (16:10, from the top) so a row reads
 * as one set — which means the tile is a *preview*, not the capture. Clicking
 * one opens it whole: `object-contain` inside the viewport, so nothing is cut
 * off whatever shape the original is, with arrows and ←/→ to walk the set.
 *
 * It locks through `@/lib/scroll-lock` rather than setting `body.overflow`:
 * this site scrolls through Lenis, which keeps gliding a hidden-overflow page.
 */

const EXPO = [0.19, 1, 0.22, 1] as const;

export default function ScreenshotGallery({
  shots,
}: {
  shots: DetailScreenshot[];
}) {
  /** Index of the open capture; `null` is closed. */
  const [index, setIndex] = useState<number | null>(null);
  const isOpen = index !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Where to return focus when the lightbox closes. */
  const originRef = useRef<HTMLButtonElement | null>(null);

  /* Functional updates, so these stay stable across navigation — the open
     effect below must not re-run (and re-lock the scroll) on every step. */
  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % shots.length)),
    [shots.length],
  );
  const prev = useCallback(
    () =>
      setIndex((i) => (i === null ? i : (i - 1 + shots.length) % shots.length)),
    [shots.length],
  );

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", onKey);
    lockScroll();
    // Opening a dialog without moving focus into it leaves a keyboard user on
    // the page behind, tabbing through content they can't see.
    closeRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
      originRef.current?.focus();
    };
  }, [isOpen, close, next, prev]);

  /* Index and capture travel together, so narrowing one narrows both. */
  const active = index === null ? null : { i: index, shot: shots[index] };

  return (
    <>
      <div
        className={`mt-10 grid gap-6 lg:mt-12 lg:gap-8 ${
          shots.length === 1 ? "max-w-2xl" : "max-w-full sm:grid-cols-3"
        }`}
      >
        {shots.map((s, i) => (
          <Wipe key={s.src} delay={(i % 3) * 0.08}>
            <figure className="group/shot">
              <button
                type="button"
                onClick={(e) => {
                  originRef.current = e.currentTarget;
                  setIndex(i);
                }}
                aria-label={`View full screenshot: ${s.alt}`}
                className="block w-full cursor-zoom-in overflow-hidden border border-line bg-paper-white text-left shadow-[0_22px_50px_-26px_rgba(46,52,54,0.5)] transition-all duration-500 ease-expo hover:-translate-y-1 hover:shadow-[0_34px_66px_-28px_rgba(46,52,54,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure"
              >
                <div className="flex items-center gap-1.5 border-b border-line px-3.5 py-2.5">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-line-strong"
                  />
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-line-strong"
                  />
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-line-strong"
                  />
                </div>

                <div className="relative aspect-[16/10]">
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    quality={90}
                    sizes="(max-width: 640px) 92vw, 440px"
                    className={
                      s.fit === "contain"
                        ? "object-contain p-3"
                        : "object-cover object-top"
                    }
                  />
                  {/* Expand affordance — the tile is a crop, so say so. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-500 ease-expo group-hover/shot:bg-ink/25 group-hover/shot:opacity-100"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 bg-ink/55 backdrop-blur-sm">
                      <Expand size={17} className="text-paper" />
                    </span>
                  </span>
                </div>
              </button>

              <figcaption className="mt-3 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-400">
                <span aria-hidden className="h-px w-4 flex-none bg-line-strong" />
                {s.alt}
              </figcaption>
            </figure>
          </Wipe>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            {/* Backdrop — clicking anywhere off the capture closes. */}
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute inset-0 cursor-zoom-out bg-ink-900/90 backdrop-blur-[3px]"
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label={active.shot.alt}
              className="pointer-events-none relative flex h-full w-full flex-col items-center justify-center px-4 py-16 sm:px-16 lg:px-24"
            >
              {/* Top bar: counter + close */}
              <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
                  {active.i + 1} / {shots.length}
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center border border-paper/25 text-paper transition-colors duration-300 hover:border-paper/60 hover:bg-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure"
                >
                  <X size={18} />
                </button>
              </div>

              {/* The capture, whole — `contain`, so no shape is cropped. */}
              <motion.figure
                key={active.shot.src}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EXPO }}
                className="pointer-events-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col items-center justify-center"
              >
                <div className="relative min-h-0 w-full flex-1">
                  <Image
                    src={active.shot.src}
                    alt={active.shot.alt}
                    fill
                    priority
                    quality={90}
                    sizes="(max-width: 1024px) 92vw, 1200px"
                    className="object-contain"
                  />
                </div>
                <figcaption className="mt-5 max-w-[70ch] text-center font-mono text-[10px] uppercase tracking-[0.16em] text-paper/70">
                  {active.shot.alt}
                </figcaption>
              </motion.figure>

              {/* Step through the set. Hidden when there is only one. */}
              {shots.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous screenshot"
                    className="pointer-events-auto absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-paper/25 text-paper transition-colors duration-300 hover:border-paper/60 hover:bg-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure sm:left-4"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next screenshot"
                    className="pointer-events-auto absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-paper/25 text-paper transition-colors duration-300 hover:border-paper/60 hover:bg-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure sm:right-4"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

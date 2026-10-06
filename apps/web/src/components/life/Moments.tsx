"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export type Moment = {
  src: string;
  alt: string;
  /** What the photo shows, set over its foot. */
  caption: string;
  category: string;
};

/**
 * The span of each tile in the bento. The first tile is the 2×2 lead; the rest
 * are single cells that fill rows of four beside and under it, and whatever
 * is left over on the last row stretches to close the gap — so the grid
 * always lands on a full rectangle.
 */
function spanFor(i: number, n: number): string {
  if (i === 0) return "col-span-2 row-span-2";
  const rest = n - 1;
  if (rest === 1) return "col-span-2 row-span-2";
  if (rest < 4) {
    /* Two cells per row beside the lead: a lone one on its row takes both. */
    return rest === 2 || i === n - 1 ? "col-span-2" : "";
  }
  /* Past the four beside the lead, rows of four on lg (two on a phone). */
  const tail = (rest - 4) % 4;
  const fromEnd = n - 1 - i;
  if (tail === 0 || fromEnd >= tail) return "";
  if (tail === 1) return "col-span-2 lg:col-span-4";
  if (tail === 2) return "lg:col-span-2";
  return fromEnd === 0 ? "col-span-2" : "";
}

/**
 * The `sizes` hint for a tile, derived from the columns its `span` takes, so
 * `next/image` picks a source that matches how wide the tile actually renders
 * — the grid is two columns on a phone and four from `lg`.
 */
function sizesFor(i: number, span: string): string {
  if (i === 0) return "(max-width: 1024px) 100vw, 50vw";
  if (span.includes("lg:col-span-4")) return "100vw";
  if (span.includes("col-span-2")) return "(max-width: 1024px) 100vw, 50vw";
  return "(max-width: 1024px) 50vw, 25vw";
}

/**
 * Life at Funavry as a bento of the company's own photographs, the first
 * leading at twice the size.
 */
export default function Moments({ moments }: { moments: Moment[] }) {
  const reduce = useReducedMotion();
  const shown = moments;

  if (moments.length === 0) return null;

  return (
    <section
      id="moments"
      aria-labelledby="life-moments"
      className="relative scroll-mt-20 overflow-hidden border-b border-line bg-paper-deep"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />

      <Container wide className="relative z-10 py-8 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-amber" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Life @ Funavry
              </span>
            </div>
            <h2 id="life-moments" className="mt-6 text-h3 text-ink">
              Moments that make <span className="text-azure-ink">us.</span>
            </h2>
          </div>
          <p className="max-w-[46ch] text-[15.5px] leading-[1.7] text-ink-500">
            From team events and outings to everyday moments at the office — a
            glimpse of life at Funavry.
          </p>
        </div>

        {/* ---- The bento ---- */}
        <motion.ul
          layout={!reduce}
          className="mt-8 grid auto-rows-[150px] grid-cols-2 lg:mt-10 gap-3 sm:auto-rows-[200px] sm:gap-4 lg:auto-rows-[220px] lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((m, i) => {
              const span = spanFor(i, shown.length);
              return (
              <motion.li
                key={m.src}
                layout={!reduce}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className={cn(
                  "group relative overflow-hidden rounded-sm bg-ink-900",
                  span,
                )}
              >
                <Image
                  src={m.src}
                  alt={m.alt}
                  fill
                  quality={85}
                  /* Tell the browser how wide each tile really renders, so it
                     loads a matching source: the lead and the full-bleed last
                     row take half or all of the width, not the 25vw a normal
                     tile does — otherwise they'd upscale a tile-sized image. */
                  sizes={sizesFor(i, span)}
                  className="object-cover transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent"
                />
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-[3px] w-0 bg-amber transition-all duration-500 ease-expo group-hover:w-16"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300">
                    {m.category}
                  </span>
                  <p
                    className={cn(
                      "mt-1 flex items-center gap-2 font-medium tracking-[-0.01em] text-paper",
                      i === 0
                        ? "text-[16px] sm:text-[20px]"
                        : "text-[13px] sm:text-[15px]",
                    )}
                  >
                    {m.caption}
                  </p>
                </div>
              </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </Container>
    </section>
  );
}

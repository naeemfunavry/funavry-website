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
 * The span of each tile in the editorial grid: four columns on `lg`, with a
 * wide two-column tile in the middle of the top row and at the start of the
 * second, so the two rows read 1-2-1 and 2-1-1 and the rhythm staggers like a
 * magazine spread. On a phone it is a plain grid of square-ish cells (two
 * columns). Counts other than six fall back to an even grid.
 */
function spanFor(i: number, n: number): string {
  if (n === 6 && (i === 1 || i === 3)) return "lg:col-span-2 lg:aspect-[2/1]";
  return "";
}

/**
 * The `sizes` hint for a tile, from how many columns it spans, so `next/image`
 * loads a source that matches how wide the tile renders — two columns on a
 * phone, four from `lg` (a wide tile is two of them).
 */
function sizesFor(span: string): string {
  if (span.includes("lg:col-span-2")) return "(max-width: 1024px) 50vw, 50vw";
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
          className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-10 lg:grid-cols-4 lg:gap-5"
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
                    "group relative aspect-square overflow-hidden rounded-sm bg-ink-900 ring-1 ring-ink/10 transition-shadow duration-500 ease-expo hover:shadow-[0_22px_50px_-28px_rgba(16,46,84,0.45)]",
                    span,
                  )}
                >
                  {/* The photo fills the frame, centred. */}
                  <Image
                    src={m.src}
                    alt={m.alt}
                    fill
                    quality={85}
                    /* Tell the browser how wide each tile really renders, so it
                     loads a matching source — a wide tile is two of the four
                     lg columns — instead of upscaling a tile-sized image. */
                    sizes={sizesFor(span)}
                    className="object-cover object-center transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.05]"
                  />

                  {/* A wash at the foot so the label, always shown, stays legible. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-900/85 via-ink-900/25 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
                      {m.category}
                    </span>
                    <p className="mt-1.5 text-[14px] font-medium leading-snug tracking-[-0.01em] text-paper sm:text-[15px]">
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

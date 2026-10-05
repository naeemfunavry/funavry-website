"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import { useInView } from "@/lib/use-in-view";

export type GallerySlide = {
  src: string;
  alt: string;
  /** What the photo shows, set over its foot. */
  caption: string;
};

/** How long the track holds before it slides on by itself. */
const DWELL = 4000;

/**
 * The gallery as a horizontal slider: a scroll-snapping track of photos, one
 * and a bit on a phone, three on a desktop, with arrows and a progress bar.
 * The track is native scroll, so touch, trackpad and keyboard all move it,
 * and both ends wrap round.
 *
 * It slides itself every DWELL ms, but never under reduced motion, never
 * while it's off screen or the tab is hidden, and not while the pointer is
 * over it or focus is inside it.
 */
export default function GallerySlider({ slides }: { slides: GallerySlide[] }) {
  const track = useRef<HTMLUListElement>(null);
  const hold = useRef(false);
  const reduce = useReducedMotion();
  const [sectionRef, inView] = useInView<HTMLElement>();
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  /* One slide's width (plus the gap) per step, wrapping at either end. */
  const step = useCallback((d: -1 | 1) => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const max = el.scrollWidth - el.clientWidth;
    if (d === 1 && el.scrollLeft >= max - 2) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (d === -1 && el.scrollLeft <= 2) {
      el.scrollTo({ left: max, behavior: "smooth" });
    } else {
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      el.scrollBy({ left: d * (first.offsetWidth + gap), behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (reduce || !inView || slides.length < 2) return;
    const id = window.setInterval(() => {
      if (hold.current || document.hidden) return;
      step(1);
    }, DWELL);
    return () => window.clearInterval(id);
  }, [reduce, inView, slides.length, step]);

  if (slides.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="life-gallery"
      onMouseEnter={() => (hold.current = true)}
      onMouseLeave={() => (hold.current = false)}
      onFocus={() => (hold.current = true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          hold.current = false;
      }}
      className="relative overflow-hidden border-b border-line bg-paper"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-50" />

      <Container wide className="relative z-10 py-8 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Gallery
              </span>
            </div>
            <h2 id="life-gallery" className="mt-6 text-h3 text-ink">
              Life in <span className="text-azure-ink">pictures.</span>
            </h2>
          </div>
          <div className="flex flex-none items-center">
            <SlideArrow label="Previous photos" onClick={() => step(-1)}>
              <ArrowLeft size={16} aria-hidden />
            </SlideArrow>
            <SlideArrow
              label="Next photos"
              onClick={() => step(1)}
              className="-ml-px"
            >
              <ArrowRight size={16} aria-hidden />
            </SlideArrow>
          </div>
        </div>

        <ul
          ref={track}
          onScroll={update}
          aria-label="Photographs of life at Funavry"
          className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] sm:gap-4 lg:mt-10 [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((s, i) => (
            <li
              key={s.src}
              className="group relative aspect-[4/3] w-[85%] flex-none snap-start overflow-hidden rounded-sm bg-ink-900 sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                quality={85}
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.04]"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 lg:p-5">
                <p className="text-[14px] font-medium tracking-[-0.01em] text-paper sm:text-[15px]">
                  {s.caption}
                </p>
                <span className="font-mono text-[10px] tabular-nums tracking-[0.16em] text-amber-300">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* How far along the track is. */}
        <div
          aria-hidden
          className="mt-6 h-[2px] w-full overflow-hidden bg-line"
        >
          <div
            className="h-full origin-left bg-[#102e54] transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${Math.max(progress, 0.08)})` }}
          />
        </div>
      </Container>
    </section>
  );
}

/** The site's slider arrow, as on the home page's Industries deck: a square
    outlined cell, the pair sharing a hairline, filling with ink on hover. */
function SlideArrow({
  label,
  onClick,
  className = "",
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-12 w-12 items-center justify-center border border-line-strong text-ink-500 transition-colors duration-300 hover:bg-ink hover:text-paper ${className}`}
    >
      {children}
    </button>
  );
}

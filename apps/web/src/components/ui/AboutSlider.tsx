"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

export type AboutSlide = {
  src: string;
  alt: string;
  /** The mono line under the frame — who or where the photo is. */
  caption: string;
};

/** How long a slide holds before the deck advances itself. */
const DWELL = 5000;

/**
 * The About section's photo deck. Slides cross-fade in place rather than
 * scrolling, so the frame never moves and the caption under it swaps with the
 * photo. Autoplay pauses on hover and focus, stops while the section is off
 * screen, and never starts under reduced motion. With a single slide it is
 * just the framed photo — no controls, no timer.
 */
export default function AboutSlider({ slides }: { slides: AboutSlide[] }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>();
  const paused = useRef(false);
  const count = slides.length;

  const go = useCallback(
    (d: -1 | 1) => setIndex((i) => (i + d + count) % count),
    [count],
  );

  useEffect(() => {
    if (reduce || !inView || count < 2) return;
    const id = setInterval(() => {
      if (paused.current || document.hidden) return;
      go(1);
    }, DWELL);
    return () => clearInterval(id);
  }, [reduce, inView, count, go]);

  if (count === 0) return null;

  return (
    <div
      ref={ref}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
      aria-roledescription="carousel"
      aria-label="Life at Funavry"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-paper-deep">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-expo",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        ))}

        {count > 1 && (
          <>
            {/* A soft foot so the dots read over any photo. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink-900/50 to-transparent"
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500 ease-expo",
                    i === index
                      ? "w-6 bg-paper"
                      : "w-1.5 bg-paper/50 hover:bg-paper/80",
                  )}
                />
              ))}
            </div>
            {/* <div className="absolute bottom-3 right-3 flex items-center">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center bg-paper/90 text-ink transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                <ArrowLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className="-ml-px flex h-10 w-10 items-center justify-center bg-paper/90 text-ink transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                <ArrowRight size={15} />
              </button>
            </div> */}
          </>
        )}
      </div>

      <p
        aria-live="polite"
        className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-400"
      >
        {slides[index].caption}
      </p>
    </div>
  );
}

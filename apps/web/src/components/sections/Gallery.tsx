"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export type GalleryPhoto = {
  src: string;
  alt: string;
  /** Who or where, shown over the foot of the photo. */
  caption: string;
  /** Pixel size, so each slide keeps the photo's own shape at the row's
      height rather than being cropped to one. */
  width: number;
  height: number;
};

/**
 * Life at Funavry, as a full-bleed strip of photographs. The row runs the
 * whole width of the page — its first photo lines up with the page's content
 * edge, the rest run off the right — and scrolls sideways by swipe, trackpad,
 * dragging with the mouse, or the arrows. Each photo keeps its own shape at
 * the row's height, so nothing is cropped to fit.
 */
export default function Gallery({
  label = "Life @ Funavry",
  title,
  photos,
}: {
  label?: string;
  title: string;
  photos: GalleryPhoto[];
}) {
  const track = useRef<HTMLUListElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /** One photo's width, near enough: the first slide plus the gap. */
  const step = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const first = el.querySelector("li");
    const by = first ? first.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * by, behavior: "smooth" });
  };

  if (photos.length === 0) return null;

  return (
    <section
      aria-labelledby="gallery-heading"
      className="relative overflow-hidden border-b border-line bg-paper-white py-16 lg:py-24"
    >
      <Container wide>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-amber" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                {label}
              </span>
            </div>
            <h2 id="gallery-heading" className="mt-6 text-h3 text-ink">
              {title}
            </h2>
          </div>
          <div className="flex flex-none gap-2">
            <ArrowButton label="Previous photo" disabled={atStart} onClick={() => step(-1)}>
              <ArrowLeft size={16} aria-hidden />
            </ArrowButton>
            <ArrowButton label="Next photo" disabled={atEnd} onClick={() => step(1)}>
              <ArrowRight size={16} aria-hidden />
            </ArrowButton>
          </div>
        </div>
      </Container>

      {/* The strip. Its left padding matches the page's content edge (the
          Container's gutter, plus half of whatever the page is wider than
          max-w-wide's 1480px), so
          the first photo lines up with the heading above it. */}
      <ul
        ref={track}
        onScroll={measure}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { x: e.clientX, left: track.current.scrollLeft };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !track.current) return;
          track.current.scrollLeft = d.left - (e.clientX - d.x);
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
        className={cn(
          "mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 lg:mt-12",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "cursor-grab select-none active:cursor-grabbing",
          "scroll-px-5 px-5 sm:scroll-px-6 sm:px-6 md:scroll-px-10 md:px-10",
          "lg:scroll-px-[max(3.5rem,calc((100%-1480px)/2+3.5rem))] lg:px-[max(3.5rem,calc((100%-1480px)/2+3.5rem))]",
        )}
        aria-label={`${label} photographs`}
      >
        {photos.map((photo, i) => (
          <li
            key={photo.src}
            className="group relative h-[260px] flex-none snap-start overflow-hidden bg-paper-deep sm:h-[380px] lg:h-[500px]"
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              draggable={false}
              priority={i === 0}
              quality={88}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 900px"
              className="object-cover transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.03]"
            />
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-900/80 to-transparent"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-5 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/85 lg:p-6">
              <span aria-hidden className="h-px w-5 flex-none bg-amber" />
              {photo.caption}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center border border-line-strong bg-paper-white text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

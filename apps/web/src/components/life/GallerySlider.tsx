import Image from "next/image";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export type GallerySlide = {
  src: string;
  alt: string;
  /** What the photo shows, shown over its foot on hover. */
  caption: string;
  /** The photo's pixel size. Each tile takes the photo's own shape, so
      nothing is cropped. */
  width: number;
  height: number;
};

/** The strip's height at each breakpoint, matching its `h-[…]` classes. */
const STRIP = { sm: 280, md: 360, lg: 420 };

/** How wide a tile is drawn at each breakpoint, so the browser fetches a
    file sharp enough for it rather than for a fixed narrow tile. */
const sizesFor = (s: GallerySlide) => {
  const r = s.width / s.height;
  return `(max-width: 640px) ${Math.round(STRIP.sm * r)}px, (max-width: 1024px) ${Math.round(STRIP.md * r)}px, ${Math.round(STRIP.lg * r)}px`;
};

/** Each tile's height within the strip, in turn: tall, short and in
    between, so the row steps along a shared baseline. */
const HEIGHTS = ["h-full", "h-[86%]", "h-full", "h-[86%]", "h-[95%]"];

/** One pass of the strip. Rendered twice so the loop joins without a seam;
    the second copy is hidden from assistive tech. The gap lives inside each
    item (`pr-3`) so both passes measure the same. */
function Pass({
  slides,
  ariaHidden = false,
}: {
  slides: GallerySlide[];
  ariaHidden?: boolean;
}) {
  return (
    <ul aria-hidden={ariaHidden} className="flex h-full flex-none items-end">
      {slides.map((s, i) => (
        <li
          key={`${s.src}-${i}`}
          className={cn("flex-none pr-3 lg:pr-5", HEIGHTS[i % HEIGHTS.length])}
        >
          <div
            className="group relative h-full overflow-hidden bg-ink-900 rounded-sm"
            style={{ aspectRatio: `${s.width} / ${s.height}` }}
          >
            <Image
              src={s.src}
              alt={ariaHidden ? "" : s.alt}
              fill
              quality={90}
              sizes={sizesFor(s)}
              className="object-cover rounded-sm transition-transform duration-[1200ms] ease-expo group-hover:scale-[1.05]"
            />
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-900/85 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <p className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-[14px] font-medium tracking-[-0.01em] text-paper opacity-0 transition-all duration-500 ease-expo group-hover:translate-y-0 group-hover:opacity-100">
              {s.caption}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * The gallery as the Technology Stack's strip: the photographs sliding past
 * in a loop, edge to edge across the page, stepping between three heights on
 * a shared baseline. The strip pauses on hover so a photo can be looked at.
 */
export default function GallerySlider({ slides }: { slides: GallerySlide[] }) {
  if (slides.length === 0) return null;

  return (
    <section
      aria-labelledby="life-gallery"
      className="relative overflow-hidden border-b border-line bg-paper"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-50" />

      <Container wide className="relative z-10 pt-8 sm:pt-12 lg:pt-14">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 flex-none bg-azure" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
            Gallery
          </span>
        </div>
        <h2 id="life-gallery" className="mt-6 text-h3 text-ink">
          Life in <span className="text-azure-ink">pictures.</span>
        </h2>
      </Container>

      <div className="group/m relative z-10 mt-8 overflow-hidden pb-8 sm:pb-12 lg:mt-10 lg:pb-14">
        <div
          className="flex h-[280px] w-max animate-marquee group-hover/m:[animation-play-state:paused] motion-reduce:animate-none sm:h-[360px] lg:h-[420px]"
          style={{ animationDuration: `${slides.length * 6}s` }}
        >
          <Pass slides={slides} />
          <Pass slides={slides} ariaHidden />
        </div>
      </div>
    </section>
  );
}

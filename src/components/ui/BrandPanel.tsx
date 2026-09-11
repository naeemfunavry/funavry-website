"use client";

import Image from "next/image";
import ArcField from "@/components/ui/ArcField";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const PHASES = [
  { name: "Build", dot: "bg-azure", text: "text-azure-ink" },
  { name: "Automate", dot: "bg-amber", text: "text-amber-ink" },
  { name: "Operate", dot: "bg-steel", text: "text-steel-ink" },
];

/**
 * The hero visual shared by the About and Contact pages: an ink panel framed by
 * two offset drafting plates, with the delivery model set beside it.
 *
 * Pass `image` and the panel holds that photograph. Without one it shows the
 * brand itself — the mark's three arcs in motion (Build, Automate, Operate) —
 * rather than staging a stock room, so a page with no photo yet still has a
 * real visual and adding the file later changes no layout.
 *
 * The washes are radial gradients, not blurred circles: a 90px blur is costly
 * on a phone GPU and a blurred circle reads the same as a gradient anyway.
 */
export default function BrandPanel({
  label = "AI-First Engineering & Global Business Services",
  tagline = "Where AI, engineering, and business transformation converge.",
  caption,
  image,
  className,
}: {
  label?: string;
  tagline?: string;
  /** Mono caption under the panel. */
  caption?: string;
  image?: { src: string; alt: string };
  className?: string;
}) {
  return (
    <figure className={cn("flex items-center gap-8", className)}>
      <div className="flex-1">
        <div className="relative p-6 sm:p-8">
          {/* Offset plates, behind the panel. */}
          <span
            aria-hidden
            className="absolute left-0 top-0 h-[40%] w-[32%] border border-line-strong bg-paper-white/70"
          />
          <span
            aria-hidden
            className="absolute bottom-0 right-0 h-[36%] w-[28%] border border-line-strong"
          />

          <div className="relative aspect-[5/4] overflow-hidden bg-ink-900 shadow-[0_30px_60px_-30px_rgba(33,38,42,0.55)]">
            {image ? (
              <>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 88vw, 580px"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent"
                />
              </>
            ) : (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background: [
                      "radial-gradient(70% 60% at 88% 8%, rgba(68,158,216,0.30), transparent 62%)",
                      "radial-gradient(55% 45% at 18% 100%, rgba(245,159,19,0.12), transparent 60%)",
                      "radial-gradient(60% 55% at 60% 70%, rgba(55,96,121,0.35), transparent 70%)",
                    ].join(","),
                  }}
                />
                <div aria-hidden className="absolute inset-0 grid-paper-dark" />
                <ArcField className="absolute inset-0 h-full w-full" />
                {/* One amber datum, the way the mark lands its accent. */}
                <span
                  aria-hidden
                  className="absolute right-[14%] top-[38%] h-2 w-2 bg-amber shadow-[0_0_18px_4px_rgba(245,159,19,0.45)]"
                />
              </>
            )}

            <div className="absolute left-5 right-5 top-5 flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.2em] text-paper/60 sm:left-7 sm:top-7">
              <span className="relative flex h-1.5 w-1.5 flex-none">
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-azure" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-azure" />
              </span>
              <span className="truncate">{label}</span>
            </div>

            <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
              <Logo onDark className="h-8 text-paper sm:h-10" />
              <p className="mt-4 max-w-[34ch] text-[13px] leading-[1.6] text-paper/60 sm:text-[14px]">
                {tagline}
              </p>
            </div>
          </div>
        </div>

        {caption && (
          <figcaption className="mt-1 flex items-center gap-2 px-6 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-400 sm:px-8">
            <span aria-hidden className="h-px w-4 flex-none bg-line-strong" />
            {caption}
          </figcaption>
        )}
      </div>

      {/* The delivery model, set vertically beside the panel. */}
      <ul aria-hidden className="hidden flex-none space-y-3 xl:block">
        {PHASES.map((p) => (
          <li key={p.name} className="flex items-center gap-2.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", p.dot)} />
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.2em]",
                p.text,
              )}
            >
              {p.name}
            </span>
          </li>
        ))}
        <li className="pt-2">
          <span className="block h-px w-10 bg-line-strong" />
        </li>
      </ul>
    </figure>
  );
}

"use client";

import Image from "next/image";
import { Lock } from "lucide-react";
import { CASE_PHASE, type CaseStudy } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

/**
 * A case-study capture, presented as the thing it actually is: a window.
 *
 * Every capture in the set is a desktop web interface — there are no phone or
 * tablet grabs anywhere in /public/case-studies — so this is one window dressed
 * two ways rather than a rack of devices: browser chrome for the public sites,
 * an application toolbar for the signed-in tools. `study.surface` records which,
 * and a device the screenshot never came from would be a costume.
 *
 * The screen is `aspect-[16/10]` because that is the captures' own shape — every
 * one of them is cropped to it upstream by `scripts/crop-case-studies.mjs`. So
 * `object-cover` here cuts nothing, and this component sizes itself: chrome plus
 * width/1.6. Give it a width; do not give it a height. Anything that pins its
 * height is choosing, silently, which edge of a hand-composed crop to throw away.
 *
 * Hover belongs to the enclosing `Frame` (`group/frame`), so the whole card
 * drives it — reaching the window is not a separate gesture from reading the
 * card it belongs to.
 */
export default function ProductWindow({
  study,
  sizes,
  className,
}: {
  study: CaseStudy;
  /** Passed through to `next/image`; the two call sites size very differently. */
  sizes: string;
  className?: string;
}) {
  const phase = CASE_PHASE[study.phase];

  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-[8px] bg-paper-white",
        // Lift, scale and shadow move on one easing, so it reads as a single
        // object moving rather than three properties animating. The negative
        // spreads are deliberate: callers clip, and a soft shadow cut off by a
        // hard edge looks worse than a tighter shadow that fits.
        "shadow-[0_8px_20px_-8px_rgba(46,52,54,0.25),0_1px_2px_rgba(46,52,54,0.06)]",
        "transition-[transform,box-shadow] duration-[800ms] ease-expo",
        "group-hover/frame:-translate-y-1 group-hover/frame:scale-[1.02]",
        "group-hover/frame:shadow-[0_18px_40px_-16px_rgba(46,52,54,0.34),0_2px_4px_rgba(46,52,54,0.07)]",
        className,
      )}
    >
      {/* Phase seam, on the window's own head — where a title bar's accent goes. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 z-20 h-[2px] origin-left scale-x-0 transition-transform duration-700 ease-expo group-hover/frame:scale-x-100",
          phase.dot,
        )}
      />

      {/* Chrome. Frosted rather than solid: the window is glass on a lit desk,
          so the desk should carry faintly through its head. Neutral dots, not
          the macOS red/amber/green — this palette is three hairline greys and
          two brand hues, and traffic lights would be the loudest thing here. */}
      <div className="relative z-10 flex h-6 flex-none items-center gap-2 border-b border-line/70 bg-white/70 px-2.5 backdrop-blur-md">
        <span aria-hidden className="flex flex-none gap-[3.5px]">
          <span className="h-[5px] w-[5px] rounded-full bg-line-strong" />
          <span className="h-[5px] w-[5px] rounded-full bg-line-strong" />
          <span className="h-[5px] w-[5px] rounded-full bg-line-strong" />
        </span>

        {study.surface === "site" ? (
          /* A browser: the address bar is the whole tell. Deliberately
             abstracted to a lock and an empty pill — the real hostnames would
             either name a client the data withholds on purpose (the
             municipality's name is in its screenshot and pointedly out of its
             title) or have to be invented, and an invented URL inside real
             browser chrome reads as a claim rather than as a mockup. */
          <span
            aria-hidden
            className="flex h-[12px] min-w-0 flex-1 items-center gap-1 rounded-full border border-line/70 bg-paper px-1.5"
          >
            <Lock size={6} className="flex-none text-ink-400" />
            <span className="h-[2px] w-10 max-w-full rounded-full bg-line-strong/80" />
          </span>
        ) : (
          /* An app: a toolbar, not an address bar. Same window, different job —
             which is exactly the distinction `surface` records. */
          <span
            aria-hidden
            className="flex min-w-0 flex-1 items-center gap-1.5"
          >
            <span className="h-[9px] w-[9px] flex-none rounded-[2px] border border-line-strong/90" />
            <span className="h-[2px] w-4 flex-none rounded-full bg-line-strong/70" />
            <span className="h-[2px] w-2.5 flex-none rounded-full bg-line/90" />
          </span>
        )}
      </div>

      {/* The screen — the capture's own 16:10, so nothing is cut twice. */}
      <div className="relative aspect-[16/10] overflow-hidden bg-paper-deep">
        {/* q90, not Next's default 75. These captures are dashboards, and the
            first thing a 75-quality re-encode spends its budget on is the fine
            table text they exist to show — measured at 39.2dB PSNR against the
            crop script's own output, which is where compression starts to tell
            on type. `images.qualities` in next.config has to list 90 or this
            400s rather than falling back. */}
        <Image
          src={study.image}
          alt={`${study.title} — product interface`}
          fill
          quality={90}
          placeholder="blur"
          sizes={sizes}
          className="object-cover object-top transition-transform duration-[900ms] ease-expo group-hover/frame:scale-[1.025]"
        />

        {/* Reflection: one specular band lying across the glass, sliding off as
            the window lifts. The light doesn't move — the surface under it does,
            which is the only reason a travelling highlight reads as glass rather
            than as a swipe effect. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-y-1/2 -left-1/2 w-1/3 -rotate-[18deg] bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-[1200ms] ease-expo group-hover/frame:translate-x-[420%]"
        />
      </div>
    </div>
  );
}

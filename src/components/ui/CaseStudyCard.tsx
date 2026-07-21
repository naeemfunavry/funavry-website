"use client";

import Frame from "@/components/ui/Frame";
import ProductWindow from "@/components/ui/ProductWindow";
import { CASE_PHASE, type CaseStudy } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

/** A case study at rest, for the /case-studies index. The home page runs the
    same work as a deck instead; this is the version that sits still. */
export default function CaseStudyCard({ study }: { study: CaseStudy }) {
  const phase = CASE_PHASE[study.phase];

  return (
    <Frame
      as="article"
      tint={phase.tint}
      className="h-full"
      innerClassName="flex h-full flex-col p-3 lg:p-4"
    >
      {/* ---- The product, as a window on a lit desk. ----
          The window sizes itself from its width (chrome + width/1.6), so this
          box has no aspect and no height: pin either and the capture starts
          getting cropped a second time at whatever width the grid happens to
          hand it. */}
      <div className="relative overflow-hidden border border-line bg-paper-white">
        {/* The desk: white, with one soft wash in the phase's own colour. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-70 transition-opacity duration-700 ease-expo group-hover/frame:opacity-100"
          style={{
            background: `radial-gradient(120% 85% at 50% -12%, rgba(${phase.tint},0.10), transparent 62%)`,
          }}
        />

        <div className="relative p-4 lg:p-5">
          <ProductWindow
            study={study}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 640px"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-6 lg:p-5 lg:pt-7">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn("h-1 w-1 rounded-full", phase.dot)}
            />
            <span
              className={cn(
                "font-mono text-[9.5px] uppercase tracking-[0.16em]",
                phase.text,
              )}
            >
              {study.phase}
            </span>
          </span>
          <span aria-hidden className="h-px w-4 bg-line-strong" />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-400">
            {study.sector}
          </span>
        </div>

        {/* h2, not h3: these cards sit directly under the page's single <h1>,
            so an h3 would skip a level (axe: heading-order). */}
        <h2 className="mt-4 text-[19px] font-medium leading-snug tracking-[-0.02em] text-ink lg:text-[21px]">
          {study.title}
        </h2>

        <p className="mt-3.5 text-[14px] leading-[1.7] text-ink-500">
          {study.summary}
        </p>

        <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
          {study.capabilities.map((capability) => (
            <li
              key={capability}
              className="border border-line bg-paper px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-500"
            >
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

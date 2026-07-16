"use client";

import Image from "next/image";
import Frame from "@/components/ui/Frame";
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
      {/* Every capture is cropped to 16:10 upstream, so the frame is the
          image's own shape and nothing is cut a second time here. */}
      <div className="relative overflow-hidden border border-line bg-paper-deep">
        <div className="relative aspect-[16/10]">
          <Image
            src={study.image}
            alt={`${study.title} — product interface`}
            fill
            placeholder="blur"
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 640px"
            className="object-cover object-top transition-transform duration-[900ms] ease-expo group-hover/frame:scale-[1.025]"
          />
        </div>

        {/* Phase seam across the top of the screen, drawn on hover. */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-700 ease-expo group-hover/frame:scale-x-100",
            phase.dot,
          )}
        />
      </div>

      <div className="flex flex-1 flex-col p-4 pt-6 lg:p-5 lg:pt-7">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span aria-hidden className={cn("h-1 w-1 rounded-full", phase.dot)} />
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

        <h3 className="mt-4 text-[19px] font-medium leading-snug tracking-[-0.02em] text-ink lg:text-[21px]">
          {study.title}
        </h3>

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

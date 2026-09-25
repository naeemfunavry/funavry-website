import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { WorkProject } from "@/lib/work-model";

/**
 * The pieces the industry and service detail pages are both built from, kept
 * in one place so the two pages stay one design.
 */

/** The site's section eyebrow — azure hairline beside a mono label. */
export function SectionLabel({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-ink"
    >
      <span aria-hidden className="h-px w-10 flex-none bg-azure" />
      {children}
    </h2>
  );
}

/** A card's foot: a hairline, then the link label. The card itself is the
    anchor, so this is only its label, moving with the card's hover. Pinned to
    the bottom so a row of cards lines its feet up. */
export function CardFoot({ children }: { children: string }) {
  return (
    <div className="mt-auto pt-5">
      <span aria-hidden className="block h-px bg-line" />
      <span className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-semibold text-azure-ink">
        {children}
        <ArrowRight
          size={14}
          aria-hidden
          className="transition-transform duration-500 ease-smooth group-hover/frame:translate-x-1"
        />
      </span>
    </div>
  );
}

/** A project's lead capture, plain — no device frame — edge to edge in one
    16:9 area, so every card in a row stands the same height. The captures run
    1.6:1 to 2.3:1, so filling a shared shape trims a little off one edge; it
    is pinned to the top, where a screen's header and navigation sit. Served at
    q90 like every other capture on the site (q75 softens the fine UI type
    these screens exist to show), and not scaled on hover, which resamples it
    soft. A phone capture is too tall to fill the area, so it sits whole; a
    project with no capture gets its sector as a quiet placeholder. */
export function ProjectShot({ project }: { project: WorkProject }) {
  const wide = project.media.primary;
  const shot = wide ?? project.media.phones[0] ?? null;

  return (
    <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-paper-deep">
      {shot ? (
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          quality={90}
          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 46vw, 460px"
          className={wide ? "object-cover object-top" : "object-contain p-3"}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
          {project.sector.split("·")[0].trim()}
        </span>
      )}
    </div>
  );
}

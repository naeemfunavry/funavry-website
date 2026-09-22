import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { WorkProject } from "@/lib/work-model";
import { cn } from "@/lib/utils";
import FactLine from "./FactLine";
import ProjectVisual from "./ProjectVisual";

/**
 * A flagship project, given a full row: the number and text on one side, the
 * product visual on the other, alternating sides row by row.
 *
 * The whole row is one link. (It used to be a stretched link inside the
 * title, and the title's hover nudge — a transform — re-anchored that stretch
 * to the title itself, so the visual stopped being clickable exactly while
 * the pointer was over it.)
 *
 * On a phone the row stacks visual first, then the text.
 */
export default function FeaturedProject({
  project,
  index,
}: {
  project: WorkProject;
  index: number;
}) {
  const first = index === 0;
  const flip = index % 2 === 1;

  const visual = (
    <ProjectVisual
      media={project.media}
      title={project.title}
      sector={project.sector}
      phase={project.phase}
      variant="featured"
      priority={first}
    />
  );

  return (
    <Link
      href={`/case-studies/${project.slug}`}
      aria-label={`${project.title} — view details`}
      className={cn(
        "group grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:gap-16 xl:gap-20",
        flip
          ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
          : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
      )}
    >
      {/* Rendered directly rather than faded in on scroll: the product visual is
          the row's content, and it must never sit invisible waiting on an
          intersection observer. */}
      <div>{visual}</div>

      <div
        className={cn(
          "grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 lg:grid-cols-[56px_minmax(0,1fr)]",
          !flip && "lg:order-first",
        )}
      >
        <span className="text-[20px] font-medium leading-none tracking-[-0.02em] text-ink lg:text-[24px]">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div>
          <span className="block font-mono text-[10px] uppercase leading-none tracking-[0.2em] text-ink-400">
            {project.sector}
          </span>

          <h3 className="mt-4 text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-ink transition-transform duration-500 ease-smooth group-hover:translate-x-1 lg:text-[28px]">
            {project.title}
          </h3>

          <p className="mt-4 max-w-[42ch] text-[14.5px] leading-[1.7] text-ink-500">
            {project.tagline}
          </p>

          <FactLine facts={project.tags} className="mt-5 text-[12.5px] text-ink-400" />

          <span className="mt-7 inline-flex items-center gap-2 text-[13.5px] font-medium text-ink">
            View details
            <ArrowRight
              size={14}
              aria-hidden
              className="transition-transform duration-500 ease-smooth group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

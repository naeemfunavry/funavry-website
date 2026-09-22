import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { WorkProject } from "@/lib/work-model";
import ProjectVisual from "./ProjectVisual";

/**
 * A project in the More Work grid: the product visual, then category, name,
 * one-line description and the way in. The whole card is one link, and drives
 * the visual's hover.
 */
export default function ProjectCard({ project }: { project: WorkProject }) {
  return (
    <Link
      href={`/case-studies/${project.slug}`}
      aria-label={`${project.title} — view details`}
      className="group flex h-full flex-col"
    >
      <ProjectVisual
        media={project.media}
        title={project.title}
        sector={project.sector}
        phase={project.phase}
        variant="card"
      />

      <span className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
        {project.sector}
      </span>

      <h3 className="mt-2 text-[19px] font-medium leading-[1.3] tracking-[-0.02em] text-ink transition-transform duration-500 ease-smooth group-hover:translate-x-1 lg:text-[21px]">
        {project.title}
      </h3>

      <p className="mt-2 max-w-[52ch] text-[14px] leading-[1.65] text-ink-500">
        {project.tagline}
      </p>

      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[13.5px] font-medium text-ink">
        View details
        <ArrowRight
          size={14}
          aria-hidden
          className="transition-transform duration-500 ease-smooth group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}

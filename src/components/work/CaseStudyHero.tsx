import Link from "next/link";
import Container from "@/components/ui/Container";
import { KineticWords } from "@/components/ui/Kinetic";
import type { WorkProject } from "@/lib/work-model";
import { cn } from "@/lib/utils";
import FactLine from "./FactLine";
import ProjectVisual from "./ProjectVisual";
import { PHASE_STYLE } from "./phase";

/**
 * The case study opener: category, name and positioning statement on the
 * left, the brief's summary on the right, and the project's product visual
 * across the full width beneath — the same composition as on the Work page,
 * at hero scale and held still.
 */
export default function CaseStudyHero({
  project,
  summary,
}: {
  project: WorkProject;
  summary: string;
}) {
  const phase = PHASE_STYLE[project.phase];

  return (
    <section className="relative overflow-hidden bg-paper pt-[120px]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[70%] grid-paper opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      <Container wide className="relative z-10 pb-14 pt-10 lg:pb-20 lg:pt-12">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400"
        >
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link href="/case-studies" className="transition-colors hover:text-ink">
            Our Work
          </Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="max-w-[42ch] truncate text-ink-700">
            {project.title}
          </span>
        </nav>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", phase.dot)} />
              <span
                className={cn(
                  "font-mono text-[10.5px] uppercase tracking-[0.2em]",
                  phase.text,
                )}
              >
                {project.sector}
              </span>
              <span aria-hidden className="h-px w-5 bg-line-strong" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-400">
                {project.phase}
              </span>
            </div>

            <h1 className="mt-6 max-w-[22ch] text-h2 text-ink">
              <KineticWords text={project.title} trigger="mount" />
            </h1>

            <p className="mt-6 max-w-[46ch] text-[18px] font-medium leading-[1.45] tracking-[-0.01em] text-azure-ink lg:text-[20px]">
              {project.tagline}
            </p>
          </div>

          {/* Plain, not wrapped in `Wipe`: this is above-the-fold body copy,
              and it must not wait on an observer to become visible. */}
          <p className="text-[15.5px] leading-[1.8] text-ink-500">{summary}</p>
        </div>

        <div className="mt-12 lg:mt-16">
          <ProjectVisual
            media={project.media}
            title={project.title}
            sector={project.sector}
            phase={project.phase}
            variant="hero"
            priority
          />
          <FactLine facts={project.facts} className="mt-5" />
        </div>
      </Container>
    </section>
  );
}

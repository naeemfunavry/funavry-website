"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import WorkCard from "./WorkCard";
import {
  PROJECT_CATEGORIES,
  type ProjectCategory,
  type WorkProject,
} from "@/lib/work-model";

/** How many cards show before "Load more", and how many each press adds —
    whole rows of the four-column grid. */
const FIRST_PAGE = 12;
const PAGE_STEP = 8;

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * The Work page's case studies on the light paper of the rest of the site: a
 * heading, a line on the range of the work and the category pills, then a
 * grid of cards — capture, sector, title, tagline and tags. The first twelve
 * show; "Load more" adds two rows at a time.
 */
export default function WorkShowcase({
  projects,
}: {
  /** Every project, in display order. */
  projects: WorkProject[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState("all");
  const [shown, setShown] = useState(FIRST_PAGE);

  const options = useMemo(
    () => [
      { id: "all", label: "All Work", count: projects.length },
      ...PROJECT_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        count: projects.filter((p) => p.categories.includes(c.id)).length,
      })).filter((o) => o.count > 0),
    ],
    [projects],
  );

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) =>
          p.categories.includes(active as ProjectCategory),
        );
  const visible = filtered.slice(0, shown);
  const remaining = filtered.length - visible.length;
  const label = options.find((o) => o.id === active)?.label;

  return (
    <section
      id="work"
      aria-labelledby="work-list-heading"
      className="relative scroll-mt-24 overflow-hidden bg-paper"
    >
      {/* Field: soft radial lift and a whisper of the engineering grid — the
          same ground as the home page's Work section. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 8%, rgba(68,158,216,0.06), transparent 60%), radial-gradient(90% 70% at 80% 100%, rgba(245,159,19,0.05), transparent 65%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-paper opacity-[0.5]" />

      <Container wide className="relative py-8 sm:py-12 lg:py-14">
        {/* Heading, the range line and the filter pills. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Featured Case Studies
              </span>
            </div>
            <h2 id="work-list-heading" className="mt-6 text-h3 text-ink">
              Real-world platforms
              <br className="hidden sm:block" /> for different industries.
            </h2>
          </div>

          <p className="max-w-[46ch] text-[17px] leading-[1.7] text-ink-500">
            A selection of {projects.length}+ projects delivered across
            industries — from enterprise systems to AI-powered solutions.
          </p>
        </div>

        <div className="mt-10 pb-8 lg:mt-12">
          <div
            role="group"
            aria-label="Filter projects by category"
            className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <ul className="flex min-w-max items-center gap-2 lg:min-w-0 lg:flex-wrap">
              {options.map((option) => {
                const on = option.id === active;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setShown(FIRST_PAGE);
                        setActive(option.id);
                      }}
                      className={cn(
                        "relative flex h-10 items-center gap-2 rounded-full border px-4 text-[13.5px] font-medium transition-colors duration-300",
                        on
                          ? "border-transparent text-paper"
                          : "border-azure/45 text-ink-500 hover:border-azure hover:text-ink",
                      )}
                    >
                      {on && (
                        <motion.span
                          layoutId="showcase-filter-pill"
                          aria-hidden
                          className="absolute -inset-px rounded-full bg-amber"
                          transition={
                            reduce
                              ? { duration: 0 }
                              : { duration: 0.5, ease: EASE }
                          }
                        />
                      )}
                      <span className="relative text-ink">{option.label}</span>
                      <span
                        className={cn(
                          "relative text-[11px] tabular-nums",
                          on ? "text-ink/50" : "text-ink-400",
                        )}
                      >
                        {option.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <p aria-live="polite" className="sr-only">
          {`Showing ${visible.length} of ${filtered.length} ${
            active === "all" ? "" : `${label} `
          }projects.`}
        </p>

        <ul key={active} className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((project, i) => (
            <WorkCard
              key={project.slug}
              project={project}
              /* Each row staggers left to right; cards from "Load more"
                 stagger from the first new one. */
              delay={
                reduce
                  ? 0
                  : (i < FIRST_PAGE ? i % 4 : (i - FIRST_PAGE) % PAGE_STEP) *
                    0.06
              }
            />
          ))}
        </ul>

        {/* Progress and "Load more". */}
        <div className="mt-12 flex flex-col items-center gap-6 lg:mt-16">
          <div className="w-full max-w-[280px] text-center">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-400">
              Showing{" "}
              <span className="text-ink">
                {String(visible.length).padStart(2, "0")}
              </span>{" "}
              of {String(filtered.length).padStart(2, "0")}
            </p>
            <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-phases"
                initial={false}
                animate={{
                  width: `${(visible.length / Math.max(filtered.length, 1)) * 100}%`,
                }}
                transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
              />
            </div>
          </div>

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE_STEP)}
              className="group inline-flex h-14 items-center gap-3 rounded-full border border-ink pl-7 pr-2 text-[14.5px] font-medium text-ink transition-colors duration-300 hover:bg-ink hover:text-paper"
            >
              <span>
                Load more projects
                <span className="ml-2 text-ink-400 transition-colors duration-300 group-hover:text-paper/60">
                  ({Math.min(remaining, PAGE_STEP)} of {remaining})
                </span>
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper transition-colors duration-300 group-hover:bg-azure">
                <Plus
                  size={17}
                  aria-hidden
                  className="transition-transform duration-500 ease-smooth group-hover:rotate-90"
                />
              </span>
            </button>
          )}
        </div>
      </Container>
    </section>
  );
}

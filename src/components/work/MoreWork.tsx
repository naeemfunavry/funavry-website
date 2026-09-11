"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import {
  PROJECT_CATEGORIES,
  type ProjectCategory,
  type WorkProject,
} from "@/lib/work-model";
import ProjectCard from "./ProjectCard";
import ProjectFilter, { type FilterOption } from "./ProjectFilter";

/**
 * Everything beyond the featured set, in a two-column grid with a filter.
 *
 * "All" shows the projects not already featured above. A category shows every
 * project in it, featured ones included — someone filtering to Healthcare
 * wants all of the healthcare work, not the part of it that happens to be
 * further down the page.
 */
export default function MoreWork({
  projects,
  featuredSlugs,
}: {
  /** Every project, in display order. */
  projects: WorkProject[];
  featuredSlugs: string[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState("all");
  /* The grid only animates in after a filter change — on first paint it is
     simply there, so it never depends on hydration to be visible. */
  const changed = useRef(false);

  const more = useMemo(
    () => projects.filter((p) => !featuredSlugs.includes(p.slug)),
    [projects, featuredSlugs],
  );

  const options = useMemo<FilterOption[]>(
    () => [
      { id: "all", label: "All", count: more.length },
      ...PROJECT_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        count: projects.filter((p) => p.categories.includes(c.id)).length,
      })).filter((o) => o.count > 0),
    ],
    [projects, more],
  );

  const visible =
    active === "all"
      ? more
      : projects.filter((p) =>
          p.categories.includes(active as ProjectCategory),
        );

  const label = options.find((o) => o.id === active)?.label;

  return (
    <section aria-labelledby="more-work-heading" className="bg-paper">
      <Container wide className="pb-20 lg:pb-28">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <h2
            id="more-work-heading"
            className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink"
          >
            <span aria-hidden className="h-px w-8 flex-none bg-azure" />
            More Work
          </h2>

          <ProjectFilter
            options={options}
            active={active}
            onChange={(id) => {
              changed.current = true;
              setActive(id);
            }}
          />
        </div>

        <p aria-live="polite" className="sr-only">
          {active === "all"
            ? `Showing ${more.length} projects.`
            : `Showing ${visible.length} ${label} projects.`}
        </p>

        <motion.ul
          key={active}
          initial={
            changed.current
              ? reduce
                ? { opacity: 0 }
                : { opacity: 0, y: 14 }
              : false
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-y-14 md:mt-10 md:grid-cols-2 md:gap-y-16"
        >
          {visible.map((project) => (
            <li
              key={project.slug}
              className="md:odd:pr-8 lg:odd:pr-12 md:even:border-l md:even:border-line md:even:pl-8 lg:even:pl-12"
            >
              <ProjectCard project={project} />
            </li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}

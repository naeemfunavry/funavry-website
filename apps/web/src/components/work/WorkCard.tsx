"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shot, WorkProject } from "@/lib/work-model";

/** The capture a card leads with: the lead screen, else a phone. */
const coverOf = (p: WorkProject): Shot | null =>
  p.media.primary ?? p.media.phones[0] ?? null;

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * One project, one card: the capture, then an amber-ticked sector, the title
 * beside a round arrow, the tagline and the tags. The whole card is the link.
 *
 * `compact` drops the tagline and tags — for the case study's Related
 * Projects, where the card only needs to name the project.
 */
export default function WorkCard({
  project,
  delay = 0,
  compact = false,
}: {
  project: WorkProject;
  delay?: number;
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  const cover = coverOf(project);

  return (
    <motion.li
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: reduce ? 0 : delay, ease: EASE }}
    >
      <Link
        href={`/case-studies/${project.slug}`}
        aria-label={`${project.title} — view details`}
        className="group flex h-full flex-col overflow-hidden rounded-lg bg-paper-white ring-1 ring-line transition-[box-shadow,transform] duration-500 ease-smooth hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.35)] hover:ring-azure/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-paper-deep">
          {cover ? (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px"
              className={cn(
                "transition-transform duration-700 ease-smooth group-hover:scale-[1.04]",
                cover.kind === "mobile"
                  ? "object-contain p-3"
                  : "object-cover object-top",
              )}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_40%,rgba(68,158,216,0.25),transparent)]" />
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 lg:p-6">
          <span className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            <span aria-hidden className="h-[3px] w-3 flex-none bg-amber" />
            <span className="truncate">
              {project.sector.split("·")[0].trim()}
            </span>
          </span>

          <div className="mt-3 flex items-start justify-between gap-4">
            <h3
              title={project.title}
              className="line-clamp-2 text-[18px] font-medium leading-[1.25] tracking-[-0.015em] text-ink lg:text-[19px]"
            >
              {project.title}
            </h3>
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-ink-900 text-paper transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:bg-amber group-hover:text-ink-900">
              <ArrowUpRight size={18} aria-hidden />
            </span>
          </div>

          {!compact && (
            <>
              <p className="mt-3 text-[14px] leading-[1.6] text-ink-500">
                {project.tagline}
              </p>

              {project.tags.length > 0 && (
                <ul className="mt-auto flex flex-wrap gap-1 pt-5">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-line-strong px-3 py-1.5 text-[10px] leading-none text-ink-500"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </Link>
    </motion.li>
  );
}

"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import {
  PROJECT_CATEGORIES,
  type ProjectCategory,
  type Shot,
  type WorkProject,
} from "@/lib/work-model";
import { PHASE_STYLE } from "./phase";

/** The capture a row previews: the lead screen, else a phone. */
const coverOf = (p: WorkProject): Shot | null =>
  p.media.primary ?? p.media.phones[0] ?? null;

/** How many rows show before "Load more", and how many each press adds. */
const FIRST_PAGE = 12;
const PAGE_STEP = 6;

/* The floating preview never crops: its frame takes the capture's own shape,
   fitted inside this box. A very tall full-page capture would fit as a
   sliver, so the frame keeps a minimum width and the capture sits contained
   in it. `OFFSET` keeps the frame off the pointer so it never covers the
   text being read. */
const PREVIEW_MAX_W = 440;
const PREVIEW_MAX_H = 340;
const PREVIEW_MIN_W = 200;
const OFFSET = 28;

function frameFor(shot: Shot | null) {
  if (!shot) return { w: PREVIEW_MAX_W, h: PREVIEW_MAX_W / 1.6 };
  let w = PREVIEW_MAX_W;
  let h = w / shot.ratio;
  if (h > PREVIEW_MAX_H) {
    h = PREVIEW_MAX_H;
    w = Math.max(h * shot.ratio, PREVIEW_MIN_W);
  }
  return { w: Math.round(w), h: Math.round(h) };
}

const EASE = [0.19, 1, 0.22, 1] as const;

/**
 * The Work page as a horizontal showcase: one full-width row per project —
 * number and title, then the tagline and tags, then the details button —
 * split by hairlines. The first twelve show; "Load more" adds six at a time.
 *
 * Hovering a row brings its capture up beside the pointer and it trails the
 * cursor down the list; the other rows fall back.
 *
 * The preview is one shared layer over the whole list rather than one per
 * row, so moving between rows swaps the photo without the frame blinking
 * out. It only exists for a mouse from lg up; on touch and small screens each
 * row carries its capture inline instead.
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
  const [hovered, setHovered] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 260, damping: 30, mass: 0.6 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

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
  const hoveredProject = visible.find((p) => p.slug === hovered);
  const hoveredCover = hoveredProject ? coverOf(hoveredProject) : null;
  const frame = frameFor(hoveredCover);
  /* The pointer handler reads the frame from here, so it places the box
     for the capture on show rather than the one it was created with. */
  const frameRef = useRef(frame);
  frameRef.current = frame;

  function track(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !listRef.current) return;
    const box = listRef.current.getBoundingClientRect();
    /* Right of the pointer, vertically centred on it — flipped to the left
       when the frame would run off the list's right edge. */
    const { w, h } = frameRef.current;
    const px = e.clientX - box.left;
    const left = px + OFFSET + w > box.width ? px - OFFSET - w : px + OFFSET;
    const top = e.clientY - box.top - h / 2;
    x.set(left);
    y.set(top);
    /* Coming in from outside the list, start the frame at the pointer
       rather than springing it across from wherever it was left. */
    if (hovered === null) {
      sx.jump(left);
      sy.jump(top);
    }
  }

  return (
    <section
      id="work"
      aria-labelledby="work-list-heading"
      className="scroll-mt-24 bg-paper pt-16 lg:pt-24"
    >
      <Container wide className="pb-20 lg:pb-28">
        {/* Heading and filter pills. */}
        <div className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <h2
              id="work-list-heading"
              className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink"
            >
              <span aria-hidden className="h-px w-8 flex-none bg-azure" />
              Selected Work
            </h2>
            <p className="mt-4 text-[15px] text-ink-500">
              <span className="font-medium text-ink">{filtered.length}</span>{" "}
              {active === "all" ? "projects" : `${label} projects`} in
              production
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter projects by category"
            className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <ul className="flex min-w-max items-center gap-2 lg:flex-wrap lg:justify-end">
              {options.map((option) => {
                const on = option.id === active;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setHovered(null);
                        setShown(FIRST_PAGE);
                        setActive(option.id);
                      }}
                      className={cn(
                        "relative flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium transition-colors duration-300",
                        on
                          ? "text-paper"
                          : "bg-paper-deep text-ink-500 hover:bg-line hover:text-ink",
                      )}
                    >
                      {on && (
                        <motion.span
                          layoutId="showcase-filter-pill"
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-ink"
                          transition={
                            reduce
                              ? { duration: 0 }
                              : { duration: 0.5, ease: EASE }
                          }
                        />
                      )}
                      <span className="relative">{option.label}</span>
                      <span
                        className={cn(
                          "relative text-[11px] tabular-nums",
                          on ? "text-paper/60" : "text-ink-400",
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

        {/* The list, with the trailing preview over it. */}
        <div
          ref={listRef}
          onPointerMove={track}
          onPointerLeave={() => setHovered(null)}
          className="relative"
        >
          <ol key={active}>
            {visible.map((project, i) => (
              <ShowcaseRow
                key={project.slug}
                project={project}
                index={i}
                /* Rows arriving from "Load more" stagger in from the first
                   new one; the first page staggers from the top. */
                delay={
                  reduce ? 0 : (Math.abs(i - FIRST_PAGE) % PAGE_STEP) * 0.05
                }
                dimmed={hovered !== null && hovered !== project.slug}
                onEnter={() => setHovered(project.slug)}
              />
            ))}
          </ol>

          <motion.div
            aria-hidden
            style={{ x: reduce ? x : sx, y: reduce ? y : sy }}
            initial={false}
            animate={{ width: frame.w, height: frame.h }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
            className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
          >
            <AnimatePresence>
              {hoveredCover && hoveredProject && (
                <motion.div
                  key={hoveredProject.slug}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.9, rotate: -3 }
                  }
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute inset-0 overflow-hidden rounded-lg bg-paper-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] ring-1 ring-line"
                >
                  <Image
                    src={hoveredCover.src}
                    alt=""
                    fill
                    sizes={`${PREVIEW_MAX_W}px`}
                    className="object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

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
              className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full border border-ink pl-7 pr-2 text-[14.5px] font-medium text-ink transition-colors duration-500 hover:text-paper"
            >
              {/* The fill rises from below on hover. */}
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-ink transition-transform duration-500 ease-smooth group-hover:scale-y-100"
              />
              <span className="relative">
                Load more projects
                <span className="ml-2 text-ink-400 transition-colors duration-500 group-hover:text-paper/60">
                  ({Math.min(remaining, PAGE_STEP)} of {remaining})
                </span>
              </span>
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper transition-colors duration-500 group-hover:bg-azure">
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

/**
 * One project, one row. The whole row is the link; the button on the right is
 * its visual affordance, not a second link.
 */
function ShowcaseRow({
  project,
  index,
  delay,
  dimmed,
  onEnter,
}: {
  project: WorkProject;
  index: number;
  delay: number;
  dimmed: boolean;
  onEnter: () => void;
}) {
  const reduce = useReducedMotion();
  const cover = coverOf(project);
  const phase = PHASE_STYLE[project.phase];

  return (
    <motion.li
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className="border-b border-line"
    >
      <Link
        href={`/case-studies/${project.slug}`}
        aria-label={`${project.title} — view details`}
        onPointerEnter={onEnter}
        className={cn(
          "group relative grid grid-cols-[minmax(0,1fr)] gap-6 py-9 transition-opacity duration-500 ease-smooth focus-visible:outline-none lg:grid-cols-[minmax(0,38fr)_minmax(0,34fr)_minmax(0,28fr)] lg:items-center lg:gap-0 lg:py-11",
          dimmed && "lg:opacity-40",
        )}
      >
        {/* Inline capture — touch and small screens only. */}
        {cover && (
          /* The capture's own shape, so nothing is cropped — only a capture
             taller than 4:3 is contained in a 4:3 frame instead, so a
             full-page screenshot can't run the row off the screen. */
          <div
            style={{ aspectRatio: Math.max(cover.ratio, 4 / 3) }}
            className="relative overflow-hidden rounded-xl bg-paper-white ring-1 ring-line lg:hidden"
          >
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 1px"
              className="object-contain"
            />
          </div>
        )}

        {/* Number, phase and title. */}
        <div className="relative flex gap-5 lg:pr-10">
          <span className="w-9 flex-none pt-1.5 font-mono text-[13px] tabular-nums tracking-[0.1em] text-ink-400 transition-colors duration-300 group-hover:text-azure lg:w-11 lg:text-[14px]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
              <span
                className={cn("h-1.5 w-1.5 flex-none rounded-full", phase.dot)}
              />
              {project.phase}
              <span aria-hidden className="text-line-strong">
                /
              </span>
              <span className="truncate">
                {project.sector.split("·")[0].trim()}
              </span>
            </span>
            <h3 className="mt-3 text-[22px] font-medium leading-[1.25] tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-azure lg:text-[27px]">
              {project.title}
            </h3>
          </div>
        </div>

        {/* Tagline and tags. */}
        <div className="relative pl-14 lg:pl-0 lg:pr-10">
          <p className="max-w-[44ch] text-[15px] leading-[1.7] text-ink-500">
            {project.tagline}
          </p>
          {project.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-line-strong px-3.5 py-1.5 text-[12.5px] leading-none text-ink-500"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* The button. */}
        <div className="relative flex pl-14 lg:justify-end lg:pl-0">
          <span className="inline-flex h-11 items-center gap-2.5 rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper transition-colors duration-300 group-hover:bg-azure">
            View Details
            <ArrowUpRight
              size={15}
              aria-hidden
              className="transition-transform duration-500 ease-smooth group-hover:rotate-45"
            />
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

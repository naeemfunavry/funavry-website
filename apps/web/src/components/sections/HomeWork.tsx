"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useInView } from "@/lib/use-in-view";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { CASE_PHASE, type CaseStudy } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

const EXPO = [0.19, 1, 0.22, 1] as const;

/**
 * Where a card sits in the deck, by its distance from the one in front:
 * the front card whole; the next two stacked behind it to the right, each
 * smaller, dimmer and softer, so the deck reads as depth; the rest parked
 * out of sight — behind the stack to the right, or slid away to the left once
 * passed. Percentages of the card's own width, so the deck needs no
 * measuring and renders correctly on the server.
 */
function place(d: number, wide: boolean) {
  if (d === 0) return { x: 0, scale: 1, opacity: 1, blur: 0, z: 30 };
  if (d === 1)
    return {
      x: wide ? 58 : 16,
      scale: 0.84,
      opacity: wide ? 0.8 : 0.6,
      blur: 2,
      z: 20,
    };
  if (d === 2)
    return {
      x: wide ? 102 : 26,
      scale: 0.7,
      opacity: wide ? 0.55 : 0,
      blur: 4,
      z: 10,
    };
  if (d > 2)
    return { x: wide ? 130 : 30, scale: 0.6, opacity: 0, blur: 4, z: 0 };
  return { x: -30, scale: 0.9, opacity: 0, blur: 0, z: 0 };
}

/** How long a study holds the front before the deck moves on by itself. */
const DWELL = 5000;

/**
 * Selected Work on the home page, as a stacked deck on a dark panel: the
 * study in front whole, the next ones receding behind it, and under it the
 * study's name, what it does, and the way into it. Arrows, arrow keys and
 * swipes move the deck, and it loops.
 *
 * It also plays itself, every DWELL ms, but only where that helps: never under
 * reduced motion, never while it's off screen, and not while the pointer is
 * over it or focus is inside it. A pause button stops it outright — moving
 * content that runs on needs one (WCAG 2.2.2).
 */
export default function HomeWork({
  caseStudies,
}: {
  caseStudies: CaseStudy[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const swipeFrom = useRef<number | null>(null);
  const reduce = useReducedMotion() ?? false;
  const [sectionRef, inView] = useInView<HTMLElement>();

  const count = caseStudies.length;
  const go = useCallback(
    (i: number) => setActive(((i % count) + count) % count),
    [count],
  );

  const playing = !reduce && !paused && count > 1;
  useEffect(() => {
    if (!playing || hold || !inView) return;
    const id = window.setTimeout(() => go(active + 1), DWELL);
    return () => window.clearTimeout(id);
  }, [playing, hold, inView, active, go]);

  if (count === 0) return null;
  const study = caseStudies[active];
  const phase = CASE_PHASE[study.phase];

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative overflow-hidden bg-paper py-12 sm:py-16 lg:py-20"
    >
      {/* <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 88% 0%, rgba(68,158,216,0.10), transparent 62%), radial-gradient(60% 50% at 8% 100%, rgba(245,159,19,0.05), transparent 65%)",
        }}
      /> */}
      <div aria-hidden className="absolute inset-0 grid-paper opacity-[0.5]" />

      <Container wide className="relative">
        {/* Header — tag and heading left; intro and the way to everything else
            right. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Selected Work
              </span>
            </div>
            <h2 className="mt-6 text-h2 text-ink">
              <KineticWords text="Systems we've" />
              <br />
              <KineticWords
                text="put into service"
                delay={0.12}
                wordClassName="text-sweep"
              />
            </h2>
          </div>
          <Wipe delay={0.2}>
            <p className="text-lg leading-[1.75] text-ink-500">
              Web and enterprise platforms built end-to-end. Browse the deck, or
              open one for the full case study.
            </p>
            <Button
              href="/case-studies"
              variant="secondary"
              size="md"
              arrow
              className="mt-6"
            >
              View all case studies
            </Button>
          </Wipe>
        </div>

        {/* ---- The deck, on its dark panel. Focusable for the arrow keys. ---- */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Selected case studies"
          aria-describedby="home-work-hint"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(active + 1);
            if (e.key === "ArrowLeft") go(active - 1);
          }}
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null))
              setHold(false);
          }}
          onPointerDown={(e) => (swipeFrom.current = e.clientX)}
          onPointerUp={(e) => {
            if (swipeFrom.current === null) return;
            const dx = e.clientX - swipeFrom.current;
            swipeFrom.current = null;
            if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
          }}
          className="relative mt-10 touch-pan-y overflow-hidden rounded-2xl bg-ink-900 p-5 outline-none focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-4 focus-visible:ring-offset-paper sm:p-7 lg:mt-14 lg:p-10"
        >
          <p id="home-work-hint" className="sr-only">
            Use the left and right arrow keys, or the arrow buttons, to move
            between case studies.
          </p>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid-paper-dark opacity-60"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-[background] duration-700"
            style={{
              background: `radial-gradient(50% 60% at 20% 30%, rgba(${phase.tint},0.16), transparent 70%)`,
            }}
          />

          {/* The stack. The front card sets the height; the others are laid
              over it and pushed back. */}
          <ul className="relative w-full sm:w-[88%] lg:w-[56%]">
            {caseStudies.map((s, i) => {
              /* Distance round the loop, so the deck always has studies
                 behind the front one; the study just passed counts as -1 and
                 slides away to the left instead of jumping to the back. */
              let d = (((i - active) % count) + count) % count;
              if (d === count - 1 && count > 2) d = -1;
              const p = place(d, true);
              const m = place(d, false);
              return (
                <li
                  key={s.slug}
                  aria-hidden={d !== 0}
                  className={cn(
                    "left-0 top-0 w-full origin-left transition-[transform,opacity,filter] duration-700 ease-expo motion-reduce:transition-none",
                    // Phone positions by default, the wide deck from lg.
                    "[filter:blur(var(--b))] [opacity:var(--mo)] [transform:translateX(var(--mx))_scale(var(--ms))]",
                    "lg:[opacity:var(--do)] lg:[transform:translateX(var(--dx))_scale(var(--ds))]",
                    d === 0 ? "relative" : "absolute",
                    // Cards that are out of the deck take no pointer.
                    (d < 0 || d > 2) && "pointer-events-none",
                  )}
                  style={
                    {
                      zIndex: p.z,
                      "--mx": `${m.x}%`,
                      "--ms": m.scale,
                      "--mo": m.opacity,
                      "--dx": `${p.x}%`,
                      "--ds": p.scale,
                      "--do": p.opacity,
                      "--b": `${p.blur}px`,
                    } as React.CSSProperties
                  }
                >
                  <DeckCard
                    study={s}
                    front={d === 0}
                    priority={i <= 2}
                    onPick={() => go(i)}
                  />
                </li>
              );
            })}
          </ul>

          {/* Under the front card: its name, what it does, and the way in. */}
          <div className="relative mt-6 lg:mt-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={study.slug}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: EXPO }}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      "h-1.5 w-1.5 flex-none rounded-full",
                      phase.dot,
                    )}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65">
                    {study.phase} · {study.sector}
                  </span>
                </span>
                <h3 className="mt-3 text-[24px] font-medium leading-[1.15] tracking-[-0.025em] text-paper lg:text-[30px]">
                  {study.title}
                  <span className="text-paper/45"> — {study.tagline}</span>
                </h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {study.capabilities.slice(0, 3).map((c) => (
                    <li
                      key={c}
                      className="rounded-sm bg-paper-white px-3.5 py-2 text-[12.5px] font-medium leading-none text-ink"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
              <Link
                href={`/case-studies/${study.slug}`}
                className="group/link inline-flex min-h-[52px] items-center gap-2.5 rounded-sm bg-amber px-7 text-[15px] font-semibold text-ink-900 transition-colors duration-300 hover:bg-amber-600"
              >
                View case study
                <ArrowRight
                  size={16}
                  aria-hidden
                  className="transition-transform duration-500 ease-expo group-hover/link:translate-x-1 motion-reduce:transition-none"
                />
              </Link>

              <div className="flex items-center gap-3 sm:gap-4">
                {/* Announced when someone moves the deck, silent while it
                    plays itself, so a screen reader isn't talked over every
                    few seconds. */}
                <span
                  aria-live={playing && !hold ? "off" : "polite"}
                  className="font-mono text-[11px] tabular-nums tracking-[0.12em] text-paper/55"
                >
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(count).padStart(2, "0")}
                </span>
                {!reduce && count > 1 && (
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    aria-label={
                      paused
                        ? "Play the case studies"
                        : "Pause the case studies"
                    }
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-sm border border-paper/20 text-paper/80 transition-colors duration-300 hover:border-paper/50 hover:text-paper"
                  >
                    {paused ? (
                      <Play size={18} aria-hidden />
                    ) : (
                      <Pause size={18} aria-hidden />
                    )}
                  </button>
                )}
                <DeckArrow
                  label="Previous case study"
                  onClick={() => go(active - 1)}
                >
                  <ArrowLeft size={20} aria-hidden />
                </DeckArrow>
                <DeckArrow
                  label="Next case study"
                  onClick={() => go(active + 1)}
                >
                  <ArrowRight size={20} aria-hidden />
                </DeckArrow>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** One card of the deck: the study's capture, whole, on a rounded screen. A
    card behind the front one is a button that brings it forward. */
function DeckCard({
  study,
  front,
  priority,
  onPick,
}: {
  study: CaseStudy;
  front: boolean;
  priority: boolean;
  onPick: () => void;
}) {
  /* Never cropped side to side. The captures run from about 1.6:1 to 2.3:1
     against the screen's 16:10: one wider than the screen is shown whole,
     banded top and bottom, rather than losing its right-hand side; one no
     wider fills the screen and can only lose a little of its foot. */
  const { width, height } = study.image;
  const wide = width && height ? width / height > 16 / 9 : false;

  const screen = (
    <span className="relative block aspect-[16/9] overflow-hidden rounded-xl border border-paper/10 bg-paper-white shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)]">
      <Image
        src={study.image}
        alt={front ? `${study.title} — interface` : ""}
        fill
        quality={90}
        priority={priority}
        sizes={
          front
            ? "(max-width: 1024px) 88vw, 760px"
            : "(max-width: 1024px) 60vw, 560px"
        }
        className={
          wide ? "object-contain object-center" : "object-cover object-top"
        }
      />
    </span>
  );

  if (front) return screen;
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onPick}
      aria-label={`Show ${study.title}`}
      className="block w-full cursor-pointer"
    >
      {screen}
    </button>
  );
}

function DeckArrow({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-[52px] w-[52px] items-center justify-center rounded-sm bg-amber text-ink-900 transition-colors duration-300 hover:bg-amber-600"
    >
      {children}
    </button>
  );
}

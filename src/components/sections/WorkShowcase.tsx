"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import { FEATURED_CASE_STUDIES } from "@/lib/case-studies";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/* The Case Studies section, presented as a premium product reveal: each study
   lives inside a floating tablet, advanced through a carousel. See the note at
   the foot of the file on why the tablet floats rather than being held, and why
   the on-screen content carries no invented metrics. */

const STUDIES = FEATURED_CASE_STUDIES;

/* On the tablet's navy screen the light-background `-ink` phase colours are
   unreadable, so the on-dark tints are used instead — same three phase hues the
   rest of the site runs on. `rgb` drives the screen's ambient glow. */
const PHASE = {
  Build: { accent: "text-azure", dot: "bg-azure", rgb: "68,158,216" },
  Automate: { accent: "text-amber", dot: "bg-amber", rgb: "245,159,19" },
  Operate: {
    accent: "text-steel-300",
    dot: "bg-steel-300",
    rgb: "143,169,184",
  },
} as const;

const EXPO = [0.19, 1, 0.22, 1] as const;

/* The device is a photographic tablet-in-hands mockup (`public/work/hands.webp`);
   the case study renders *into* its white screen region rather than onto a
   CSS-drawn tablet. `screen` is that region as a percentage of the image
   (1536×1024) — the only thing to retune if the asset is swapped. On md-down
   the photo is hidden and the case study shows in a plain floating frame, so
   the hands never appear on mobile. */
const DEVICE = {
  src: "/work/hands.webp",
  aspect: 1536 / 1024,
  /** How much empty space to clip off the top of the photo (% of image height),
      so the tablet sits tight under the header instead of floating low. */
  cropTopPct: 25,
  /* The screen rectangle, as a % of the image. Sized to slightly overshoot the
     white screen on every side: the extra bleeds onto the dark bezel (invisible,
     dark on dark) and guarantees no white edge peeks through. */
  screen: { leftPct: 18.4, topPct: 29.7, widthPct: 63.4, heightPct: 52.9 },
} as const;

/* ── The page rendered inside the tablet ──────────────────────────────────────
   Sized entirely in container-query units (`cqi` = 1% of the screen's own
   width), so the whole layout scales with the device at any breakpoint without
   a single fixed pixel or a media query. */
function TabletPage({
  study,
  direction,
  reduce,
}: {
  study: (typeof STUDIES)[number];
  direction: number;
  reduce: boolean | null;
}) {
  const phase = PHASE[study.phase];

  const variants: Variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: reduce ? 0 : `${dir > 0 ? 5 : -5}%`,
    }),
    center: { opacity: 1, x: "0%" },
    exit: (dir: number) => ({
      opacity: 0,
      x: reduce ? 0 : `${dir > 0 ? -5 : 5}%`,
    }),
  };

  return (
    <motion.div
      key={study.slug}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: reduce ? 0.35 : 0.8, ease: "easeInOut" }}
      className="absolute inset-0"
    >
      {/* Screen field: deep navy with an ambient phase glow and a faint
          starfield — subtle, no neon. */}
      <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(155deg,#252b30_0%,#1a1f22_52%,#14181b_100%)]">
        <div
          aria-hidden
          className="absolute -left-[10%] -top-[14%] h-[70%] w-[70%] rounded-full blur-[8cqi]"
          style={{
            background: `radial-gradient(circle, rgba(${phase.rgb},0.28), transparent 70%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(245,246,244,0.5) 0.5px, transparent 0.6px)",
            backgroundSize: "3.4cqi 3.4cqi",
            maskImage:
              "radial-gradient(120% 120% at 30% 20%, black, transparent 75%)",
          }}
        />

        <div className="relative flex flex-col h-full items-center gap-[2.4cqi] p-[4cqi]">
          {/* Left — the case study's own words. Text is sized in cqi (relative
              to the screen region), tuned to sit inside the ~1.8:1 screen
              without clipping. */}
          <div className="flex flex-col w-full">
            <div className="flex  gap-[1.4cqi] font-mono uppercase tracking-[0.16em] text-[1.4cqi] text-paper/55">
              <span
                className={cn(
                  "h-[1.3cqi] w-[1.3cqi] flex-none rounded-full shrink-0",
                  phase.dot,
                )}
              />
              <span className="truncate">{study.sector}</span>
              <span className="text-paper/25">/</span>
              <span className={cn("flex-none", phase.accent)}>
                {study.phase}
              </span>
            </div>

            <h3 className="mt-[2.2cqi]  leading-[1.04] tracking-[-0.02em] text-[4.4cqi] text-paper">
              {study.title}
            </h3>

            {/* <p className="mt-[1.8cqi] max-w-[96%] leading-[1.5] text-[2.2cqi] text-paper/60 line-clamp-2">
              {study.summary}
            </p> */}

            {/* Tag, heading, paragraph, button — the landing page shows the
                headline of each study, not its full detail. The button scales
                with the device (cqi) so it stays in proportion at any size. */}
            <a
              href="/case-studies"
              className="mt-[2.8cqi] inline-flex items-center gap-[1.1cqi] self-start bg-paper px-[2.6cqi] py-[1cqi] tracking-[-0.01em] text-[1.55cqi] text-ink transition-colors duration-300 hover:bg-paper-white"
            >
              View Case Study
              <ArrowRight className="h-[2cqi] w-[2cqi]" />
            </a>
          </div>

          {/* Right — the real capture, floated in a browser card, the way the
              reference floats its dashboard. */}
          <div className="relative w-full">
            <div
              className="overflow-hidden w-full rounded-[1.8cqi] border border-paper/10 bg-[#0f1316] shadow-[0_6cqi_12cqi_-4cqi_rgba(0,0,0,0.6)]"
              style={{
                transform: reduce ? undefined : "rotateY(-4deg) rotateX(1deg)",
              }}
            >
              <div className="flex items-center gap-[1cqi] border-b border-paper/8 px-[2cqi] py-[1.4cqi]">
                <span className="h-[1.2cqi] w-[1.2cqi] rounded-full bg-paper/20" />
                <span className="h-[1.2cqi] w-[1.2cqi] rounded-full bg-paper/20" />
                <span className="h-[1.2cqi] w-[1.2cqi] rounded-full bg-paper/20" />
                <span className="ml-[1.4cqi] flex-1 truncate rounded-full bg-paper/[0.06] px-[2cqi] py-[0.8cqi] font-mono text-[1.4cqi] text-paper/40">
                  funavry.com/work/{study.slug}
                </span>
              </div>
              <div className="relative aspect-[16/9]">
                <Image
                  src={study.image}
                  alt={`${study.title} — product interface`}
                  fill
                  sizes="(max-width: 1024px) 64vw, 760px"
                  placeholder="blur"
                  className="object-cover object-top w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function WorkShowcase() {
  const reduce = useReducedMotion();
  const [sectionRef, inView] = useInView<HTMLElement>();
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const study = STUDIES[index];

  /* The visible aspect after clipping the photo's empty top: the full image is
     bottom-anchored inside this shorter box, so the top is cropped while the
     screen-region overlay keeps its true (full-image) coordinates. */
  const outerAspect = DEVICE.aspect / (1 - DEVICE.cropTopPct / 100);

  const go = useCallback(
    (dir: number) =>
      setState(([i]) => [(i + dir + STUDIES.length) % STUDIES.length, dir]),
    [],
  );

  /* Autoplay: advance on a timer while the section is on screen, paused on
     hover or touch so a slide is never pulled away mid-read. `paused` is a ref
     so pausing doesn't restart the interval. */
  const paused = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>();
  const pause = () => {
    clearTimeout(resumeTimer.current);
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };
  const resumeSoon = () => {
    resumeTimer.current = setTimeout(() => (paused.current = false), 900);
  };

  useEffect(() => {
    if (reduce || !inView) return;
    const id = setInterval(() => {
      if (paused.current || document.hidden) return;
      go(1);
    }, 5200);
    return () => clearInterval(id);
  }, [reduce, inView, go]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  /* Arrow keys drive the carousel while focus sits anywhere within it. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative overflow-hidden bg-paper pt-24 lg:pt-36"
    >
      {/* Minimal field: soft radial lift behind the device, a whisper of the
          engineering grid, and a few drifting motes. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 8%, rgba(68,158,216,0.06), transparent 60%), radial-gradient(90% 70% at 80% 100%, rgba(245,159,19,0.05), transparent 65%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-paper opacity-[0.5]" />
      {!reduce && (
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {[
            { l: "12%", t: "26%", s: 6, d: 13, delay: 0 },
            { l: "84%", t: "20%", s: 5, d: 16, delay: 1.5 },
            { l: "70%", t: "72%", s: 7, d: 15, delay: 0.8 },
            { l: "22%", t: "68%", s: 5, d: 18, delay: 2.2 },
            { l: "48%", t: "14%", s: 4, d: 20, delay: 1 },
          ].map((p, i) => (
            <span
              key={i}
              className="ws-mote absolute rounded-full bg-ink/20"
              style={{
                left: p.l,
                top: p.t,
                width: p.s,
                height: p.s,
                animationDuration: `${p.d}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      <Container wide className="relative">
        {/* Header — the site's section header: an azure hairline, the mono tag,
            and the display heading on the left; the intro and the deck arrows on
            the right. Same layout as Industries. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Case Studies
              </span>
            </div>
            <h2 className="mt-6 text-h1 text-ink">
              <KineticWords text="Enterprise platforms," />
              <br />
              <KineticWords text="in production." delay={0.12} />
            </h2>
          </div>

          <div className="flex flex-col gap-8">
            <Wipe delay={0.2}>
              <p className="text-base leading-[1.75] text-ink-500">
                Real systems we built, automated, and operate — each one live,
                and shown the way you would actually use it.
              </p>
            </Wipe>

            {/* View-all CTA and the deck arrows, together at the top right. */}
            <div className="flex flex-wrap items-center gap-4 lg:justify-end">
              <Button href="/case-studies" variant="primary" size="md" arrow>
                View All Case Studies
              </Button>
              <div className="flex flex-none items-center">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous case study"
                  aria-controls="work-carousel"
                  className="flex h-12 w-12 items-center justify-center border border-line-strong text-ink-500 transition-colors duration-300 hover:bg-ink hover:text-paper"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next case study"
                  aria-controls="work-carousel"
                  className="-ml-px flex h-12 w-12 items-center justify-center border border-line-strong text-ink-500 transition-colors duration-300 hover:bg-ink hover:text-paper"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <Rule className="mt-14 lg:mt-16" />

        {/* Tablet stage — the card fills the container. Hover/touch pauses the
            autoplay so a slide isn't pulled away while it's being read. */}
        <div
          id="work-carousel"
          role="group"
          aria-roledescription="carousel"
          aria-label="Case studies"
          onKeyDown={onKeyDown}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resumeSoon}
          /* Full container width; the desktop composite's height is kept in
             check by cropping the photo's empty top (see `outerAspect`). */
          className="relative mt-10 w-full lg:mt-14"
        >
          {/* Desktop (md+): the photographic tablet-in-hands, with the case
              study composited into its white screen region. `mix-blend-multiply`
              drops the photo's white background into the paper field so only the
              device and hands read. The outer box clips the photo's empty top
              (`cropTopPct`) by bottom-anchoring the full image inside it, so the
              tablet sits tight under the header. */}
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 56 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.9, ease: EXPO }}
            className="relative z-10 hidden w-full md:block"
          >
            {/* Outer: clips the cropped-off top. */}
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: `${outerAspect}` }}
            >
              {/* Inner: the full image, anchored to the bottom so the top is
                    what gets clipped. The screen overlay lives here, keeping its
                    true full-image coordinates. */}
              <div
                className="absolute inset-x-0 bottom-0"
                style={{ aspectRatio: `${DEVICE.aspect}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={DEVICE.src}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain mix-blend-multiply"
                />

                {/* The screen region — the case study renders here, in its own
                      container-query context so the layout scales with the device. */}
                <div
                  className="absolute overflow-hidden rounded-[1.6cqi]"
                  style={{
                    left: `${DEVICE.screen.leftPct}%`,
                    top: `${DEVICE.screen.topPct}%`,
                    width: `${DEVICE.screen.widthPct}%`,
                    height: `${DEVICE.screen.heightPct}%`,
                    containerType: "inline-size",
                  }}
                >
                  <AnimatePresence
                    initial={false}
                    mode="popLayout"
                    custom={direction}
                  >
                    <TabletPage
                      key={study.slug}
                      study={study}
                      direction={direction}
                      reduce={reduce}
                    />
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile (md-down): no hands — a plain framed card, full width, so the
              screen stays large and legible on a phone. */}
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EXPO }}
            className="relative w-full md:hidden"
          >
            <div
              className="relative aspect-[1.35/1] w-full overflow-hidden rounded-2xl bg-ink-900 shadow-[0_28px_64px_-30px_rgba(33,38,42,0.42)]"
              style={{ containerType: "inline-size" }}
            >
              <AnimatePresence
                initial={false}
                mode="popLayout"
                custom={direction}
              >
                <TabletPage
                  key={study.slug}
                  study={study}
                  direction={direction}
                  reduce={reduce}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Screen-reader announcement of the active slide. */}
        <p aria-live="polite" className="sr-only">
          Case study {index + 1} of {STUDIES.length}: {study.title}
        </p>
      </Container>
    </section>
  );
}

/* ── Notes ────────────────────────────────────────────────────────────────────
   Device: on md+ the tablet is the photographic mockup at `public/work/hands.webp`
   (a tablet-in-hands with a white screen). The case study is composited into its
   screen via the `DEVICE.screen` rectangle, and `mix-blend-multiply` drops the
   photo's white background into the paper field. To swap the photo, replace the
   file and retune `DEVICE.screen` (its white-screen rect, as % of the image).
   On md-down the photo is hidden and the case study shows in a plain dark frame,
   so hands never appear on mobile.

   Content: the on-screen copy is drawn only from real fields in
   `@/lib/case-studies` — title, sector, phase, summary, and the actual capture.
   No duration, technology list, or outcome percentages are shown, because none
   exist in the data and the set is deliberately metric-free. */

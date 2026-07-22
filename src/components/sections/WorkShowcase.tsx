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
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { FEATURED_CASE_STUDIES } from "@/lib/case-studies";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/* The Case Studies section, reworked as a Stripe-style product reveal: each
   study's real capture floats in a browser window over a phase-tinted gradient
   stage, ringed by stat cards that lift in one after another. The cards carry
   the deck's own portfolio HIGHLIGHTS (see `highlights` in @/lib/case-studies) —
   the only metrics on the home page, and they are approved facts, not invented.
   A carousel steps through the four featured studies; every step re-staggers
   the cards. See the note at the foot of the file. */

const STUDIES = FEATURED_CASE_STUDIES;

/* Each phase keeps the three logo hues it wears everywhere else. `dot` tints the
   card's accent bar; `stage` is the gradient field the browser floats on — a
   diagonal wash in the phase hue lit from the opposite corner by the warm amber
   glow, so the field reads rich (Stripe-like) without leaving our palette. */
const PHASE = {
  Build: {
    accent: "text-azure-ink",
    dot: "bg-azure",
    stage:
      "radial-gradient(120% 120% at 88% 92%, rgba(245,159,19,0.22), transparent 58%), linear-gradient(135deg, #EFF7FC 0%, #DDEEF9 34%, #8FCAEB 100%)",
  },
  Automate: {
    accent: "text-amber-ink",
    dot: "bg-amber",
    stage:
      "radial-gradient(120% 120% at 90% 88%, rgba(68,158,216,0.20), transparent 58%), linear-gradient(135deg, #FEF6E8 0%, #FDEBCF 34%, #F9C777 100%)",
  },
  Operate: {
    accent: "text-steel-ink",
    dot: "bg-steel",
    stage:
      "radial-gradient(120% 120% at 88% 90%, rgba(68,158,216,0.20), transparent 58%), linear-gradient(135deg, #EFF3F5 0%, #DBE3E8 34%, #8FA9B8 100%)",
  },
} as const;

const EXPO = [0.19, 1, 0.22, 1] as const;

type Study = (typeof STUDIES)[number];
type Stat = { value: string; detail: string };

/* The four floating cards for a study: its three deck highlights, then the
   delivery-footprint card (team above, client beneath). */
function statsFor(study: Study): Stat[] {
  const h = study.highlights ?? [];
  return [...h, { value: study.team ?? "", detail: study.client ?? "" }].slice(
    0,
    4,
  );
}

/* Where each of the four cards sits on the desktop stage. Laid out like the
   Stripe reference: two hang off the browser's left edge (upper, lower), two off
   the right (top, lower-middle), each pulled in far enough to overlap the capture.
   Index order matches statsFor. */
const CARD_POS = [
  "top-[24%] left-[11%]",
  "top-[9%] right-[10%]",
  "bottom-[15%] left-[13%]",
  "bottom-[22%] right-[9%]",
] as const;

/* A single stat card — small: a phase accent dot, the headline, and the mono
   context line. Same body in both layouts, floated on desktop, gridded on mobile. */
function StatCard({
  stat,
  dot,
  className,
}: {
  stat: Stat;
  dot: string;
  className?: string;
}) {
  if (!stat.value) return null;
  return (
    <div
      className={cn(
        "rounded-lg border border-ink/[0.06] bg-paper-white/90 px-3 py-2.5 backdrop-blur-md shadow-[0_18px_38px_-22px_rgba(20,30,50,0.55)]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 flex-none rounded-full", dot)} />
        <span className="text-[13.5px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
          {stat.value}
        </span>
      </div>
      <div className="mt-1 pl-[14px] font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-500">
        {stat.detail}
      </div>
    </div>
  );
}

/* The capture in a browser window — three dots, a URL pill, and the real
   screenshot. Reused by both layouts. */
function BrowserWindow({ study }: { study: Study }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink/[0.08] bg-paper-white shadow-[0_40px_80px_-32px_rgba(20,30,50,0.55)]">
      <div className="flex items-center gap-1.5 border-b border-line-soft bg-paper px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-ink/15" />
        <span className="h-2 w-2 rounded-full bg-ink/15" />
        <span className="h-2 w-2 rounded-full bg-ink/15" />
        <span className="ml-2 flex-1 truncate rounded-full bg-ink/[0.05] px-3 py-1 font-mono text-[10.5px] text-ink-500">
          funavry.com/work/{study.slug}
        </span>
      </div>
      <div className="relative aspect-[16/9]">
        <Image
          src={study.image}
          alt={`${study.title} — product interface`}
          fill
          sizes="(max-width: 1024px) 88vw, 680px"
          quality={90}
          placeholder="blur"
          className="h-full w-full object-cover object-top"
        />
      </div>
    </div>
  );
}

export default function WorkShowcase() {
  const reduce = useReducedMotion();
  const [sectionRef, inView] = useInView<HTMLElement>();
  const [index, setIndex] = useState(0);
  const study = STUDIES[index];
  const phase = PHASE[study.phase];
  const stats = statsFor(study);

  const go = useCallback(
    (dir: number) =>
      setIndex((i) => (i + dir + STUDIES.length) % STUDIES.length),
    [],
  );

  /* Autoplay while on screen, paused on hover/touch so a slide is never pulled
     away mid-read. `paused` is a ref so pausing doesn't restart the interval. */
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
    }, 5600);
    return () => clearInterval(id);
  }, [reduce, inView, go]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  /* Content crossfade + card stagger. The browser is the first child (no lift),
     the four cards follow on a fixed 0.12s cadence — the "same animation delay"
     Stripe uses to walk its cards on. */
  const content: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.55, delayChildren: reduce ? 0 : 0.15 },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };
  const cardIn: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18, scale: reduce ? 1 : 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduce ? 0.3 : 0.55, ease: EXPO },
    },
  };
  const browserIn: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: reduce ? 0.3 : 0.5 } },
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative overflow-hidden bg-paper py-14 lg:py-24"
    >
      {/* Field: soft radial lift and a whisper of the engineering grid. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 8%, rgba(68,158,216,0.06), transparent 60%), radial-gradient(90% 70% at 80% 100%, rgba(245,159,19,0.05), transparent 65%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-paper opacity-[0.5]" />

      <Container wide className="relative">
        {/* Header — unchanged: azure hairline, mono tag, the display heading on
            the left; intro and deck arrows on the right. */}
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

        {/* Stage — the Stripe reveal. Hover/touch pauses the autoplay. */}
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
          className="relative mt-10 lg:mt-14"
        >
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.9, ease: EXPO }}
            className="relative overflow-hidden rounded-lg"
          >
            {/* Gradient field — crossfades on phase change so the wash follows
                the study while the browser and cards animate over it. */}
            <AnimatePresence>
              <motion.div
                key={study.phase}
                aria-hidden
                className="absolute inset-0"
                style={{ background: phase.stage }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </AnimatePresence>

            {/* Desktop stage: browser centred, four cards floated at the
                corners. Fixed height so the absolute layout has room. */}
            <div className="relative hidden h-[560px] xl:h-[620px] lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={study.slug}
                  variants={content}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="absolute inset-0"
                >
                  {/* Browser — centred, overlapped at the edges by the cards. */}
                  <motion.div
                    variants={browserIn}
                    className="absolute left-1/2 top-1/2 w-[60%] max-w-[720px] -translate-x-1/2 -translate-y-1/2"
                  >
                    <BrowserWindow study={study} />
                  </motion.div>

                  {stats.map((stat, i) => (
                    <motion.div
                      key={`${study.slug}-${i}`}
                      variants={cardIn}
                      className={cn("absolute w-52", CARD_POS[i])}
                    >
                      <StatCard stat={stat} dot={phase.dot} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile stage: browser, then the stat cards in a 2-up grid. */}
            <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={study.slug}
                  variants={content}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <motion.div variants={browserIn}>
                    <BrowserWindow study={study} />
                  </motion.div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={`${study.slug}-m-${i}`}
                        variants={cardIn}
                      >
                        <StatCard stat={stat} dot={phase.dot} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Caption row — which study is on screen, plus the dot pager. */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <a
              href="/case-studies"
              className="group flex items-center gap-2.5 text-ink transition-colors hover:text-ink-500"
            >
              <span
                className={cn("h-2 w-2 flex-none rounded-full", phase.dot)}
              />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                {study.sector}
              </span>
              <span className="text-ink/25">/</span>
              <span className="text-[15px] font-medium tracking-[-0.01em]">
                {study.title}
              </span>
              <ArrowRight
                size={15}
                className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>

            <div className="flex items-center gap-2">
              {STUDIES.map((s, i) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show case study ${i + 1}: ${s.title}`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index
                      ? "w-6 bg-ink"
                      : "w-1.5 bg-ink/20 hover:bg-ink/40",
                  )}
                />
              ))}
            </div>
          </div>
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
   Layout: a phase-tinted gradient stage carries a browser-window capture with
   four stat cards floated at its corners (desktop) or gridded beneath it
   (mobile). The cards lift in on a fixed 0.12s stagger — the same walk-on cadence
   the Stripe reference uses — and re-run on every carousel step.

   Content: the on-stage numbers are the portfolio HIGHLIGHTS from Section 03 of
   the corporate deck (`highlights`, `client`, `team` in @/lib/case-studies),
   shown verbatim. They are the one deliberate exception to the otherwise
   metric-free set, because they are approved facts from the deck rather than
   figures invented for the site. */

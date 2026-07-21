"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  Film,
  GitBranch,
  ScanSearch,
  Scale,
  Sparkles,
  Store,
  TriangleAlert,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ProductWindow from "@/components/ui/ProductWindow";
import Laptop from "@/components/ui/Laptop";
import { KineticWords } from "@/components/ui/Kinetic";
import {
  CASE_PHASE,
  FEATURED_CASE_STUDIES,
  type CaseStudy,
} from "@/lib/case-studies";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/** Resolves `callouts[].icon` from the data. A callout names a capability, so
    the icon only ever has to say what kind of thing that capability is. */
const CALLOUT_ICONS: Record<string, LucideIcon> = {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  Film,
  GitBranch,
  Scale,
  ScanSearch,
  Sparkles,
  Store,
  TriangleAlert,
  Users,
  Video,
};

/* The four the home page carries. The rest live on /case-studies. */
const PROJECTS = FEATURED_CASE_STUDIES;
const N = PROJECTS.length;

/* Rendered twice so the deck loops without a seam: advancing past the last card
   scrolls forward into the copy, then resets to the matching real card with no
   animation. Going back before the first does the mirror of that. */
const SLIDES = [...PROJECTS, ...PROJECTS];

/** How long a card holds before the deck advances itself. */
const DWELL = 7000;

/** The body a capture is presented in. `window` is the bare thing, floating;
    `laptop` mounts the same window in a machine. Nothing below this line knows
    which — the screen is handed in, so the callouts anchor identically either
    way. */
function Body({
  frame,
  children,
}: {
  frame: CaseStudy["frame"];
  children: React.ReactNode;
}) {
  return frame === "laptop" ? <Laptop>{children}</Laptop> : <>{children}</>;
}

export default function Work() {
  const reduce = useReducedMotion();
  const [raw, setRaw] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const settleRef = useRef<ReturnType<typeof setTimeout>>();
  const [sectionRef, inView] = useInView<HTMLElement>();

  /* The scroll step is one card plus the gap between cards — read off the
     laid-out DOM so it stays right at every breakpoint. */
  const stepOf = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return 0;
    const a = vp.children[0] as HTMLElement | undefined;
    const b = vp.children[1] as HTMLElement | undefined;
    if (a && b) return b.offsetLeft - a.offsetLeft;
    return a?.offsetWidth ?? vp.clientWidth;
  }, []);

  const scrollTo = useCallback(
    (i: number, smooth: boolean) => {
      const vp = viewportRef.current;
      if (!vp) return;
      vp.scrollTo({
        left: i * stepOf(),
        behavior: smooth && !reduce ? "smooth" : "auto",
      });
    },
    [reduce, stepOf],
  );

  const go = useCallback(
    (d: -1 | 1) => {
      const vp = viewportRef.current;
      const step = stepOf();
      if (!vp || !step) return;
      const cur = Math.round(vp.scrollLeft / step);
      const target = cur + d;
      if (target < 0) {
        /* Going back off the front: hop into the copy (visually identical),
           then step left from there so the motion reads as a seamless wrap. */
        scrollTo(cur + N, false);
        requestAnimationFrame(() => scrollTo(cur + N - 1, true));
        return;
      }
      /* Forward past the last real card lands in the copy; the settle handler
         below normalises it back to the real card once the scroll stops. */
      scrollTo(target, true);
    },
    [stepOf, scrollTo],
  );

  /* The carousel is a native scroll-snap track: touch and trackpad drag it
     directly. We mirror the settled position back into `raw`, and once a scroll
     comes to rest inside the copy we jump it back to the real set. */
  const onScroll = useCallback(() => {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const vp = viewportRef.current;
        const step = stepOf();
        if (vp && step) setRaw(Math.round(vp.scrollLeft / step));
      });
    }

    clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      const vp = viewportRef.current;
      const step = stepOf();
      if (!vp || !step) return;
      const cur = Math.round(vp.scrollLeft / step);
      if (cur >= N) scrollTo(cur - N, false);
    }, 160);
  }, [stepOf, scrollTo]);

  /* Autoplay, pausable. Held in a ref so hovering or touching doesn't restart
     the timer — the deck pauses where it stands and resumes from there. */
  const paused = useRef(false);

  useEffect(() => {
    // No timer at all while the section is off screen — see `useInView`. This
    // deck is the expensive one: every advance re-renders eight slides, each
    // carrying a full-size product capture.
    if (reduce || !inView) return;
    const id = setInterval(() => {
      if (paused.current || document.hidden) return;
      go(1);
    }, DWELL);
    return () => clearInterval(id);
  }, [reduce, inView, go]);

  useEffect(() => {
    // Only while the deck is actually on screen. This is a window-level
    // listener, so unguarded it spent the whole page driving a carousel the
    // reader had long since scrolled past.
    if (!inView) return;
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
        return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, go]);

  /* Touch: pause while a finger is down, resume shortly after it lifts. */
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>();
  const holdTouch = () => {
    clearTimeout(resumeTimer.current);
    paused.current = true;
  };
  const releaseTouch = () => {
    resumeTimer.current = setTimeout(() => (paused.current = false), 900);
  };

  const activeDot = ((raw % N) + N) % N;

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative overflow-hidden border-t border-line bg-ink text-paper"
    >
      {/* Ink ground, white cards — the section opens the 'results' chapter, and
          the cards pop off the dark by contrast alone. The washes run at ink
          strength here; on paper they'd read as stains, which is why they sit
          this much lower in the light sections. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 grid-paper-dark"
      />
      <div
        aria-hidden
        className="absolute -left-[8%] -top-[12%] h-[520px] w-[520px] rounded-full bg-azure/[0.14] blur-[140px]"
      />
      <div
        aria-hidden
        className="absolute -bottom-[20%] right-[4%] h-[460px] w-[460px] rounded-full bg-amber/[0.08] blur-[140px]"
      />

      <Container wide className="relative z-10 py-16 sm:py-24 lg:py-32">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/50">
                Our Case Studies
              </span>
            </div>
            <h2 className="mt-6 text-h1 text-paper">
              <KineticWords text="Platforms in production," />
              <br />
              <KineticWords text="outcomes in the field." delay={0.12} />
            </h2>
          </div>

          {/* Deck controls and the way out of the section, together at the top
              right. `flex-wrap` rather than a fixed row: at the narrow end of
              tablet the button and the two arrows don't fit beside a heading
              this size, and wrapping the button above them keeps both usable
              instead of squeezing the label. */}
          <div className="flex flex-none flex-wrap items-center gap-x-5 gap-y-4">
            <Button href="/case-studies" variant="primary" size="md" arrow>
              Explore more case studies
            </Button>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous project"
                className="flex h-12 w-12 items-center justify-center border border-paper/20 text-paper/60 transition-colors duration-300 hover:bg-paper hover:text-ink"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next project"
                className="-ml-px flex h-12 w-12 items-center justify-center border border-paper/20 text-paper/60 transition-colors duration-300 hover:bg-paper hover:text-ink"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div aria-hidden className="mt-14 h-px w-full bg-paper/10" />

        {/* Showcase — a scroll-snap deck of cards. Hovering or touching it takes
            the wheel from the autoplay. */}
        <div
          ref={viewportRef}
          onScroll={onScroll}
          onMouseEnter={() => (paused.current = true)}
          onMouseLeave={() => (paused.current = false)}
          onFocusCapture={() => (paused.current = true)}
          onBlurCapture={() => (paused.current = false)}
          onTouchStart={holdTouch}
          onTouchEnd={releaseTouch}
          className="scrollbar-hide mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth lg:mt-12"
        >
          {SLIDES.map((project, i) => {
            const phase = CASE_PHASE[project.phase];
            const isActive = raw === i;
            return (
              <div
                key={`${project.slug}-${i}`}
                className="w-[86%] shrink-0 snap-start sm:w-[70%] lg:w-[64%]"
              >
                <article
                  className={cn(
                    // Not a Frame any more. Frame is a drafting frame — square
                    // corners and four corner ticks that mark a datum — and ticks
                    // on a rounded, shadowed card read as chrome that lost its
                    // corners. It still answers to `group/frame`, because that's
                    // the hook ProductWindow hangs its hover on.
                    "group/frame relative h-full overflow-hidden rounded-[20px] bg-paper-white",
                    "shadow-[0_1px_2px_rgba(46,52,54,0.04),0_18px_44px_-24px_rgba(46,52,54,0.20)]",
                    "transition-[filter,box-shadow] duration-500",
                    "hover:shadow-[0_2px_4px_rgba(46,52,54,0.05),0_30px_70px_-28px_rgba(46,52,54,0.28)]",
                    // Inactive slides are de-emphasised by desaturation, not by
                    // `opacity`: a 50% opacity card blends its text into the page
                    // and collapses contrast (axe flagged the sector badge at
                    // 1.43:1). Grayscale keeps luminance contrast intact.
                    isActive ? "grayscale-0" : "grayscale",
                  )}
                >
                  <div className="grid h-full gap-8  lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 ">
                    {/* Left — the story. */}
                    <div className="flex flex-col pr-0 p-7 sm:p-9 lg:p-10 lg:pr-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="border border-amber/40 bg-amber-50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-ink">
                          {project.sector}
                        </span>
                        {/* <span className="flex items-center gap-1.5 border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
                        <span
                          aria-hidden
                          className={cn("h-1 w-1 rounded-full", phase.dot)}
                        />
                        {project.phase}
                      </span> */}
                      </div>

                      <h3 className="mt-7 text-h3 text-ink">{project.title}</h3>

                      <p className="mt-5 text-[15px] leading-[1.75] text-ink-500">
                        {project.summary}
                      </p>

                      <a
                        href="/case-studies"
                        className="group/view mt-auto inline-flex items-center gap-2 pt-8 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:text-azure-ink"
                      >
                        View
                        <ArrowUpRight
                          size={14}
                          className="transition-transform duration-400 ease-expo group-hover/view:-translate-y-0.5 group-hover/view:translate-x-0.5"
                        />
                      </a>
                    </div>

                    {/* Right — the product, turned on a lit desk. The divider rule
                      is gone: the card is one continuous white surface now, and
                      a hairline down the middle of it reads as a seam. */}
                    <div className="relative pr-7 sm:pr-9 lg:pr-10">
                      <div
                        aria-hidden
                        className="absolute inset-0 opacity-70 transition-opacity duration-700 ease-expo group-hover/frame:opacity-100"
                        style={{
                          background: `radial-gradient(120% 85% at 50% -12%, rgba(${phase.tint},0.10), transparent 62%)`,
                        }}
                      />

                      <div
                        className="relative flex h-full min-h-[200px] items-center"
                        style={{ perspective: "1600px" }}
                      >
                        {/* The turn. 16° with the left edge forward, so the near
                          corner faces the story it belongs to.

                          Inset to 84% and pushed right at lg, and that number is
                          the callouts' doing: each chip hangs to the LEFT of its
                          anchor, and at full width they'd hang straight off the
                          desk and land on the summary. 84% buys back roughly the
                          chip's own width, so the annotations live in the desk
                          and the gap instead of on the prose. */}
                        <div
                          className="relative w-full lg:ml-auto lg:w-[100%]"
                          style={{
                            transform: "rotateY(-16deg) rotateX(0deg)",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          <Body frame={project.frame}>
                            {/* This box is exactly the window, which is what the
                                callouts below measure against. Wrapping it in a
                                laptop adds a bezel, a chin and a whole deck — so
                                the anchors have to be nested in HERE, not out at
                                the turn, or every `at.y` would be read against a
                                box that includes the machine around it. */}
                            <div className="relative">
                              <ProductWindow
                                study={project}
                                sizes="(max-width: 1024px) 86vw, 32vw"
                              />

                              {/* Callouts. They live INSIDE the turned space, which is
                            the whole trick: an anchor placed out here in flat
                            coordinates would miss by ~3.5% of the window's width
                            once the perspective divide is applied, which at this
                            size is a whole table row. In here it is glued to the
                            pixel it names, at any viewport, for free.

                            `top` walks past the 24px chrome first, so `at.y`
                            stays a fraction of the capture itself rather than of
                            the window — the anchors are read off the screenshot,
                            so they should mean the screenshot.

                            Below lg the card stacks and the desk goes full-width;
                            there is nowhere for a chip to hang, so they don't. */}
                            </div>
                          </Body>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {/* Dot pagination — the active one runs out to a pill. */}
        <div className="mt-12 flex items-center justify-center gap-2">
          {PROJECTS.map((project, i) => (
            <button
              key={project.slug}
              type="button"
              onClick={() => scrollTo(i, true)}
              aria-label={`Go to ${project.title.split("—")[0].trim()}`}
              aria-current={activeDot === i}
              /* 24px hit area (WCAG 2.5.8 target size) wrapping the small visual
                 bar — the dot itself stays 6px, the tappable button doesn't. */
              className="group flex h-6 min-w-[24px] items-center justify-center"
            >
              <span
                aria-hidden
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-500 ease-expo",
                  activeDot === i
                    ? "w-7 bg-amber"
                    : "w-1.5 bg-paper/25 group-hover:bg-paper/50",
                )}
              />
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}

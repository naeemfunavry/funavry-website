"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Frame from "@/components/ui/Frame";
import { KineticWords } from "@/components/ui/Kinetic";
import { CASE_PHASE, FEATURED_CASE_STUDIES } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

/* The four the home page carries. The rest live on /case-studies. */
const PROJECTS = FEATURED_CASE_STUDIES;
const N = PROJECTS.length;

/* Rendered twice so the deck loops without a seam: advancing past the last card
   scrolls forward into the copy, then resets to the matching real card with no
   animation. Going back before the first does the mirror of that. */
const SLIDES = [...PROJECTS, ...PROJECTS];

/** How long a card holds before the deck advances itself. */
const DWELL = 7000;

export default function Work() {
  const reduce = useReducedMotion();
  const [raw, setRaw] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const settleRef = useRef<ReturnType<typeof setTimeout>>();

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
    if (reduce) return;
    const id = setInterval(() => {
      if (paused.current || document.hidden) return;
      go(1);
    }, DWELL);
    return () => clearInterval(id);
  }, [reduce, go]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
        return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

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
      id="work"
      className="relative overflow-hidden border-t border-line bg-ink text-paper"
    >
      {/* The opening of the dark 'results' chapter — case studies here, the
          proof counters directly below. White cards pop on ink; a fine white
          grid and two soft washes give the ground depth. */}
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

      <Container wide className="relative z-10 py-24 lg:py-32">
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

          <div className="flex flex-none items-center">
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

        <div aria-hidden className="mt-14 h-px w-full bg-paper/15" />

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
                <Frame
                  as="article"
                  tint={phase.tint}
                  className={cn(
                    "h-full transition-opacity duration-500",
                    isActive ? "opacity-100" : "opacity-50",
                  )}
                  innerClassName="grid h-full gap-8 p-7 sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:p-10"
                >
                  {/* Left — the story. */}
                  <div className="flex flex-col">
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

                  {/* Right — the product. Bleeds to the card's outer edges. */}
                  <div className="relative overflow-hidden border border-line bg-paper-deep -mx-7 -mb-7 mt-2 sm:-mx-9 sm:-mb-9 lg:-my-10 lg:-mr-10 lg:ml-0 lg:mt-0 lg:border-l lg:border-r-0 lg:border-t-0 lg:border-b-0">
                    <div className="relative h-full min-h-[200px] w-full">
                      <Image
                        src={project.image}
                        alt={`${project.title} — product interface`}
                        fill
                        placeholder="blur"
                        sizes="(max-width: 1024px) 86vw, 36vw"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                </Frame>
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
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 ease-expo",
                activeDot === i
                  ? "w-7 bg-amber"
                  : "w-1.5 bg-paper/25 hover:bg-paper/50",
              )}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button href="/case-studies" variant="primary" size="md" arrow>
            Explore more case studies
          </Button>
        </div>
      </Container>
    </section>
  );
}

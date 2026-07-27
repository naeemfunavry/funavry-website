"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import { INDUSTRIES, type Industry } from "@/lib/industries";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/* All ten ride the deck now — nothing hides behind a button. Rendered twice so
   the track loops without a seam: advancing past the last tile scrolls on into
   the copy, then resets to the matching real tile with no animation. */
const N = INDUSTRIES.length;
const SLIDES = [...INDUSTRIES, ...INDUSTRIES];

/** How long a tile holds before the deck advances itself. Quicker than the case
    study deck's 7s — these are glanceable tiles, not a page of prose. */
const DWELL = 3800;

/* Azure, the same datum colour `Frame` marks every other card with — the ticks
   are the site's language, not this card's.

   Held at the open size and scaled down at rest, rather than growing `h`/`w`
   on hover. The old version ran `transition-all` over width and height, which
   is layout on every frame of a 500ms transition — and there are four of these
   per tile across twenty tiles, so hovering anywhere in the deck put eighty
   layout-animated boxes on the compositor's plate. Each instance supplies its
   own `origin-*` so the corner it's pinned to stays put as it scales. */
const TICK =
  "pointer-events-none absolute h-3.5 w-3.5 scale-[0.571] border-azure/0 transition-[transform,border-color] duration-500 ease-expo group-hover:scale-100 group-hover:border-azure";

function Tile({ industry, index }: { industry: Industry; index: number }) {
  return (
    <Wipe delay={(index % 4) * 0.05} duration={0.9} className="h-full">
      {/* Not `Frame`: it renders content at z-10, which would bury its own
          corner ticks under a full-bleed photo. Same drafting language, drawn
          over the image in paper so it reads against the picture. */}
      <article className="group relative h-[300px] overflow-hidden border border-line bg-ink-900 lg:h-[340px]">
        {/* `next/image`, not a bare `<img>`. These are ~110KB JPEGs apiece and
            the deck renders every one of them twice for the loop, so the raw
            tag was shipping the full-resolution original — twenty times over,
            no WebP, no responsive size — to fill a tile that is never wider
            than about a quarter of the viewport. `sizes` is what lets Next
            pick a variant that matches the tile instead of the file.

            Hover moves scale only. It used to be `transition-all` alongside a
            `grayscale` filter, which re-filters the whole photo every frame
            of a 700ms transition on every hover — expensive, and on a
            full-bleed image it is the most expensive kind of repaint there
            is. The zoom carries the interaction on its own. */}
        <Image
          src={industry.image}
          alt=""
          fill
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.06]"
        />

        {/* The scrim does two jobs: it holds the heading legible over whatever
            the photo happens to be, and it deepens on hover to carry the
            paragraph that appears under it.

            Two stacked gradients cross-faded on opacity, rather than one
            gradient transitioning its own colour stops. Interpolating a stop
            means re-rasterising the whole gradient every frame, and this one
            covers the full tile — 700ms of full-bleed repaint per hover. Two
            static gradients rasterise once each and the compositor blends
            them for free. */}
        {/* Mobile has no hover, so the card holds the hovered end-state
            permanently there: the deep scrim is up and the description is
            open (see the grid below). The `lg:` prefixes restore the
            hover-driven cross-fade on pointer devices — desktop unchanged. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/45 to-ink-900/10 opacity-0 transition-opacity duration-700 ease-expo lg:opacity-100 lg:group-hover:opacity-0"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/75 to-ink-900/35 opacity-100 transition-opacity duration-700 ease-expo lg:opacity-0 lg:group-hover:opacity-100"
        />

        <span
          aria-hidden
          className={cn(TICK, "left-0 top-0 origin-top-left border-l border-t")}
        />
        <span
          aria-hidden
          className={cn(
            TICK,
            "right-0 top-0 origin-top-right border-r border-t",
          )}
        />
        <span
          aria-hidden
          className={cn(
            TICK,
            "bottom-0 left-0 origin-bottom-left border-b border-l",
          )}
        />
        <span
          aria-hidden
          className={cn(
            TICK,
            "bottom-0 right-0 origin-bottom-right border-b border-r",
          )}
        />

        {/* <span className="absolute left-4 top-4 border border-paper/20 bg-ink-900/50 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-paper backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")}
        </span> */}

        <div className="absolute inset-x-0 bottom-0 flex flex-col p-5">
          <h3 className="text-[17px] font-medium leading-snug tracking-[-0.02em] text-paper lg:text-[18px]">
            {industry.name}
          </h3>

          {/* 0fr → 1fr animates the height of content whose height nobody knows
              — a `max-h` guess either clips the long names or eases against
              dead space. `focus-within` opens it for the keyboard, since the
              button inside is reachable by tab even while the row is closed.

              Open by default so touch users — who never trigger `group-hover`
              — always see the description, proof point, and Explore CTA.
              Previously all three were hidden on mobile and the card was just a
              photo with a title. The `lg:` prefixes collapse it back to the
              hover-reveal on desktop, which is untouched. */}
          <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-expo lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr] lg:group-focus-within:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <p className="mt-2.5 line-clamp-2 text-[13px] leading-[1.6] text-paper/70">
                {industry.desc}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1 w-1 flex-none rounded-full bg-azure"
                />
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50">
                  {industry.proof}
                </span>
              </div>

              <Button
                href="#contact"
                variant="paper"
                size="sm"
                arrow
                className="mt-4 self-start"
              >
                Explore
              </Button>
            </div>
          </div>
        </div>
      </article>
    </Wipe>
  );
}

export default function Industries() {
  const reduce = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout>>();
  const [sectionRef, inView] = useInView<HTMLElement>();

  /* The scroll step is one tile plus the gap — read off the laid-out DOM so it
     stays right at every breakpoint, where the tile count per view changes. */
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
      /* Forward past the last real tile lands in the copy; the settle handler
         below normalises it back to the real tile once the scroll stops. */
      scrollTo(target, true);
    },
    [stepOf, scrollTo],
  );

  /* Native scroll-snap track: touch and trackpad drag it directly. Once a
     scroll comes to rest inside the copy we jump it back to the real set. */
  const onScroll = useCallback(() => {
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
    // No timer at all while the section is off screen — see `useInView`.
    if (reduce || !inView) return;
    const id = setInterval(() => {
      if (paused.current || document.hidden) return;
      go(1);
    }, DWELL);
    return () => clearInterval(id);
  }, [reduce, inView, go]);

  /* Touch: pause while a finger is down, resume shortly after it lifts. */
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>();
  const holdTouch = () => {
    clearTimeout(resumeTimer.current);
    paused.current = true;
  };
  const releaseTouch = () => {
    resumeTimer.current = setTimeout(() => (paused.current = false), 900);
  };

  useEffect(() => {
    return () => {
      clearTimeout(settleRef.current);
      clearTimeout(resumeTimer.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="industries"
      className="relative overflow-hidden border-t border-line"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />

      <Container wide className="relative z-10 py-16 sm:py-24 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Industries
              </span>
            </div>
            <h2 className="mt-6 text-h1 text-ink">
              <KineticWords text="Domain depth where" />
              <br />
              <KineticWords text="it actually matters." delay={0.12} />
            </h2>
          </div>

          <div className="flex flex-col gap-8">
            <Wipe delay={0.2}>
              <p className="text-[16px] leading-[1.75] text-ink-500">
                Ten industries, five hundred delivered projects. We speak the
                regulatory language, the data models, and the operational
                reality of each.
              </p>
            </Wipe>

            {/* Deck controls, parked at the top right of the section. */}
            <div className="flex flex-none items-center lg:justify-end">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous industry"
                aria-controls="industries-track"
                className="flex h-12 w-12 items-center justify-center border border-line-strong text-ink-500 transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next industry"
                aria-controls="industries-track"
                className="-ml-px flex h-12 w-12 items-center justify-center border border-line-strong text-ink-500 transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <Rule className="mt-14 lg:mt-16" />

        {/* Hovering or touching the deck takes the wheel from the autoplay. */}
        <div
          id="industries-track"
          ref={viewportRef}
          onScroll={onScroll}
          onMouseEnter={() => (paused.current = true)}
          onMouseLeave={() => (paused.current = false)}
          onFocusCapture={() => (paused.current = true)}
          onBlurCapture={() => (paused.current = false)}
          onTouchStart={holdTouch}
          onTouchEnd={releaseTouch}
          className="scrollbar-hide mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth lg:mt-12"
        >
          {SLIDES.map((industry, i) => (
            <div
              key={`${industry.name}-${i}`}
              /* Four up at lg, two at sm, one-and-a-peek on mobile — the peek
                 is what tells a thumb the row keeps going. Widths subtract the
                 gaps so the tiles land on the same rhythm the grid had. */
              className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
            >
              <Tile industry={industry} index={i} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

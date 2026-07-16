"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import { INDUSTRIES, type Industry } from "@/lib/industries";
import { cn } from "@/lib/utils";

/** One row at rest. The rest sit behind the button. */
const VISIBLE = 4;

/* Azure, the same datum colour `Frame` marks every other card with — the ticks
   are the site's language, not this card's. */
const TICK =
  "pointer-events-none absolute h-2 w-2 border-azure/0 transition-all duration-500 ease-expo group-hover:h-3.5 group-hover:w-3.5 group-hover:border-azure";

function Tile({ industry, index }: { industry: Industry; index: number }) {
  return (
    <Wipe delay={(index % 4) * 0.05} duration={0.9} className="h-full">
      {/* Not `Frame`: it renders content at z-10, which would bury its own
          corner ticks under a full-bleed photo. Same drafting language, drawn
          over the image in paper so it reads against the picture. */}
      <article className="group relative h-[300px] overflow-hidden border border-line bg-ink-900 lg:h-[340px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={industry.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover grayscale-[0.55] transition-all duration-700 ease-expo group-hover:scale-[1.06] group-hover:grayscale-0"
        />

        {/* The scrim does two jobs: it holds the heading legible over whatever
            the photo happens to be, and it deepens on hover to carry the
            paragraph that appears under it. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/45 to-ink-900/10 transition-all duration-700 ease-expo group-hover:via-ink-900/75 group-hover:to-ink-900/35"
        />

        <span
          aria-hidden
          className={cn(TICK, "left-0 top-0 border-l border-t")}
        />
        <span
          aria-hidden
          className={cn(TICK, "right-0 top-0 border-r border-t")}
        />
        <span
          aria-hidden
          className={cn(TICK, "bottom-0 left-0 border-b border-l")}
        />
        <span
          aria-hidden
          className={cn(TICK, "bottom-0 right-0 border-b border-r")}
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
              button inside is reachable by tab even while the row is closed. */}
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-expo group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
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
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion();

  const shown = expanded ? INDUSTRIES : INDUSTRIES.slice(0, VISIBLE);
  const rest = INDUSTRIES.length - VISIBLE;

  return (
    <section
      id="industries"
      className="relative overflow-hidden border-t border-line"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />

      <Container wide className="relative z-10 py-24 lg:py-32">
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

          <Wipe delay={0.2}>
            <p className="text-[16px] leading-[1.75] text-ink-500">
              Ten industries, five hundred delivered projects. We speak the
              regulatory language, the data models, and the operational reality
              of each.
            </p>
          </Wipe>
        </div>

        <Rule className="mt-14 lg:mt-16" />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          <AnimatePresence initial={false}>
            {shown.map((industry, i) => (
              <motion.div
                key={industry.name}
                layout={!reduce}
                initial={i < VISIBLE ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{
                  duration: 0.5,
                  ease: [0.19, 1, 0.22, 1],
                  // The revealed rows arrive in sequence, not all at once.
                  delay: expanded ? ((i - VISIBLE) % 4) * 0.06 : 0,
                }}
              >
                <Tile industry={industry} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            arrow
          >
            {expanded ? "Show fewer industries" : `Explore more industries`}
          </Button>
        </div>
      </Container>
    </section>
  );
}

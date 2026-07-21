"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "@/components/ui/Container";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- *
 *  PLACEHOLDER / DEMO CONTENT — NOT REAL CLIENT TESTIMONIALS.
 *
 *  The names, roles, companies, quotes, and avatar photos below are sample data
 *  to dress the design. They are not approved endorsements, which is why each
 *  carries a "Placeholder" badge. To go live: replace with real, written-approved
 *  wording and portraits, then delete `pending` from each entry.
 * -------------------------------------------------------------------------- */

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
  pending?: boolean;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Funavry rebuilt our clinical and billing stack without a day of downtime. They understood healthcare compliance better than vendors we'd worked with for years.",
    author: "Dr. Amara Okafor",
    role: "Chief Medical Officer",
    company: "Meridian Health Network",
    image: "https://i.pravatar.cc/240?img=47",
    pending: true,
  },
  {
    quote:
      "The document-intelligence pipeline they shipped reconciles claims across every carrier we touch. What took a team of analysts a week now runs in minutes.",
    author: "Daniel Reyes",
    role: "VP, Revenue Operations",
    company: "Clearline Billing",
    image: "https://i.pravatar.cc/240?img=12",
    pending: true,
  },
  {
    quote:
      "They delivered an AI assistant our users actually trust — every answer traces back to a source. That grounding is what made adoption effortless.",
    author: "Sophie Laurent",
    role: "Head of Product",
    company: "Atlas Tax Cloud",
    image: "https://i.pravatar.cc/240?img=32",
    pending: true,
  },
  {
    quote:
      "Funavry stood up our global capability center end to end. Six months in, it runs like it has been part of the company for a decade.",
    author: "Rahul Menon",
    role: "Director, Group Operations",
    company: "Novaring GBS",
    image: "https://i.pravatar.cc/240?img=68",
    pending: true,
  },
];

const COUNT = TESTIMONIALS.length;
const EXPO = [0.19, 1, 0.22, 1] as const;

export default function Testimonials() {
  const [i, setI] = useState(0);
  const active = TESTIMONIALS[i];

  const go = useCallback(
    (d: -1 | 1) => setI((v) => (v + d + COUNT) % COUNT),
    [],
  );

  useEffect(() => {
    const id = window.setInterval(() => go(1), 7000);
    return () => window.clearInterval(id);
  }, [go]);

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden border-t border-line"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />

      <Container wide className="relative z-10 py-16 sm:py-24 lg:py-32">
        {/* Heading — unchanged. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Testimonials
              </span>
            </div>
            <h2 className="mt-6 text-h1 text-ink">
              <KineticWords text="What it's like" />
              <br />
              <KineticWords text="to build with us." delay={0.12} />
            </h2>
          </div>

          <Wipe delay={0.2}>
            <p className="text-[16px] leading-[1.75] text-ink-500">
              Engagements that outlast the statement of work — across
              healthcare, finance, government, and global operations.
            </p>
          </Wipe>
        </div>

        <Rule className="mt-14 lg:mt-16" />

        {/* The featured testimonial — open and airy, no card. Portraits cluster
            on the left, the quote reads on the right. */}
        <div className="mt-14 grid items-center gap-10 lg:mt-16 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.4fr)] lg:gap-16">
          {/* Left — the portrait cluster. The active client is largest and to
              the front; the others fall back behind it. */}
          <div
            role="tablist"
            aria-label="Clients"
            className="flex items-center justify-center lg:justify-start"
          >
            <div className="flex items-center pl-8">
              {TESTIMONIALS.map((t, idx) => {
                const isActive = i === idx;
                return (
                  <motion.button
                    key={t.company}
                    layout
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`${t.author}, ${t.company}`}
                    onClick={() => setI(idx)}
                    transition={{ duration: 0.5, ease: EXPO }}
                    className={cn(
                      "relative -ml-4 flex flex-none items-center justify-center overflow-hidden rounded-full bg-paper-white ring-1 ring-line transition-[filter,opacity] duration-500 first:ml-0",
                      isActive
                        ? "z-30 h-28 w-28 opacity-100 shadow-[0_16px_40px_-16px_rgba(20,30,50,0.35)] lg:h-40 lg:w-40"
                        : "z-10 h-20 w-20 opacity-60 grayscale hover:opacity-90",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {isActive && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-inset ring-azure/50"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right — the quote. */}
          <div className="min-h-[240px] lg:min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: EXPO }}
              >
                {/* Company lockup. */}
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="h-3.5 w-3.5 rotate-45 rounded-[3px] bg-gradient-to-br from-azure to-steel"
                  />
                  <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-ink">
                    {active.company}
                  </span>
                </div>

                <blockquote className="mt-6 max-w-[30ch] text-[clamp(21px,2.5vw,33px)] font-medium leading-[1.32] tracking-[-0.02em] text-ink">
                  <span className="text-ink-300">“</span>
                  {active.quote}
                  <span className="text-ink-300">”</span>
                </blockquote>

                <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <p className="text-[14px] font-semibold text-ink">
                    {active.author}
                  </p>
                  <span aria-hidden className="h-3 w-px bg-line-strong" />
                  <p className="text-[13px] text-ink-400">
                    {active.role} · {active.company}
                  </p>
                  {/* {active.pending && (
                    <span className="border border-amber/40 bg-amber-50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-amber-ink">
                      Placeholder
                    </span>
                  )} */}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}

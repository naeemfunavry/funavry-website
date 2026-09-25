"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  KeyRound,
  Languages,
  Layers,
  Plug,
  Search,
  Shield,
  Shirt,
  Stethoscope,
  TrendingUp,
  Truck,
  Video,
  Wallet,
  WifiOff,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import type { DetailChallenge } from "@/lib/case-study-details";
import { cn } from "@/lib/utils";

const EXPO = [0.19, 1, 0.22, 1] as const;
/** How long each challenge holds before the next, while the section is in
    view and nobody is pointing at it. */
const HOLD_MS = 7000;

/**
 * A challenge's topic, read from keywords in its title (first rule to match
 * wins): its glyph, and a photograph in /public/challenges. The briefs don't
 * carry either, so the topic is the one thing both can be chosen from.
 * Photographs are from Unsplash (free for commercial use, no attribution).
 *
 * Order matters. Domain words (clinical, truck, token, garment) come first,
 * because a title like "Manual Truck Assignment Doesn't Scale" is about
 * logistics, not scale; broad words (risk, scale, manual) come last.
 */
const TOPICS: [RegExp, LucideIcon, string][] = [
  [/prescrib|clinic|patient|health|medical/, Stethoscope, "healthcare"],
  [/garment|sizing|fit|body scan|shopper|fashion|apparel/, Shirt, "fashion"],
  [/truck|transport|logistic|driver|vehicle|fleet|supplier|farms|depot/, Truck, "logistics"],
  [/crypto|wallet|token|custody|launch|yield|idle balance|reward|loyal/, Wallet, "crypto"],
  [/tutor|lesson|student|educat|learn/, GraduationCap, "education"],
  [/language|bilingual|translat|reading direction/, Languages, "language"],
  [/identity|auth|login|verif|onboard/, KeyRound, "identity"],
  [/payment|billing|revenue|reconcil|commission|money|card fee|spending|rent/, CreditCard, "payments"],
  [/video|stream|on.screen|scene|tagging|annotat|advertis|editorial|publish|readers|monetiz/, Video, "media"],
  [/extraction|unstructured|ocr|document intake|classif/, FileText, "documents"],
  [/offline|connectivity|sync/, WifiOff, "offline"],
  [/incident|corrective|audit|paper trail|legal case/, ClipboardList, "audit"],
  [/visibility|dashboard|report|analytic|kpi|metric|insight|market data|real-time/, BarChart3, "dashboards"],
  [/search|discover|find|research|navigat|buried|corpus/, Search, "search"],
  [/tax|form|template|configur|master data|check-sheet|filing|paper/, FileText, "forms"],
  [/integrat|disconnected|fragment|separate|silo|single source|erp|api/, Plug, "integration"],
  [/workflow|routing|dispatch|assignment|handoff|sequential|hard-coded|request|waiting list|manual/, Workflow, "workflow"],
  [/secur|fraud|complian|risk|privacy|blacklist|kyc|aml/, Shield, "security"],
  [/scal|throughput|volume|performance|high-traffic|concurren|growing|growth/, TrendingUp, "scale"],
  [/data|document|record|asset/, FileText, "documents"],
];

function topicOf(title: string): { Icon: LucideIcon; photo: string } {
  const t = title.toLowerCase();
  const hit = TOPICS.find(([re]) => re.test(t));
  return {
    Icon: hit?.[1] ?? Layers,
    photo: `/challenges/${hit?.[2] ?? "platform"}.webp`,
  };
}

/**
 * Key Challenges & Solutions, on the dark stage. The challenges line up on the
 * left; the chosen one opens on the right — its photograph, then the problem
 * and the answer side by side, amber into azure. It steps through them on its
 * own while in view, pausing under the pointer; on a phone each opens beneath
 * its own title instead.
 */
export default function ChallengeShowcase({
  lead,
  challenges,
}: {
  lead: string;
  challenges: DetailChallenge[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const reduce = useReducedMotion();
  const uid = useId();
  const root = useRef<HTMLElement>(null);

  const count = challenges.length;
  const playing = !reduce && !paused && inView && count > 1;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % count), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [playing, active, count]);

  if (count === 0) return null;
  const current = challenges[active];

  return (
    <section
      ref={root}
      id="challenges"
      aria-labelledby="challenges-heading"
      className="relative overflow-hidden bg-ink-900"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(55% 60% at 8% 12%, rgba(68,158,216,0.20), transparent 65%)",
            "radial-gradient(45% 55% at 96% 90%, rgba(245,159,19,0.12), transparent 65%)",
            "radial-gradient(60% 60% at 60% 110%, rgba(55,96,121,0.30), transparent 70%)",
          ].join(","),
        }}
      />
      <div aria-hidden className="absolute inset-0 grid-paper-dark" />
      <div aria-hidden className="absolute inset-0 grain opacity-[0.14] mix-blend-overlay" />

      <Container wide className="relative py-16 lg:py-24">
        {/* Head — the case study's chapter frame, on dark. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-amber" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/70">
                Key Challenges & Solutions
              </span>
            </div>
            <h2 id="challenges-heading" className="mt-6 text-h3 text-paper">
              The problems, and how they were solved.
            </h2>
          </div>
          {lead && (
            <p className="text-[15px] leading-[1.75] text-paper/60">{lead}</p>
          )}
        </div>

        <div
          className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* ----------------------------------------------- The list ---- */}
          <ul
            role="tablist"
            aria-orientation="vertical"
            aria-label="Challenges"
            className="border-t border-paper/10"
          >
            {challenges.map((item, i) => {
              const on = i === active;
              const { Icon } = topicOf(item.title);
              return (
                <li key={item.title} className="border-b border-paper/10">
                  <button
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${i}`}
                    aria-selected={on}
                    aria-controls={`${uid}-panel`}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                      e.preventDefault();
                      const next = (i + (e.key === "ArrowDown" ? 1 : -1) + count) % count;
                      setActive(next);
                      document.getElementById(`${uid}-tab-${next}`)?.focus();
                    }}
                    className="group relative flex w-full items-center gap-4 py-5 text-left outline-none focus-visible:bg-paper/[0.04] lg:py-6"
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 flex-none items-center justify-center border transition-colors duration-500",
                        on
                          ? "border-amber bg-amber text-ink-900"
                          : "border-paper/15 text-paper/60 group-hover:border-paper/35 group-hover:text-paper",
                      )}
                    >
                      <Icon size={18} strokeWidth={1.6} aria-hidden />
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-[16px] font-medium leading-snug tracking-[-0.015em] transition-colors duration-500 lg:text-[18px]",
                        on ? "text-paper" : "text-paper/50 group-hover:text-paper/80",
                      )}
                    >
                      {item.title}
                    </span>
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className={cn(
                        "hidden flex-none transition-all duration-500 ease-expo lg:block",
                        on
                          ? "translate-x-0 text-amber opacity-100"
                          : "-translate-x-2 text-paper/40 opacity-0",
                      )}
                    />

                    {/* The hold, filling under the open challenge. */}
                    {on && (
                      <span aria-hidden className="absolute inset-x-0 -bottom-px h-px bg-paper/10">
                        <span
                          key={`${active}-${playing}`}
                          className="block h-full bg-amber"
                          style={
                            playing
                              ? { animation: `challenge-hold ${HOLD_MS}ms linear forwards` }
                              : { width: "100%" }
                          }
                        />
                      </span>
                    )}
                  </button>

                  {/* On a phone the challenge opens under its own title. */}
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: EXPO }}
                        className="overflow-hidden lg:hidden"
                      >
                        <div className="pb-6">
                          <Detail item={item} compact />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          {/* ------------------------------------------ The open one ---- */}
          <div
            id={`${uid}-panel`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${active}`}
            className="hidden lg:block"
          >
            <div className="sticky top-28">
              <Detail item={current} />
            </div>
          </div>
        </div>
      </Container>

      <style>{`@keyframes challenge-hold { from { width: 0% } to { width: 100% } }`}</style>
    </section>
  );
}

/** The open challenge: its photograph with the title over it, then the
    problem and the answer. */
function Detail({ item, compact = false }: { item: DetailChallenge; compact?: boolean }) {
  const { Icon, photo } = topicOf(item.title);

  return (
    <div className="overflow-hidden border border-paper/10 bg-paper/[0.03]">
      <div className={cn("relative overflow-hidden", compact ? "aspect-[16/9]" : "aspect-[16/8]")}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={photo + item.title}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EXPO }}
            className="absolute inset-0"
          >
            <Image
              src={photo}
              alt=""
              fill
              quality={90}
              sizes="(max-width: 1024px) 92vw, 760px"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(0deg,#21262A_0%,rgba(33,38,42,0.55)_45%,rgba(33,38,42,0.1)_100%)]"
        />
        <span
          aria-hidden
          className="absolute left-0 top-0 h-[3px] w-24 bg-amber"
        />
        {!compact && (
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-7">
            <span className="flex h-12 w-12 flex-none items-center justify-center border border-paper/20 bg-ink-900/60 text-amber backdrop-blur-sm">
              <Icon size={20} strokeWidth={1.6} aria-hidden />
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h3
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.45, ease: EXPO }}
                className="text-[24px] font-medium leading-[1.2] tracking-[-0.025em] text-paper"
              >
                {item.title}
              </motion.h3>
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.45, ease: EXPO, delay: 0.05 }}
          className="relative grid sm:grid-cols-2"
        >
          <div className="p-6 lg:p-7">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
              Challenge
            </span>
            <p className="mt-3 text-[14.5px] leading-[1.75] text-paper/65">
              {item.challenge}
            </p>
          </div>
          <div className="border-t border-paper/10 bg-azure/[0.06] p-6 sm:border-l sm:border-t-0 lg:p-7">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-azure-300">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-azure" />
              Solution
            </span>
            <p className="mt-3 text-[14.5px] leading-[1.75] text-paper/85">
              {item.solution}
            </p>
          </div>

          {/* The hand-off, on the seam between the two. */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-paper/20 bg-ink-900 text-amber sm:flex"
          >
            <ArrowRight size={14} />
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

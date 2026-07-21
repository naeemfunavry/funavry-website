"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  LayoutGrid,
  Blocks,
  Glasses,
  Cpu,
  Satellite,
  BarChart3,
  ShieldCheck,
  BadgeCheck,
  Server,
  Network,
  Building2,
  Calculator,
  Bot,
  GitBranch,
  Users,
  X,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import Button from "@/components/ui/Button";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import { SERVICES, type Service } from "@/lib/services";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  BrainCircuit,
  LayoutGrid,
  Blocks,
  Glasses,
  Cpu,
  Satellite,
  BarChart3,
  ShieldCheck,
  BadgeCheck,
  Server,
  Network,
  Building2,
  Calculator,
  Bot,
  GitBranch,
  Users,
};

/** Each phase keeps its colour, so a service's badge says where it acts. */
const PHASE = {
  Build: { text: "text-azure", dot: "bg-azure", tint: "68,158,216" },
  Automate: { text: "text-amber-ink", dot: "bg-amber", tint: "245,159,19" },
  Operate: { text: "text-steel", dot: "bg-steel", tint: "55,96,121" },
} as const;

const GROUPS = [
  {
    key: "tech" as const,
    label: "Technology & Engineering",
    count: 10,
    blurb: "The systems we design, build, and run.",
  },
  {
    key: "gbs" as const,
    label: "Global Business Services",
    count: 6,
    blurb: "The operating models and teams behind them.",
  },
];

/* ------------------------------------------------------------------ */

function ServiceCard({ service, onOpen }: { service: Service; onOpen: () => void }) {
  const Icon = ICONS[service.icon];
  const phase = PHASE[service.phase];

  return (
    <Frame
      as="button"
      type="button"
      tint={phase.tint}
      onClick={onOpen}
      aria-label={`Open ${service.title}`}
      className="w-full text-left"
      innerClassName="flex h-full flex-col p-5 lg:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <Icon size={22} strokeWidth={1.5} className="text-ink" />
        <span className="font-mono text-[10px] tracking-[0.14em] text-ink-400">
          {service.n}
        </span>
      </div>

      <h3 className="mt-6 text-[16px] font-medium leading-snug tracking-[-0.015em] text-ink">
        {service.title}
      </h3>

      <p className="mt-2.5 line-clamp-2 text-[13px] leading-[1.6] text-ink-400">
        {service.summary}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="flex items-center gap-2">
          <span aria-hidden className={cn("h-1 w-1 rounded-full", phase.dot)} />
          <span className={cn("font-mono text-[9.5px] uppercase tracking-[0.16em]", phase.text)}>
            {service.phase}
          </span>
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-400 transition-colors group-hover/frame:text-ink">
          {service.subs.length} services
          <ArrowUpRight
            size={12}
            className="transition-transform duration-400 ease-expo group-hover/frame:-translate-y-0.5 group-hover/frame:translate-x-0.5"
          />
        </span>
      </div>

      {/* Hover drawer. It hangs off the card's bottom edge and opens on a
          0fr → 1fr row, so the height animates without us measuring it. It
          stays a descendant of the card button: the pointer moving into it
          keeps the card hovered, and a click there still opens the sheet. */}
      <div
        className={cn(
          "absolute inset-x-[-1px] top-[calc(100%+1px)] grid grid-rows-[0fr] overflow-hidden opacity-0",
          "border-x border-b border-line-strong bg-paper-white",
          "shadow-[0_22px_44px_-28px_rgba(46,52,54,0.45)]",
          "transition-[grid-template-rows,opacity] duration-500 ease-expo motion-reduce:transition-none",
          "group-hover/frame:grid-rows-[1fr] group-hover/frame:opacity-100",
          "group-focus-visible/frame:grid-rows-[1fr] group-focus-visible/frame:opacity-100"
        )}
      >
        <div className="min-h-0">
          <div className="px-5 pb-5 pt-4 lg:px-6 lg:pb-6">
            <ul className="space-y-2">
              {service.subs.slice(0, 3).map((sub, i) => (
                <li key={sub.title} className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[9.5px] text-ink-400">
                    {service.n}.{i + 1}
                  </span>
                  <span className="text-[12px] leading-[1.45] text-ink-500">{sub.title}</span>
                </li>
              ))}
            </ul>

            {service.subs.length > 3 && (
              <p className="mt-2 pl-[26px] font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-400">
                +{service.subs.length - 3} more
              </p>
            )}

            {/* A span, not a button — the whole card is already the button. */}
            <span className="mt-4 flex min-h-[38px] items-center justify-center gap-2 rounded-sm bg-ink px-4 text-[12px] font-medium text-paper transition-colors duration-300 ease-standard group-hover/frame:bg-ink-900">
              View practice
              <ArrowUpRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Detail({ service, onClose }: { service: Service; onClose: () => void }) {
  const Icon = ICONS[service.icon];
  const phase = PHASE[service.phase];

  // Escape closes, and the page behind must not scroll while the sheet is up.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={service.title}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="relative max-h-[88vh] w-full max-w-[840px] overflow-y-auto border border-line bg-paper-white sm:mx-6"
      >
        {/* Phase seam. */}
        <div aria-hidden className={cn("absolute inset-x-0 top-0 h-[3px]", phase.dot)} />

        <div className="flex items-start justify-between gap-6 border-b border-line p-7 pt-8 lg:p-10">
          <div className="flex items-start gap-5">
            <span className="flex h-12 w-12 flex-none items-center justify-center border border-line">
              <Icon size={22} strokeWidth={1.5} className="text-ink" />
            </span>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.16em] text-ink-400">
                  {service.n}
                </span>
                <span aria-hidden className="h-px w-4 bg-line-strong" />
                <span className={cn("font-mono text-[9.5px] uppercase tracking-[0.16em]", phase.text)}>
                  {service.phase}
                </span>
              </div>
              <h3 className="mt-3 max-w-[24ch] text-[22px] font-medium leading-snug tracking-[-0.025em] text-ink lg:text-[28px]">
                {service.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 flex-none items-center justify-center border border-line text-ink-500 transition-colors hover:bg-ink hover:text-paper"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-7 lg:p-10">
          <p className="max-w-[64ch] text-[15.5px] leading-[1.75] text-ink-500">
            {service.summary}
          </p>

          <div className="mt-9 grid gap-px bg-line sm:grid-cols-2">
            {service.subs.map((sub, i) => (
              <motion.div
                key={sub.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="bg-paper-white p-5 lg:p-6"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] text-ink-400">
                    {service.n}.{i + 1}
                  </span>
                  <h4 className="text-[15px] font-medium leading-snug text-ink">{sub.title}</h4>
                </div>
                <p className="mt-2 pl-[30px] text-[13px] leading-[1.65] text-ink-400">
                  {sub.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button href="#contact" variant="ink" size="md" arrow onClick={onClose}>
              Discuss this service
            </Button>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-400">
              {GROUPS.find((g) => g.key === service.group)?.label}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

export default function Capabilities() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = SERVICES.find((s) => s.n === openId) ?? null;

  return (
    <section id="capabilities" className="relative overflow-hidden border-t border-line">
      <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />

      <Container wide className="relative z-10 py-16 sm:py-24 lg:py-32">
        {/* Header. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Capabilities
              </span>
            </div>
            <h2 className="mt-6 text-h1 text-ink">
              <KineticWords text="Sixteen practices," />
              <br />
              <KineticWords text="one delivery chain." delay={0.12} wordClassName={() => "text-sweep"} />
            </h2>
          </div>

          <Wipe delay={0.2}>
            <p className="text-[16px] leading-[1.75] text-ink-500">
              Ten technology and engineering practices, six Global Business
              Services practices. They aren&apos;t separate menus — each sits
              where it creates value across{" "}
              <span className="font-medium text-azure">build</span>,{" "}
              <span className="font-medium text-amber-ink">automate</span>, and{" "}
              <span className="font-medium text-steel">operate</span>. Open any
              one to see what&apos;s inside.
            </p>
          </Wipe>
        </div>

        <Rule className="mt-14 lg:mt-16" />

        {/* Two groups, all sixteen on the page. */}
        {GROUPS.map((group, gi) => (
          <div key={group.key} className={gi === 0 ? "mt-12 lg:mt-14" : "mt-16 lg:mt-20"}>
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink">
                  {group.label}
                </span>
                <span className="font-mono text-[10.5px] text-ink-400">
                  {String(group.count).padStart(2, "0")} practices
                </span>
              </div>
              <p className="text-[13.5px] text-ink-400">{group.blurb}</p>
            </div>

            {/* auto-rows-fr keeps every card in a row the same height, whatever
                the title wraps to. */}
            <div className="mt-5 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {SERVICES.filter((s) => s.group === group.key).map((service, i) => (
                <Wipe
                  key={service.n}
                  delay={(i % 5) * 0.05}
                  duration={0.8}
                  bleed
                  /* The hovered cell rises so its drawer sits over the row below. */
                  className="relative h-full hover:z-20 focus-within:z-20"
                >
                  <ServiceCard service={service} onOpen={() => setOpenId(service.n)} />
                </Wipe>
              ))}
            </div>
          </div>
        ))}
      </Container>

      <AnimatePresence>
        {open && <Detail service={open} onClose={() => setOpenId(null)} />}
      </AnimatePresence>
    </section>
  );
}

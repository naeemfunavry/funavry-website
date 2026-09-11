"use client";

import { ArrowRight } from "lucide-react";
import Frame from "@/components/ui/Frame";
import { SERVICE_ICONS } from "@/components/ui/ServiceDrawer";
import {
  INTEREST_BY_PHASE,
  INTEREST_EVENT,
} from "@/components/sections/Contact";
import { CASE_PHASE } from "@/lib/case-studies";
import { SERVICES, type Service } from "@/lib/services";
import { cn } from "@/lib/utils";

/* Two practices from each phase, ordered so that on a three-column grid every
   column is one phase: Build, then Automate, then Operate, left to right. */
const PICKS = ["02", "01", "08", "07", "14", "16"];
const NEEDS = PICKS.map((n) => SERVICES.find((s) => s.n === n)).filter(
  (s): s is Service => Boolean(s),
);

function NeedCard({ service }: { service: Service }) {
  const phase = CASE_PHASE[service.phase];
  const Icon = SERVICE_ICONS[service.icon];

  return (
    <Frame
      as="a"
      href="#contact"
      tint={phase.tint}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent(INTEREST_EVENT, {
            detail: INTEREST_BY_PHASE[service.phase],
          }),
        )
      }
      className="block h-full"
      innerClassName="flex h-full flex-col p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className="flex h-10 w-10 flex-none items-center justify-center border border-line"
          style={{ color: `rgb(${phase.tint})` }}
        >
          {Icon && <Icon size={18} strokeWidth={1.6} />}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className={cn("h-1 w-1 rounded-full", phase.dot)} />
          <span
            className={cn(
              "font-mono text-[9.5px] uppercase tracking-[0.16em]",
              phase.text,
            )}
          >
            {service.phase}
          </span>
        </span>
      </div>

      <h3 className="mt-6 text-[17px] font-medium leading-snug tracking-[-0.015em] text-ink">
        {service.title}
      </h3>
      <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-[1.65] text-ink-500">
        {service.summary}
      </p>

      <span className="mt-auto flex items-center gap-2 pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400 transition-colors duration-300 group-hover/frame:text-ink">
        Discuss this
        <ArrowRight
          size={13}
          className="transition-transform duration-500 ease-expo group-hover/frame:translate-x-1"
        />
      </span>
    </Frame>
  );
}

/** Six practices as entry points. Choosing one scrolls to the form with the
    matching phase already selected. */
export default function NeedGrid() {
  return (
    <div>
      {/* Column heads — only meaningful when the grid is three across. */}
      <div className="mb-4 hidden grid-cols-3 gap-5 lg:grid">
        {(["Build", "Automate", "Operate"] as const).map((name) => (
          <div key={name} className="flex items-center gap-2.5">
            <span
              aria-hidden
              className={cn("h-px w-6", CASE_PHASE[name].dot)}
            />
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.2em]",
                CASE_PHASE[name].text,
              )}
            >
              {name}
            </span>
          </div>
        ))}
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {NEEDS.map((service) => (
          <li key={service.n}>
            <NeedCard service={service} />
          </li>
        ))}
      </ul>
    </div>
  );
}

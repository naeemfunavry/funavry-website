"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/lib/services";
import { PHASE, SERVICE_ICONS } from "@/lib/service-style";
import { cn } from "@/lib/utils";

const EXPO = [0.19, 1, 0.22, 1] as const;

/**
 * Global Business Services, as a line of stops. The practices sit on a
 * vertical rule; the chosen one lights amber, the rule fills down to it, and
 * its detail opens beside the line — or, on a phone, beneath its own stop.
 */
export default function GbsTimeline({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  const uid = useId();
  const current = services[active];

  /* How far down the rule the amber fill runs: to the middle of the chosen
     stop, as a share of the list. */
  const fill = ((active + 0.5) / services.length) * 100;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
      <div className="relative">
        {/* The rule, and its amber fill. */}
        <span
          aria-hidden
          className="absolute bottom-0 left-[9px] top-0 w-px bg-line-strong"
        />
        <span
          aria-hidden
          className="absolute left-[9px] top-0 w-px bg-amber transition-[height] duration-700 ease-expo"
          style={{ height: `${fill}%` }}
        />

        <ul role="tablist" aria-orientation="vertical" aria-label="Global Business Services">
          {services.map((service, i) => {
            const on = i === active;
            return (
              <li key={service.slug}>
                <button
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={`${uid}-panel`}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      const next =
                        (i + (e.key === "ArrowDown" ? 1 : -1) + services.length) %
                        services.length;
                      setActive(next);
                      document.getElementById(`${uid}-tab-${next}`)?.focus();
                    }
                  }}
                  className="group relative flex w-full items-center gap-7 py-4 text-left lg:py-5"
                >
                  <Stop on={on} />
                  <span
                    className={cn(
                      "text-[20px] font-medium leading-snug tracking-[-0.025em] transition-colors duration-500 lg:text-[26px]",
                      on ? "text-ink" : "text-ink/35 group-hover:text-ink/60",
                    )}
                  >
                    {service.title}
                  </span>
                </button>

                {/* On a phone the detail opens under its own stop. */}
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EXPO }}
                      className="overflow-hidden pl-[46px] lg:hidden"
                    >
                      <Detail service={service} compact />
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>

      {/* From lg up the detail sits beside the line. */}
      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${active}`}
        className="relative hidden lg:block"
      >
        <div className="sticky top-32 border border-line bg-paper-white p-10 xl:p-12">
          <span aria-hidden className="absolute left-0 top-0 h-[3px] w-24 bg-amber" />
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: EXPO }}
            >
              <Detail service={current} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** A stop on the rule: a hollow ring, filled amber when chosen. */
function Stop({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative z-10 flex h-[19px] w-[19px] flex-none items-center justify-center rounded-full border-2 bg-paper-deep transition-colors duration-500",
        on ? "border-amber" : "border-line-strong group-hover:border-ink-400",
      )}
    >
      <span
        className={cn(
          "h-[7px] w-[7px] rounded-full bg-amber transition-transform duration-500 ease-expo",
          on ? "scale-100" : "scale-0",
        )}
      />
    </span>
  );
}

function Detail({ service, compact = false }: { service: Service; compact?: boolean }) {
  const Icon = SERVICE_ICONS[service.icon];
  const phase = PHASE[service.phase];

  return (
    <div className={cn(compact && "pb-6 pt-1")}>
      {!compact && Icon && (
        <span className="relative inline-flex">
          <Icon size={52} strokeWidth={1.2} aria-hidden className="text-ink" />
          <span
            aria-hidden
            className="absolute -bottom-1 -right-2 h-5 w-5 rounded-full bg-amber mix-blend-multiply"
          />
        </span>
      )}

      {!compact && (
        <h3 className="mt-8 text-[26px] font-medium leading-[1.15] tracking-[-0.025em] text-ink">
          {service.title}
        </h3>
      )}

      <div className={cn("flex items-center gap-2", compact ? "" : "mt-3")}>
        <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", phase.dot)} />
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.18em]",
            phase.text,
          )}
        >
          {service.phase}
        </span>
      </div>

      <p
        className={cn(
          "leading-[1.75] text-ink-500",
          compact ? "mt-3 text-[15px]" : "mt-5 text-[16px]",
        )}
      >
        {service.summary}
      </p>

      <ul
        className={cn(
          "grid gap-x-8 gap-y-4 border-t border-line",
          compact ? "mt-5 pt-5" : "mt-7 pt-7 sm:grid-cols-2",
        )}
      >
        {service.subs.map((sub) => (
          <li key={sub.title} className="flex gap-3">
            <span
              aria-hidden
              className="mt-[8px] h-1 w-1 flex-none rounded-full bg-amber"
            />
            <div>
              <p className="text-[14px] font-medium leading-snug text-ink">
                {sub.title}
              </p>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-400 first-letter:uppercase">
                {sub.desc}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Link
        href={`/services/${service.slug}`}
        className="group/link mt-8 inline-flex items-center gap-4 text-[14px] font-semibold text-ink"
      >
        See more
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber text-ink-900 transition-transform duration-500 ease-expo group-hover/link:translate-x-1">
          <ArrowRight size={16} aria-hidden />
        </span>
      </Link>
    </div>
  );
}

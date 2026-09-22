"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FilterOption = { id: string; label: string; count: number };

/**
 * The More Work filter: a single row of mono labels with a hairline under the
 * active one. Toggle buttons (`aria-pressed`) rather than tabs — they narrow
 * one list, they don't switch between panels. Scrolls sideways on a phone
 * instead of wrapping into a block.
 */
export default function ProjectFilter({
  options,
  active,
  onChange,
  className,
}: {
  options: FilterOption[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      role="group"
      aria-label="Filter projects by category"
      className={cn(
        "-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <ul className="flex min-w-max items-center gap-6 lg:gap-8">
        {options.map((option) => {
          const on = option.id === active;
          return (
            <li key={option.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onChange(option.id)}
                className={cn(
                  "relative flex items-baseline gap-1.5 py-3 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-colors duration-300",
                  on ? "text-ink" : "text-ink-400 hover:text-ink",
                )}
              >
                {option.label}
                <span className="text-[9px] tabular-nums tracking-normal text-ink-400">
                  {option.count}
                </span>
                {on && (
                  <motion.span
                    layoutId="work-filter-rule"
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px bg-azure"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: 0.45, ease: [0.19, 1, 0.22, 1] }
                    }
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

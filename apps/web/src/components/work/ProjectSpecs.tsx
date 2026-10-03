import {
  Building2,
  Code2,
  Gauge,
  Globe2,
  Layers,
  Users,
  type LucideIcon,
} from "lucide-react";
import TechIcon from "@/components/ui/TechIcon";
import type { DetailMeta, DetailStat } from "@/lib/case-study-details";
import { metaParts } from "@/lib/work";

/**
 * A case study's capabilities and technology, split where they read best: the
 * headline figures, the practices and the stack sit in the dark hero under
 * its buttons; the brief's remaining rows (industry, scale, client…) sit in
 * the overview band as a facts grid.
 */

const isTech = (label: string) => /technolog/i.test(label);
const isService = (label: string) => /^service$/i.test(label);

/** A row's glyph, read from its label. */
const ROW_ICONS: [RegExp, LucideIcon][] = [
  [/technolog|stack/i, Code2],
  [/industry|sector/i, Building2],
  [/scale|volume|throughput/i, Gauge],
  [/client|team|engineer/i, Users],
  [/region|market|location|countr/i, Globe2],
];
const rowIcon = (label: string) =>
  ROW_ICONS.find(([re]) => re.test(label))?.[1] ?? Layers;

/** The rows the facts grid shows — everything but the practices and the
    stack, which the hero carries. */
export const factRows = (meta: DetailMeta[]) =>
  meta.filter((m) => !isService(m.label) && !isTech(m.label));

/** Under the hero's buttons: the figures, then what it was delivered as and
    built with. */
export function HeroSpecs({
  stats,
  meta,
}: {
  stats: DetailStat[];
  meta: DetailMeta[];
}) {
  const services = metaParts(meta.find((m) => isService(m.label))?.value ?? "");
  const tech = metaParts(meta.find((m) => isTech(m.label))?.value ?? "");

  if (stats.length === 0 && services.length === 0 && tech.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-paper/15 pt-8">
      {stats.length > 0 && (
        <dl className="grid grid-cols-3 gap-x-6">
          {stats.slice(0, 3).map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <dt className="order-2 mt-2.5 font-mono text-[10px] uppercase leading-[1.5] tracking-[0.16em] text-paper/55 sm:text-[10.5px]">
                {stat.label}
              </dt>
              <dd className="order-1 text-[clamp(22px,2.6vw,36px)] font-semibold leading-none tracking-[-0.03em] text-paper">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {services.length > 0 && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-5">
          <span className="flex-none font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">
            Delivered as
          </span>
          <ul className="flex flex-wrap gap-2">
            {services.map((s) => (
              <li
                key={s}
                className="border border-paper/15 bg-paper/[0.05] px-2.5 py-1 text-[12px] leading-[1.4] text-paper/80 backdrop-blur-sm"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tech.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <span className="flex-none font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">
            Built with
          </span>
          <ul className="flex flex-wrap gap-2">
            {tech.map((name) => (
              <li
                key={name}
                title={name}
                className="flex items-center gap-2 border border-paper/15 bg-paper/[0.05] py-1 pl-1.5 pr-2.5 backdrop-blur-sm"
              >
                <TechIcon
                  name={name}
                  size={16}
                  onDark
                  className="flex-none"
                  monoClassName="flex h-4 min-w-[18px] flex-none items-center justify-center rounded-sm bg-paper/10 px-0.5 font-mono text-[8px] font-semibold uppercase leading-none text-paper/70"
                />
                <span className="text-[12px] leading-[1.4] text-paper/80">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** The overview band's facts, drawn like the industry page's offerings: an
    open list, a glyph and the row's label over its values, each ruled off
    from the next — no boxes. */
export function FactList({ rows }: { rows: DetailMeta[] }) {
  if (rows.length === 0) return null;

  return (
    <dl className="grid sm:grid-cols-2 sm:gap-x-10">
      {rows.map((row) => {
        const Icon = rowIcon(row.label);
        const parts = row.value
          .split("·")
          .map((p) => p.trim())
          .filter(Boolean);
        return (
          <div key={row.label} className="flex gap-4 border-b border-line py-5">
            <Icon
              size={22}
              strokeWidth={1.5}
              aria-hidden
              className="mt-0.5 flex-none text-azure"
            />
            <div className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {row.label}
              </dt>
              <dd className="mt-2">
                <ul className="grid gap-1">
                  {parts.map((part) => (
                    <li
                      key={part}
                      className="text-[15.5px] font-medium leading-snug tracking-[-0.01em] text-ink first-letter:uppercase"
                    >
                      {part}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}

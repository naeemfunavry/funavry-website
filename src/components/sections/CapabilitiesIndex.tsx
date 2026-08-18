"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronRight, Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import ServiceDrawer, {
  PHASE,
  SERVICE_ICONS,
} from "@/components/ui/ServiceDrawer";
import { SERVICES, type Service } from "@/lib/services";
import { cn } from "@/lib/utils";

/* ── Capabilities, as an index ────────────────────────────────────────────────
 *
 * The sixteen practices, listed. No object, no tiers, no pillar — the two
 * houses as headings and one row per practice, which is the shortest path
 * between a visitor and the thing they came to read.
 *
 * There are three depths, and each is reached by doing more:
 *
 *   read     the row — number, title, sub-service count
 *   hover    an accordion under it — the summary and all four sub-service names
 *   open     the drawer — every sub-service with its description
 *
 * Build → Automate → Operate has not been dropped, it has been demoted. It is a
 * property of a practice, not a way of navigating them, so it appears twice and
 * quietly: as a coloured dot on each row, and as a three-column legend below the
 * list that decodes the dots. That is the whole of it. It used to be the frame
 * the section was built around, and it forced sixteen practices into a 7/2/7
 * split where the middle bucket held two entries.
 *
 * The accordion is hover-driven, so it is gated behind `@media (hover: hover)`:
 * on a touch screen there is no hover to leave, and a sticky one would strand a
 * row open. Touch gets the row and the drawer, which is the whole content
 * anyway. Keyboard gets it through `group-focus-within`. */

const HOUSES = [
  {
    key: "tech" as const,
    label: "Technology & Engineering",
    blurb: "The systems we design, build and run.",
  },
  {
    key: "gbs" as const,
    label: "Global Business Services",
    blurb: "The operating models and teams behind them.",
  },
];

/* The icon tile per phase, as classes rather than the inline `PHASE.tint`: the
   tile has to change colour on `group-hover`, and an inline style cannot carry
   a hover state. Amber takes dark type when it fills — white on #F59F13 is far
   under contrast — while azure and steel are dark enough to take white. */
const PHASE_TILE: Record<
  Service["phase"],
  { idle: string; hover: string }
> = {
  Build: {
    idle: "bg-azure/[0.10] text-azure-ink",
    hover:
      "group-hover/row:bg-azure group-hover/row:text-white group-focus-within/row:bg-azure group-focus-within/row:text-white",
  },
  Automate: {
    idle: "bg-amber/[0.12] text-amber-ink",
    hover:
      "group-hover/row:bg-amber group-hover/row:text-ink-900 group-focus-within/row:bg-amber group-focus-within/row:text-ink-900",
  },
  Operate: {
    idle: "bg-steel/[0.10] text-steel-ink",
    hover:
      "group-hover/row:bg-steel group-hover/row:text-white group-focus-within/row:bg-steel group-focus-within/row:text-white",
  },
};

/** The delivery chain, as a footnote to the list rather than a frame around it. */
const PHASES = [
  { key: "Build" as const, line: "Design and engineer the platform." },
  { key: "Automate" as const, line: "Put AI to work on top of it." },
  { key: "Operate" as const, line: "Run it at scale." },
];

/* ------------------------------------------------------------------ */

function Row({ service, onOpen }: { service: Service; onOpen: () => void }) {
  const phase = PHASE[service.phase];
  const tile = PHASE_TILE[service.phase];
  const Icon = SERVICE_ICONS[service.icon];

  return (
    <li className="group/row relative border-b border-line">
      {/* Hover wash and edge rule, both in the practice's phase hue. They bleed
          12px past the row on each side so the highlight has air around the
          text instead of stopping flush against it; the section's container
          padding is 56px at `lg`, so there is room and nothing clips. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-3 -right-3 opacity-0 transition-opacity duration-500 ease-expo group-hover/row:opacity-100 group-focus-within/row:opacity-100 motion-reduce:transition-none"
        style={{
          background: `linear-gradient(90deg, rgba(${phase.tint},0.10), rgba(${phase.tint},0.03) 45%, transparent 78%)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-3 w-[2px] origin-top scale-y-0 transition-transform duration-500 ease-expo group-hover/row:scale-y-100 group-focus-within/row:scale-y-100 motion-reduce:transition-none"
        style={{ background: `rgb(${phase.tint})` }}
      />

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${service.title}`}
        className="relative flex w-full items-center gap-3.5 py-4 text-left sm:gap-4 sm:py-5"
      >
        {/* The practice's own icon, where the running number used to be. It
            carries the phase hue as a tint and fills solid on hover, so the
            colour that the chain legend below decodes is on every row without
            a separate dot to explain it. */}
        <span
          className={cn(
            "flex h-9 w-9 flex-none items-center justify-center rounded-lg transition-colors duration-400 ease-expo sm:h-10 sm:w-10",
            tile.idle,
            tile.hover,
          )}
        >
          <Icon size={17} strokeWidth={1.7} />
        </span>

        <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug tracking-[-0.015em] text-ink sm:text-[17px]">
          {service.title}
        </span>

        {/* Out between `lg` and `2xl`. That is the band where the list is two
            columns but the page is not yet wide enough for them — a column is
            ~430px there, and this label eats ~90px of it, which is the
            difference between the longest title wrapping to two lines and
            three. It returns once the columns have the room. */}
        <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-400 sm:inline lg:hidden 2xl:inline">
          {service.subs.length} sub-services
        </span>

        <span
          aria-hidden
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-line text-ink-400 transition-all duration-500 ease-expo group-hover/row:rotate-90 group-hover/row:border-ink group-hover/row:bg-ink group-hover/row:text-paper motion-reduce:transition-none"
        >
          <Plus size={13} strokeWidth={2} />
        </span>
      </button>

      {/* The accordion opens on a 0fr → 1fr grid row, so the height animates
          without anyone measuring it. */}
      <div
        className={cn(
          "grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-expo motion-reduce:transition-none",
          "[@media(hover:hover)]:group-hover/row:grid-rows-[1fr]",
          "group-focus-within/row:grid-rows-[1fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="relative pb-6 sm:pl-[54px]">
            {/* The row lost its number and its phase dot to the icon tile, so
                the phase is named here instead — otherwise the tile's colour is
                a code with nothing on the row to break it. */}
            <span
              className={cn(
                "font-mono text-[9.5px] uppercase tracking-[0.18em]",
                phase.text,
              )}
            >
              {service.phase}
            </span>

            <p className="mt-2 max-w-[70ch] text-[13.5px] leading-[1.7] text-ink-500">
              {service.summary}
            </p>

            {/* Same band, same reason: two-up sub-titles need ~300px a cell,
                and a half-width column at `lg` gives them 200. Back to one
                column there, two again once the list columns widen. */}
            <ul className="mt-4 grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
              {service.subs.map((sub) => (
                <li key={sub.title} className="flex items-baseline gap-2.5">
                  <span
                    aria-hidden
                    className="mt-[6px] h-1 w-1 flex-none self-start rounded-full"
                    style={{ background: `rgb(${phase.tint})` }}
                  />
                  <span className="text-[12.5px] leading-[1.5] text-ink-500">
                    {sub.title}
                  </span>
                </li>
              ))}
            </ul>

            {/* A sibling of the row button, never nested inside it — a button
                within a button is invalid and the inner one stops responding. */}
            <button
              type="button"
              onClick={onOpen}
              className="group/cta mt-5 inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:text-azure-ink"
            >
              Open sub-services
              <ArrowUpRight
                size={12}
                className="transition-transform duration-400 ease-expo group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */

export default function CapabilitiesIndex() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = SERVICES.find((s) => s.n === openId) ?? null;
  const close = useCallback(() => setOpenId(null), []);

  return (
    <section
      id="capabilities"
      className="relative overflow-hidden border-t border-line bg-paper"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-[0.45]" />

      <Container wide className="relative z-10 py-16 sm:py-24 lg:py-32">
        {/* Header. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-end lg:gap-20">
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
              <KineticWords text="one delivery chain." delay={0.12} />
            </h2>
          </div>

          <Wipe delay={0.2}>
            <p className="text-[16px] leading-[1.75] text-ink-500">
              Ten technology and engineering practices, six global business
              services. Hover any one for what sits inside it — open it for the
              detail.
            </p>
          </Wipe>
        </div>

        {/* The sixteen. */}
        {HOUSES.map((house, hi) => {
          const items = SERVICES.filter((s) => s.group === house.key);
          return (
            <div
              key={house.key}
              className={hi === 0 ? "mt-14 lg:mt-20" : "mt-14 lg:mt-16"}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line-strong pb-3">
                <div className="flex items-baseline gap-4">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink">
                    {house.label}
                  </h3>
                  <span className="font-mono text-[10px] tabular-nums tracking-[0.14em] text-ink-400">
                    {String(items.length).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-[13px] text-ink-400">{house.blurb}</p>
              </div>

              {/* Two columns from `lg`, as two independent lists rather than a
                  two-column grid over one list. A grid would tie the pair in
                  each row to a shared height, so opening one accordion would
                  stretch its neighbour's cell and leave a hole beside it. Split
                  lists only push what is below them in their own column.

                  Splitting in halves rather than alternating also keeps the
                  numbering reading top-to-bottom (01–05, then 06–10), which is
                  the order the single stacked column falls back to below `lg` —
                  so the sequence never reshuffles at the breakpoint. */}
              <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-20">
                {[
                  items.slice(0, Math.ceil(items.length / 2)),
                  items.slice(Math.ceil(items.length / 2)),
                ].map((column, ci) => (
                  <ul key={ci}>
                    {column.map((service) => (
                      <Row
                        key={service.n}
                        service={service}
                        onOpen={() => setOpenId(service.n)}
                      />
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          );
        })}

        {/* The delivery chain, under the list it describes.

            The panel carries a tri-hue wash left to right — azure, amber, steel,
            in chain order — which shows through the transparent header strip and
            sits behind the three cells. Each cell then lays its own phase tint
            over white and wears that phase's colour as a seam along its top, so
            the block reads as one gradient resolving into three named steps
            rather than three unrelated tinted boxes.

            Hairlines between cells come from `gap-px` over a line-coloured bed —
            no borders to align. The chevrons ride on those hairlines, pulled
            half outside their cell, and are hidden once the cells stack, where
            reading order already carries the direction. */}
        <div className="mt-14 lg:mt-20">
          <div className="relative overflow-hidden border border-line">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(100deg, rgba(68,158,216,0.16) 0%, rgba(245,159,19,0.16) 50%, rgba(55,96,121,0.16) 100%)",
              }}
            />

            <div className="relative">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 border-b border-line px-5 py-4 lg:px-7">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink">
                  How the work moves
                </span>
                <p className="text-[12.5px] text-ink-500">
                  Every practice sits somewhere on this chain.
                </p>
              </div>

              <div className="grid gap-px bg-line sm:grid-cols-3">
                {PHASES.map((p, i) => {
                  const phase = PHASE[p.key];
                  const count = SERVICES.filter(
                    (s) => s.phase === p.key,
                  ).length;
                  return (
                    <div
                      key={p.key}
                      className="relative p-5 lg:p-7"
                      style={{
                        background: `linear-gradient(180deg, rgba(${phase.tint},0.14), rgba(${phase.tint},0.03) 70%, rgba(${phase.tint},0.02)), #FFFFFF`,
                      }}
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-[3px]"
                        style={{ background: `rgb(${phase.tint})` }}
                      />

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9.5px] tabular-nums tracking-[0.16em] text-ink-400">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          aria-hidden
                          className="h-px w-4 flex-none"
                          style={{ background: `rgb(${phase.tint})` }}
                        />
                        <span
                          className={cn(
                            "font-mono text-[11px] uppercase tracking-[0.2em]",
                            phase.text,
                          )}
                        >
                          {p.key}
                        </span>
                      </div>

                      <p className="mt-4 max-w-[30ch] text-[14.5px] leading-snug tracking-[-0.01em] text-ink">
                        {p.line}
                      </p>

                      <p className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-400">
                        {String(count).padStart(2, "0")} practices
                      </p>

                      {i < PHASES.length - 1 && (
                        <span
                          aria-hidden
                          className="absolute right-0 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-line bg-paper-white text-ink-400 sm:flex"
                        >
                          <ChevronRight size={12} strokeWidth={2} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {open && <ServiceDrawer service={open} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Service } from "@/lib/services";
import { PHASE, SERVICE_ICONS, SERVICE_IMAGES } from "@/lib/service-style";
import { cn } from "@/lib/utils";

const EXPO = [0.19, 1, 0.22, 1] as const;

/**
 * Technology & Engineering, as a strip of photographs. The practice in focus
 * opens wide, its photograph fading into ink under its copy — the industry
 * hero's treatment — while its neighbours stay narrow, showing only their
 * photograph and name. Picking a narrow one (or the arrows, the keys, or a
 * swipe) brings it into focus.
 *
 * Widths are fixed per breakpoint rather than measured, so the offset that
 * centres the open card is plain arithmetic on the track.
 */
export default function TechCarousel({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const swipeFrom = useRef<number | null>(null);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const count = services.length;
  const go = useCallback(
    (i: number) => setActive(Math.max(0, Math.min(count - 1, i))),
    [count],
  );

  /* Card geometry for the current viewport. */
  const desktop = width >= 1024;
  const tablet = width >= 640 && !desktop;
  const openW = desktop
    ? Math.min(900, width * 0.66)
    : tablet
      ? width * 0.78
      : width * 0.88;
  const closedW = desktop ? 230 : tablet ? 190 : width * 0.88;
  const gap = desktop ? 20 : 14;

  const trackW = openW + (count - 1) * closedW + (count - 1) * gap;
  const openLeft = active * (closedW + gap);
  const centred = width / 2 - openLeft - openW / 2;
  const offset = width ? Math.min(0, Math.max(width - trackW, centred)) : 0;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Technology & Engineering services"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(active + 1);
        if (e.key === "ArrowLeft") go(active - 1);
      }}
    >
      <div
        ref={viewport}
        className="relative touch-pan-y overflow-hidden"
        onPointerDown={(e) => (swipeFrom.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipeFrom.current === null) return;
          const dx = e.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
        }}
      >
        <ul
          className="flex py-4 transition-transform duration-700 ease-expo"
          style={{ gap, transform: `translate3d(${offset}px,0,0)` }}
        >
          {services.map((service, i) => (
            <Panel
              key={service.slug}
              service={service}
              open={i === active}
              desktop={desktop}
              width={i === active ? openW : closedW}
              priority={i < 4}
              onPick={() => go(i)}
            />
          ))}
        </ul>
      </div>

      {/* Controls: a segment per practice, then the arrows. */}
      <div className="mt-6 flex items-center gap-6 lg:mt-8">
        <div
          className="flex flex-1 gap-1.5"
          role="tablist"
          aria-label="Choose a service"
        >
          {services.map((service, i) => (
            <button
              key={service.slug}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={service.title}
              onClick={() => go(i)}
              className="group flex-1 py-3"
            >
              <span className="relative block h-[2px] overflow-hidden bg-line-strong">
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 bg-azure transition-[width] duration-700 ease-expo",
                    i === active ? "w-full" : "w-0 group-hover:w-1/3",
                  )}
                />
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-none gap-2">
          <ArrowButton
            label="Previous service"
            disabled={active === 0}
            onClick={() => go(active - 1)}
          >
            <ArrowLeft size={16} aria-hidden />
          </ArrowButton>
          <ArrowButton
            label="Next service"
            disabled={active === count - 1}
            onClick={() => go(active + 1)}
          >
            <ArrowRight size={16} aria-hidden />
          </ArrowButton>
        </div>
      </div>
    </div>
  );
}

function Panel({
  service,
  open,
  desktop,
  width,
  priority,
  onPick,
}: {
  service: Service;
  open: boolean;
  desktop: boolean;
  width: number;
  priority: boolean;
  onPick: () => void;
}) {
  const phase = PHASE[service.phase];
  const Icon = SERVICE_ICONS[service.icon];
  const photo = SERVICE_IMAGES[service.slug];

  return (
    <li
      aria-roledescription="slide"
      aria-label={service.title}
      className={cn(
        "group relative h-[520px] flex-none overflow-hidden bg-ink-900 transition-[width,box-shadow] duration-700 ease-expo sm:h-[480px] lg:h-[460px]",
        open && "shadow-[0_40px_80px_-40px_rgba(33,38,42,0.55)]",
      )}
      style={{ width }}
    >
      {/* The photograph, or — with none — the icon lit on dark paper. */}
      {photo ? (
        <Image
          src={photo}
          alt=""
          fill
          quality={90}
          priority={priority}
          sizes="(max-width: 1024px) 90vw, 900px"
          className={cn(
            "object-cover transition-transform duration-[1200ms] ease-expo",
            open ? "scale-100" : "scale-[1.02] group-hover:scale-[1.07]",
          )}
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center grid-paper-dark"
          style={{
            background: `radial-gradient(60% 60% at 30% 45%, rgba(${phase.tint},0.28), transparent 70%)`,
          }}
        >
          {Icon && (
            <Icon
              size={140}
              strokeWidth={0.8}
              style={{ color: `rgba(${phase.tint},0.7)` }}
            />
          )}
        </span>
      )}

      {/* Ink over the photograph: a foot for a closed card's name; for the open
          one, solid under the copy — on the right from lg, at the foot below. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          open ? "opacity-0" : "opacity-100",
        )}
        style={{
          background:
            "linear-gradient(0deg, rgba(33,38,42,0.92) 0%, rgba(33,38,42,0.35) 45%, rgba(33,38,42,0.05) 100%)",
        }}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          open ? "opacity-100" : "opacity-0",
        )}
        style={{
          background: desktop
            ? "linear-gradient(90deg, rgba(33,38,42,0.1) 0%, rgba(33,38,42,0.25) 30%, rgba(33,38,42,0.88) 52%, #21262A 70%)"
            : "linear-gradient(0deg, #21262A 0%, rgba(33,38,42,0.94) 55%, rgba(33,38,42,0.2) 85%)",
        }}
      />
      {/* The phase's glow, low in the corner of the open card. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          open ? "opacity-100" : "opacity-0",
        )}
        style={{
          background: `radial-gradient(45% 60% at 100% 100%, rgba(${phase.tint},0.28), transparent 70%)`,
        }}
      />

      <Ticks tint={phase.tint} show={open} />

      {/* A closed card is one button: its name, over its photograph. */}
      {!open && (
        <button
          type="button"
          onClick={onPick}
          className="absolute inset-0 flex flex-col justify-end p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-azure"
        >
          <span className="flex items-center gap-2">
            <span aria-hidden className={cn("h-1 w-1 rounded-full", phase.dot)} />
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-paper/70">
              {service.phase}
            </span>
          </span>
          <span className="mt-2 block text-[16px] font-medium leading-snug tracking-[-0.015em] text-paper">
            {service.title}
          </span>
          <span className="mt-4 inline-flex h-8 w-8 items-center justify-center border border-paper/25 text-paper transition-colors duration-300 group-hover:border-paper/60 group-hover:bg-paper/10">
            <ArrowRight size={14} aria-hidden />
          </span>
        </button>
      )}

      {/* The open card's copy. */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: EXPO }}
          className={cn(
            "absolute flex flex-col",
            desktop
              ? "inset-y-0 right-0 w-[46%] justify-center py-10 pl-2 pr-10"
              : "inset-x-0 bottom-0 p-6",
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="flex h-10 w-10 flex-none items-center justify-center border border-paper/20 bg-paper/[0.06] backdrop-blur-sm">
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  aria-hidden
                  style={{ color: `rgb(${phase.tint})` }}
                />
              </span>
            )}
            <span className="flex items-center gap-2">
              <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", phase.dot)} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/75">
                {service.phase}
              </span>
            </span>
          </div>

          <h3 className="mt-5 text-[24px] font-medium leading-[1.15] tracking-[-0.025em] text-paper lg:text-[28px]">
            {service.title}
          </h3>
          <p className="mt-3 text-[14.5px] leading-[1.7] text-paper/70 lg:text-[15px]">
            {service.summary}
          </p>

          <ul className="mt-5 flex flex-wrap gap-1.5">
            {service.subs.map((sub) => (
              <li
                key={sub.title}
                className="border border-paper/15 bg-paper/[0.05] px-2.5 py-1 text-[11.5px] leading-[1.4] text-paper/80"
              >
                {sub.title}
              </li>
            ))}
          </ul>

          <Link
            href={`/services/${service.slug}`}
            className="group/link mt-7 inline-flex min-h-[42px] items-center gap-2.5 self-start bg-amber px-5 text-[13.5px] font-semibold text-ink-900 transition-colors duration-300 hover:bg-amber-600"
          >
            Explore service
            <ArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-500 ease-expo group-hover/link:translate-x-1"
            />
          </Link>
        </motion.div>
      )}
    </li>
  );
}

function Ticks({ tint, show }: { tint: string; show: boolean }) {
  const base =
    "pointer-events-none absolute z-20 h-[14px] w-[14px] transition-opacity duration-500";
  const color = { borderColor: `rgb(${tint})`, opacity: show ? 1 : 0 };
  return (
    <span aria-hidden>
      <span className={cn(base, "left-0 top-0 border-l-2 border-t-2")} style={color} />
      <span className={cn(base, "right-0 top-0 border-r-2 border-t-2")} style={color} />
      <span className={cn(base, "bottom-0 left-0 border-b-2 border-l-2")} style={color} />
      <span className={cn(base, "bottom-0 right-0 border-b-2 border-r-2")} style={color} />
    </span>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center border border-line-strong bg-paper-white text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

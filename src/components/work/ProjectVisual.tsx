import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProjectMedia, ProjectPhase, Shot } from "@/lib/work-model";
import { PHASE_STYLE } from "./phase";

/**
 * A project's product visual: its real captures on devices, in a quiet studio.
 *
 * Every project sits on the same set — a light grey wall meeting a paler desk
 * — so a page of them reads as one portfolio rather than a pile of
 * screenshots. The captures themselves are never altered; the devices are the
 * presentation layer. What is shown is read from the project's media:
 *
 *   desktop capture + phone capture → laptop with the phone in front of it
 *   desktop capture                 → laptop, centred
 *   phone captures only             → a row of phones on the desk
 *   interface crop only             → the crop as a floating panel
 *   no captures                     → a typographic cover, never a fake screen
 *
 * A phone only ever carries a real mobile capture. A desktop screen squeezed
 * into a phone frame would claim a mobile product that may not exist.
 *
 * Everything is sized in container units against the stage, so a composition
 * keeps its proportions from a 1400px hero down to a phone-width card.
 *
 * Hover (scale 1.02, faint overlay) keys off an ancestor `group`, so the whole
 * card drives it. `interactive={false}` keeps a still stage, as on the case
 * study hero, where the visual is not a link.
 */

export type VisualVariant = "hero" | "featured" | "card";

const STAGE: Record<VisualVariant, string> = {
  hero: "aspect-[4/3] md:aspect-[16/8]",
  featured: "aspect-[4/3] sm:aspect-[16/9]",
  card: "aspect-[16/9] sm:aspect-[16/8.5]",
};

const SIZES: Record<
  VisualVariant,
  { screen: string; phone: string; panel: string }
> = {
  hero: {
    screen: "(max-width: 1024px) 64vw, 900px",
    phone: "(max-width: 1024px) 16vw, 220px",
    panel: "(max-width: 1024px) 70vw, 900px",
  },
  featured: {
    screen: "(max-width: 1024px) 60vw, 560px",
    phone: "(max-width: 1024px) 14vw, 140px",
    panel: "(max-width: 1024px) 70vw, 600px",
  },
  card: {
    screen: "(max-width: 768px) 58vw, 400px",
    phone: "(max-width: 768px) 13vw, 100px",
    panel: "(max-width: 768px) 70vw, 440px",
  },
};

/* The set: wall lit from the upper left, the desk's front edge at ~81%. */
const STUDIO = [
  "radial-gradient(55% 60% at 24% 20%, rgba(255,255,255,0.8), rgba(255,255,255,0) 70%)",
  "linear-gradient(180deg, #E3E5E1 0%, #EAEBE8 55%, #EFF0ED 81%, #F8F8F6 81.5%, #F3F4F1 100%)",
].join(",");

const PHONE_SHADOW =
  "shadow-[0_26px_40px_-18px_rgba(33,38,42,0.45),0_6px_12px_-6px_rgba(33,38,42,0.25)]";
const PANEL_SHADOW =
  "shadow-[0_26px_50px_-26px_rgba(33,38,42,0.38),0_4px_10px_-6px_rgba(33,38,42,0.12)]";

/** A laptop's full height (lid + base) as a fraction of its width. */
const LAPTOP_HEIGHT = 0.68;
/** Phone screen shape — a modern handset, whatever the capture's exact crop. */
const PHONE_RATIO = 0.462;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

const DEVICE_BLACK = "bg-[#1C1E21]";

/** A laptop, front on: a dark-bezelled lid over a thin aluminium base, with a
    soft contact shadow on the desk. Width comes from the caller. */
function Laptop({
  shot,
  sizes,
  priority,
  className,
  style,
}: {
  shot: Shot;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("absolute", className)} style={style}>
      <span
        aria-hidden
        className="absolute -bottom-[4%] left-[-4%] right-[-4%] h-[12%]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(33,38,42,0.30), rgba(33,38,42,0) 72%)",
        }}
      />

      <div
        className={cn(
          "relative p-[2.1%] pb-[2.6%] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]",
          DEVICE_BLACK,
        )}
        style={{ borderRadius: "2.2% 2.2% 0.8% 0.8% / 3.4% 3.4% 1.2% 1.2%" }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-[1.25%] h-[0.9%] w-[0.6%] -translate-x-1/2 rounded-full bg-[#3A3D41]"
        />
        <div className="relative w-full overflow-hidden bg-[#0E0F11]" style={{ aspectRatio: 1.6 }}>
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            quality={90}
            priority={priority}
            sizes={sizes}
            className="object-cover object-left-top"
          />
        </div>
      </div>

      <div
        aria-hidden
        className="relative -mx-[6%] h-0 pb-[3.4%]"
        style={{
          background:
            "linear-gradient(180deg, #E6E8E9 0%, #CDD0D2 45%, #AEB2B5 100%)",
          borderRadius: "0 0 3% 3% / 0 0 100% 100%",
        }}
      >
        <span className="absolute left-1/2 top-0 h-[40%] w-[13%] -translate-x-1/2 rounded-b-[4px] bg-[#A7ABAE]" />
      </div>
    </div>
  );
}

function Phone({
  shot,
  sizes,
  className,
  style,
}: {
  shot: Shot;
  sizes: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "rounded-[15%/7.2%] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        DEVICE_BLACK,
        PHONE_SHADOW,
        className,
      )}
      style={style}
    >
      {/* The bezel padding lives on this inner box, not the phone itself: a
          percentage padding resolves against the containing block's width,
          which for an absolutely positioned phone is the whole stage — it drew
          a 40px bezel round a thumbnail-sized screen. Here it resolves against
          the phone. */}
      <div className="p-[3.2%]">
        <div
          className="relative w-full overflow-hidden rounded-[12%/5.6%] bg-[#0E0F11]"
          style={{ aspectRatio: PHONE_RATIO }}
        >
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            quality={90}
            sizes={sizes}
            className="object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}

function Composition({
  media,
  variant,
  priority,
}: {
  media: ProjectMedia;
  variant: VisualVariant;
  priority: boolean;
}) {
  const sizes = SIZES[variant];
  const { primary, phones } = media;

  if (primary?.kind === "desktop") {
    const phone = phones[0];

    if (phone) {
      /* The pair is centred as a group: the laptop sits a little left of
         centre and the phone overlaps its right edge, standing just in front
         of it on the desk. */
      return (
        <div
          className="absolute inset-0"
          style={{ "--lw": `min(64cqw, calc(76cqh / ${LAPTOP_HEIGHT}))` } as React.CSSProperties}
        >
          <Laptop
            shot={primary}
            sizes={sizes.screen}
            priority={priority}
            className="bottom-[11cqh] left-1/2"
            style={{ width: "var(--lw)", transform: "translateX(-55%)" }}
          />
          <Phone
            shot={phone}
            sizes={sizes.phone}
            className="absolute bottom-[8cqh]"
            style={{
              width: "calc(var(--lw) * 0.22)",
              left: "calc(50% + var(--lw) * 0.29)",
            }}
          />
        </div>
      );
    }

    return (
      <Laptop
        shot={primary}
        sizes={sizes.screen}
        priority={priority}
        className="bottom-[11cqh] left-1/2"
        style={{
          width: `min(70cqw, calc(78cqh / ${LAPTOP_HEIGHT}))`,
          transform: "translateX(-50%)",
        }}
      />
    );
  }

  if (!primary) {
    const n = phones.length;
    return (
      <div className="absolute inset-x-0 bottom-[9cqh] top-[8cqh] flex items-end justify-center gap-[5cqw]">
        {phones.map((phone, i) => {
          const tall = n === 1 || (n === 3 && i === 1);
          return (
            <Phone
              key={phone.src}
              shot={phone}
              sizes={sizes.phone}
              className="relative flex-none"
              style={{
                width: `min(${n === 1 ? 30 : 22}cqw, calc(${tall ? 80 : 72}cqh * 0.45))`,
              }}
            />
          );
        })}
      </div>
    );
  }

  const ratio = clamp(primary.ratio, 0.9, 3);
  return (
    <div className="absolute inset-x-0 bottom-[12cqh] top-[8cqh] flex items-center justify-center">
      <div
        className={cn(
          "overflow-hidden rounded-[4px] bg-paper-white ring-1 ring-ink-900/[0.07]",
          PANEL_SHADOW,
        )}
        style={{
          width: `min(72cqw, calc(76cqh * ${ratio.toFixed(3)}), ${primary.width}px)`,
        }}
      >
        <div className="relative w-full" style={{ aspectRatio: ratio }}>
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            quality={90}
            priority={priority}
            sizes={sizes.panel}
            className="object-cover object-left-top"
          />
        </div>
      </div>
    </div>
  );
}

/** For a project whose captures are still to come: its name set as a cover.
    Deliberately typographic — a drawn "interface" would be a screen that was
    never built. Hidden from assistive tech; the title is on the card. */
function Cover({
  title,
  sector,
  phase,
}: {
  title: string;
  sector: string;
  phase: ProjectPhase;
}) {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-[19cqh] top-0 flex flex-col items-center justify-center px-[10cqw] text-center"
    >
      <span
        className="flex items-center gap-2 font-mono uppercase tracking-[0.2em] text-ink-400"
        style={{ fontSize: "max(9px, 1.25cqw)" }}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", PHASE_STYLE[phase].dot)} />
        {sector}
      </span>
      <span
        className="mt-[4cqh] max-w-[24ch] font-medium leading-[1.04] tracking-[-0.03em] text-ink/75"
        style={{ fontSize: "clamp(18px, 4.6cqw, 56px)" }}
      >
        {title}
      </span>
      <span
        className="mt-[5cqh] font-mono uppercase tracking-[0.18em] text-ink-400"
        style={{ fontSize: "max(8.5px, 1.05cqw)" }}
      >
        Product visuals in preparation
      </span>
    </div>
  );
}

export default function ProjectVisual({
  media,
  title,
  sector,
  phase,
  variant,
  priority = false,
  interactive = variant !== "hero",
  className,
}: {
  media: ProjectMedia;
  title: string;
  sector: string;
  phase: ProjectPhase;
  variant: VisualVariant;
  priority?: boolean;
  interactive?: boolean;
  className?: string;
}) {
  const empty = !media.primary && media.phones.length === 0;

  return (
    <div
      className={cn("relative w-full overflow-hidden", STAGE[variant], className)}
      style={{ background: STUDIO }}
    >
      <div
        className={cn(
          "absolute inset-0 [container-type:size]",
          interactive &&
            "transition-transform duration-500 ease-smooth group-hover:scale-[1.02]",
        )}
      >
        {empty ? (
          <Cover title={title} sector={sector} phase={phase} />
        ) : (
          <Composition media={media} variant={variant} priority={priority} />
        )}
      </div>

      {interactive && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-ink-900/0 transition-colors duration-500 ease-smooth group-hover:bg-ink-900/[0.035]"
        />
      )}
    </div>
  );
}

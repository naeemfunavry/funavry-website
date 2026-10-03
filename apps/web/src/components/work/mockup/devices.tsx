import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Shot } from "@/lib/work-model";

/*
 * The portfolio's devices, built in CSS 3D rather than photographed.
 *
 * Every device holds a real capture, untouched: filled from its top-left, so
 * a full-page scroll shows its top and an ultrawide loses only its far right
 * edge — the navigation and the main content always stay on screen. The
 * devices are only the frame.
 *
 * They are genuinely three-dimensional: a laptop's deck lies back from the
 * hinge, a monitor's foot lies on the floor, windows and panels have side
 * faces, so a device holds together at whatever turn a scene gives it.
 * Everything is sized in container units against the scene's stage, so one
 * composition keeps its proportions from a hero down to a phone-width card.
 *
 * `--mk-h` (0 at rest, 1 under the pointer — see globals.css) is read by the
 * transforms and shadows; `hv()` writes the expressions.
 */

export const P3: React.CSSProperties = { transformStyle: "preserve-3d" };

/** `n` units, scaled by the scene's hover. */
export const hv = (n: number, unit: string) => `calc(var(--mk-h) * ${n}${unit})`;

/** A turn of `deg`, scaled by `--mk-turn` — 1 on a full card, less on a
    small one (globals.css), so a phone-width card is nearly front-on. */
export const turn = (deg: number) => `calc(var(--mk-turn, 1) * ${deg}deg)`;

const BLACK = "#0B0D10";
const ALU =
  "linear-gradient(180deg, #E4E8EA 0%, #C6CBCF 40%, #A9AFB4 80%, #8F959A 100%)";
const ALU_EDGE = "linear-gradient(180deg, #B9BFC3 0%, #7D848A 100%)";

/**
 * A screen is shaped to its capture, not the capture to the screen: a wide
 * dashboard gets a wide screen, a squarer app a taller one, and the capture
 * is shown whole — never cropped at the sides, never stretched. The one
 * exception is a full-page scroll (taller than 1.25:1): no screen is that
 * shape, so it shows the top of the page, the view a visitor lands on.
 */
export const screenRatio = (shot: Shot) => Math.min(2.4, Math.max(1.25, shot.ratio));

/** A whisper of sheen at a screen's top-left corner — enough to read as
    glass, never enough to veil the interface. */
export function Glass({ strength = 1 }: { strength?: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: `linear-gradient(118deg, rgba(255,255,255,${0.05 * strength}) 0%, rgba(255,255,255,${0.015 * strength}) 28%, rgba(255,255,255,0) 42%)`,
      }}
    />
  );
}

/** A capture filling its box from the top-left, never resampled by us. */
export function Capture({
  shot,
  sizes,
  priority,
  position = "center top",
  decorative = false,
}: {
  shot: Shot;
  sizes: string;
  priority?: boolean;
  position?: string;
  /** A second or third screen in a scene: the card names the project once. */
  decorative?: boolean;
}) {
  return (
    <Image
      src={shot.src}
      alt={decorative ? "" : shot.alt}
      fill
      quality={85}
      priority={priority}
      sizes={sizes}
      className="object-cover"
      style={{ objectPosition: position }}
    />
  );
}

type Side = "left" | "right";

/**
 * Side faces for a flat slab, so a window or panel has thickness when it
 * turns. `x` and `y` name the faces the turn shows: a slab turned with its
 * right edge towards the viewer shows its right face, one tipped back shows
 * its bottom.
 */
export function Edges({
  t,
  x,
  y = "bottom",
  color,
}: {
  t: string;
  x?: Side;
  y?: "top" | "bottom" | null;
  color: string;
}) {
  return (
    <>
      {x && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-[0.6%]",
            x === "right" ? "left-full origin-left" : "right-full origin-right",
          )}
          style={{
            width: t,
            background: color,
            transform: `rotateY(${x === "right" ? 90 : -90}deg)`,
          }}
        />
      )}
      {y && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-[0.6%]",
            y === "bottom" ? "top-full origin-top" : "bottom-full origin-bottom",
          )}
          style={{
            height: t,
            background: color,
            transform: `rotateX(${y === "bottom" ? -90 : 90}deg)`,
          }}
        />
      )}
    </>
  );
}

/** The screen itself: a capture at a fixed shape, with glass. */
function Screen({
  shot,
  ratio,
  sizes,
  priority,
  decorative,
  className,
}: {
  shot: Shot;
  ratio: number;
  sizes: string;
  priority?: boolean;
  decorative?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("relative w-full overflow-hidden bg-[#05070A]", className)}
      style={{ aspectRatio: ratio }}
    >
      <Capture shot={shot} sizes={sizes} priority={priority} decorative={decorative} />
      <Glass />
    </div>
  );
}

type DeviceProps = {
  shot: Shot;
  sizes: string;
  priority?: boolean;
  decorative?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Which side face the scene's turn brings into view. */
  side?: Side;
};

/**
 * A laptop: a black-bezelled lid standing on an aluminium deck. The deck is
 * hinged at the lid's foot and laid back, so its depth is spent going away
 * from the camera — keyboard and trackpad foreshorten because they genuinely
 * lie on the floor, and agree with the lid at any turn. Its shadow lives in
 * the deck's own plane, pushed below it, so it falls on the floor; on hover
 * it drops further and fades, which reads as the laptop rising.
 */
export function Laptop({ shot, sizes, priority, decorative, className, style, side }: DeviceProps) {
  const ratio = screenRatio(shot);
  return (
    <div className={cn("absolute", className)} style={{ ...P3, ...style }}>
      <div
        className="relative px-[2.2%] pb-[3%] pt-[2.2%] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        style={{ ...P3, background: BLACK, borderRadius: "2.6% 2.6% 1% 1% / 4% 4% 1.5% 1.5%" }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-[0.9%] h-[0.8%] w-[0.8%] -translate-x-1/2 rounded-full bg-[#2A2E33]"
        />
        <Screen shot={shot} ratio={ratio} sizes={sizes} priority={priority} decorative={decorative} className="rounded-[0.4%]" />
        {side && <Edges t="0.45cqw" x={side} y={null} color={ALU_EDGE} />}
      </div>

      <div
        aria-hidden
        className="absolute left-[-3%] top-full h-0 w-[106%] origin-top pt-[62%]"
        style={{ ...P3, transform: "rotateX(80deg)" }}
      >
        <span
          className="absolute inset-[-12%_-10%_-22%_-10%] rounded-[50%]"
          style={{
            background: "radial-gradient(50% 50% at 50% 45%, rgba(3,8,18,0.55), rgba(3,8,18,0) 70%)",
            transform: `translateZ(calc(-1.6cqw - ${hv(1.6, "cqw")}))`,
            opacity: `calc(1 - var(--mk-h) * 0.3)`,
          }}
        />
        <div
          className="absolute inset-0 overflow-hidden rounded-b-[5%] rounded-t-[1%]"
          style={{ background: ALU }}
        >
          <span className="absolute inset-x-0 top-0 h-[4%] bg-gradient-to-b from-[#59626A] to-transparent" />
          {/* Keyboard: dark caps, the aluminium showing between them. */}
          <span
            className="absolute left-[7%] right-[7%] top-[9%] h-[44%] rounded-[1.4%] bg-[#16191C]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(185,191,196,0.55) 1px, transparent 1px), linear-gradient(0deg, rgba(185,191,196,0.55) 1px, transparent 1px)",
              backgroundSize: "calc(100% / 15) calc(100% / 6)",
            }}
          />
          <span className="absolute left-1/2 top-[58%] h-[33%] w-[38%] -translate-x-1/2 rounded-[3%] bg-[#BCC2C6] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]" />
        </div>
        {/* The deck's front edge, standing up towards the viewer. */}
        <span
          className="absolute inset-x-[1%] top-full h-[0.9cqw] origin-top"
          style={{ background: ALU_EDGE, transform: "rotateX(-90deg)" }}
        />
      </div>
    </div>
  );
}

/**
 * A desktop display: a thin black bezel in an aluminium shell, on a neck and
 * a foot that lies flat on the floor.
 */
export function Monitor({ shot, sizes, priority, decorative, className, style, side }: DeviceProps) {
  const ratio = screenRatio(shot);
  return (
    <div className={cn("absolute", className)} style={{ ...P3, ...style }}>
      <div
        className="relative p-[1.3%] shadow-[0_0_0_1px_#9AA1A6,0_3cqw_6cqw_-2.5cqw_rgba(3,10,22,0.55)]"
        style={{ ...P3, background: BLACK, borderRadius: "1.6% / 2.6%" }}
      >
        <Screen shot={shot} ratio={ratio} sizes={sizes} priority={priority} decorative={decorative} className="rounded-[0.5%]" />
        {side && <Edges t="0.9cqw" x={side} y={null} color={ALU_EDGE} />}
      </div>
      <div
        aria-hidden
        className="relative left-1/2 h-0 w-[13%] -translate-x-1/2 pb-[16%]"
        style={{ ...P3, background: "linear-gradient(90deg, #8E959A, #D3D8DB 45%, #A3AAAF)", transform: "translateX(-50%) translateZ(-1.5cqw)" }}
      >
        <span
          className="absolute left-1/2 top-full h-0 w-[260%] origin-top -translate-x-1/2 rounded-[30%/50%] pb-[150%]"
          style={{ background: ALU, transform: "translateX(-50%) rotateX(82deg)" }}
        >
          <span
            className="absolute inset-[-30%_-25%] rounded-[50%]"
            style={{
              background: "radial-gradient(50% 50% at 50% 50%, rgba(3,8,18,0.45), rgba(3,8,18,0) 70%)",
              transform: "translateZ(-0.4cqw)",
            }}
          />
        </span>
      </div>
    </div>
  );
}

/** A tablet, landscape: an even black bezel, an aluminium rim. */
export function Tablet({ shot, sizes, decorative = true, className, style, side }: DeviceProps) {
  return (
    <div
      className={cn("absolute p-[3%] shadow-[0_0_0_1px_#8E959A,0_2.6cqw_5cqw_-2cqw_rgba(3,10,22,0.55)]", className)}
      style={{ ...P3, background: BLACK, borderRadius: "5.5% / 8%", ...style }}
    >
      <Screen shot={shot} ratio={1.43} sizes={sizes} decorative={decorative} className="rounded-[2.4%/3.4%]" />
      {side && <Edges t="0.6cqw" x={side} y={null} color={ALU_EDGE} />}
    </div>
  );
}

/** A handset: black glass, a pill camera, a fine aluminium rim. Only ever
    shown with a real phone capture. */
export function Phone({ shot, sizes, decorative = true, className, style, side }: DeviceProps) {
  return (
    <div
      className={cn(
        "absolute rounded-[16%/7.4%] shadow-[0_0_0_1px_#9AA1A6,0_2.4cqw_4cqw_-1.4cqw_rgba(3,10,22,0.6)]",
        className,
      )}
      style={{ ...P3, background: BLACK, ...style }}
    >
      <div className="p-[4%]">
        <div className="relative w-full overflow-hidden rounded-[13%/6%] bg-[#05070A]" style={{ aspectRatio: 0.462 }}>
          <Capture shot={shot} sizes={sizes} position="center top" decorative={decorative} />
          <span
            aria-hidden
            className="absolute left-1/2 top-[2.2%] h-[3.2%] w-[30%] -translate-x-1/2 rounded-full"
            style={{ background: BLACK }}
          />
          <Glass />
        </div>
      </div>
      {side && <Edges t="0.5cqw" x={side} y={null} color={ALU_EDGE} />}
    </div>
  );
}

/**
 * A browser window: a bar with three dots and an address pill, then the
 * capture at the given shape. With `side`/`bottom`, it gains thickness.
 */
export function Browser({
  shot,
  sizes,
  priority,
  decorative,
  ratio,
  dark = false,
  className,
  style,
  side,
  bottom = true,
}: DeviceProps & { ratio: number; dark?: boolean; bottom?: boolean }) {
  return (
    <div
      className={cn(
        "absolute rounded-[0.9cqw] ring-1",
        dark ? "bg-[#14181C] ring-white/10" : "bg-paper-white ring-ink-900/[0.08]",
        className,
      )}
      style={{ ...P3, ...style }}
    >
      <div className={cn("relative flex h-0 items-center pb-[3.4%]", dark ? "border-b border-white/[0.06]" : "border-b border-line")}>
        <span className="absolute left-[1.8%] top-1/2 flex -translate-y-1/2 gap-[0.55cqw]">
          {[0, 1, 2].map((i) => (
            <span key={i} aria-hidden className={cn("block h-[0.75cqw] w-[0.75cqw] rounded-full", dark ? "bg-white/20" : "bg-line-strong")} />
          ))}
        </span>
        <span
          aria-hidden
          className={cn("absolute left-1/2 top-1/2 h-[46%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full", dark ? "bg-white/[0.06]" : "bg-paper-deep")}
        />
      </div>
      <div className="relative w-full overflow-hidden rounded-b-[0.9cqw]" style={{ aspectRatio: ratio }}>
        <Capture shot={shot} sizes={sizes} priority={priority} decorative={decorative} />
        <Glass strength={0.5} />
      </div>
      {(side || bottom) && (
        <Edges t="0.6cqw" x={side} y={bottom ? "bottom" : null} color={dark ? "#0A0C0F" : "linear-gradient(180deg,#D6DADC,#B4BABE)"} />
      )}
    </div>
  );
}

/** A chrome-less interface panel with thickness — the floating dashboard's
    tiles. */
export function Panel({
  shot,
  sizes,
  priority,
  decorative,
  ratio,
  className,
  style,
  side,
}: DeviceProps & { ratio: number }) {
  return (
    <div
      className={cn("absolute rounded-[0.8cqw] bg-paper-white ring-1 ring-ink-900/[0.08]", className)}
      style={{ ...P3, ...style }}
    >
      <div className="relative w-full overflow-hidden rounded-[0.8cqw]" style={{ aspectRatio: ratio }}>
        <Capture shot={shot} sizes={sizes} priority={priority} decorative={decorative} />
        <Glass strength={0.6} />
      </div>
      <Edges t="0.7cqw" x={side} y="bottom" color="linear-gradient(180deg,#D9DDE0,#AEB4B9)" />
    </div>
  );
}

/** A bare display — black bezel, glass, thickness — for the stacked scene. */
export function Display({
  shot,
  sizes,
  priority,
  decorative,
  className,
  style,
  side,
  dim = 0,
  ratio,
}: DeviceProps & { dim?: number; ratio?: number }) {
  return (
    <div
      className={cn("absolute rounded-[1.4cqw] p-[1.4%] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_3cqw_6cqw_-2.4cqw_rgba(3,10,22,0.6)]", className)}
      style={{ ...P3, background: BLACK, ...style }}
    >
      <div className="relative overflow-hidden rounded-[0.8cqw]">
        <Screen shot={shot} ratio={ratio ?? screenRatio(shot)} sizes={sizes} priority={priority} decorative={decorative} />
        {dim > 0 && <span aria-hidden className="absolute inset-0 bg-[#05070A]" style={{ opacity: dim }} />}
      </div>
      <Edges t="0.7cqw" x={side} y="bottom" color="#1A1D21" />
    </div>
  );
}

/**
 * The screen of a device on its own: bezel, glass and shadow, no body. For a
 * layout that arranges screens itself — the home deck — so it shares the
 * devices' finish without standing a stack of laptops on each other.
 */
export function DeviceScreen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative block rounded-[14px] p-[1.4%] shadow-[0_40px_70px_-30px_rgba(0,0,0,0.75),0_12px_24px_-12px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.09)]",
        className,
      )}
      style={{ background: BLACK }}
    >
      <span className="relative block overflow-hidden rounded-[8px] bg-paper-white">
        {children}
        <Glass />
      </span>
    </span>
  );
}

/** A soft shadow pool on the floor of a scene, fading as the scene rises. */
export function FloorShadow({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      className={cn("absolute rounded-[50%]", className)}
      style={{
        background: "radial-gradient(50% 50% at 50% 50%, rgba(3,8,18,0.42), rgba(3,8,18,0) 70%)",
        opacity: "calc(1 - var(--mk-h) * 0.35)",
        transform: `scale(calc(1 - var(--mk-h) * 0.06))`,
        ...style,
      }}
    />
  );
}

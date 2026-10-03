import Image from "next/image";
import { cn } from "@/lib/utils";
import type {
  MockupGround,
  MockupScene,
  ProjectPhase,
  Shot,
  WorkProject,
} from "@/lib/work-model";
import { Browser, FloorShadow, Phone, hv } from "./mockup/devices";
import { SCENES, scaleSizes } from "./mockup/scenes";
import { PHASE_STYLE } from "./phase";

export { DeviceScreen } from "./mockup/devices";

/**
 * A project's portfolio visual: its real captures, presented in a 3D scene.
 *
 * The scene, its backdrop and its turn come from the project's own plan
 * (`project.mockup`, worked out deterministically in `lib/mockup-assign.ts`),
 * so neighbouring cards are individually presented rather than one template
 * repeated — ten scenes, eight grounds, each scene mirrored on its second
 * use. The captures themselves are never altered.
 *
 * Projects a scene can't present honestly get their own treatment:
 *
 *   composed render (`presented`) → shown whole, never inside a second device
 *   interface crop only           → a floating window no wider than its pixels
 *   phone captures only           → the phones, side by side
 *   no captures                   → a typographic cover, never a drawn screen
 *
 * Plain CSS 3D on top of `next/image`: no WebGL, no client JS. Hover is one
 * registered custom property (`--mk-h`, globals.css) that every transform and
 * shadow reads; reduced motion keeps the scene still. The stage reserves its
 * aspect ratio, so nothing shifts as captures load.
 */

/* ---------------------------------------------------------------- Grounds */

type GroundStyle = {
  background: string;
  tone: "dark" | "light";
  pattern: "grid-dark" | "grid-light" | "dots-dark" | "dots-light" | "none";
};

/* Dark and quiet throughout: the light in each is low and off to one side,
   so the brightest thing in the frame is always the project's own screen. */
const GROUNDS: Record<MockupGround, GroundStyle> = {
  /* The site's hero navy, a soft key from the upper left. */
  navy: {
    background: [
      "radial-gradient(55% 60% at 14% 0%, rgba(68,158,216,0.16), rgba(68,158,216,0) 65%)",
      "radial-gradient(90% 90% at 50% 45%, #133963 0%, #0F2B4E 55%, #0A2040 100%)",
    ].join(","),
    tone: "dark",
    pattern: "grid-dark",
  },
  /* Deeper navy, a low wash of azure rising from the floor. */
  midnight: {
    background: [
      "radial-gradient(70% 45% at 50% 115%, rgba(68,158,216,0.18), rgba(68,158,216,0) 70%)",
      "linear-gradient(180deg, #0C1A30 0%, #081324 100%)",
    ].join(","),
    tone: "dark",
    pattern: "dots-dark",
  },
  /* The logo's steel, taken down towards ink. */
  steel: {
    background: [
      "radial-gradient(55% 60% at 85% 0%, rgba(143,202,235,0.14), rgba(143,202,235,0) 65%)",
      "linear-gradient(160deg, #22445C 0%, #183347 60%, #12293A 100%)",
    ].join(","),
    tone: "dark",
    pattern: "grid-dark",
  },
  /* Studio charcoal: one soft key light from above. */
  charcoal: {
    background: [
      "radial-gradient(55% 55% at 30% -5%, rgba(255,255,255,0.07), rgba(255,255,255,0) 70%)",
      "linear-gradient(180deg, #22272B 0%, #14171A 100%)",
    ].join(","),
    tone: "dark",
    pattern: "none",
  },
  /* The logo's charcoal, the faintest amber at one corner. */
  graphite: {
    background: [
      "radial-gradient(45% 55% at 100% 100%, rgba(245,159,19,0.07), rgba(245,159,19,0) 70%)",
      "linear-gradient(135deg, #2A3033 0%, #1E2326 55%, #171A1D 100%)",
    ].join(","),
    tone: "dark",
    pattern: "grid-dark",
  },
  /* Near-black with a cold azure rim — the darkest of the set. */
  abyss: {
    background: [
      "radial-gradient(60% 50% at 50% 0%, rgba(68,158,216,0.10), rgba(68,158,216,0) 70%)",
      "linear-gradient(180deg, #0E1216 0%, #090B0E 100%)",
    ].join(","),
    tone: "dark",
    pattern: "dots-dark",
  },
};

const PATTERNS: Record<Exclude<GroundStyle["pattern"], "none">, { className?: string; style?: React.CSSProperties }> = {
  "grid-dark": { className: "grid-paper-dark opacity-40" },
  "grid-light": { className: "grid-fine opacity-60" },
  "dots-dark": {
    style: {
      backgroundImage: "radial-gradient(rgba(245,246,244,0.07) 1px, transparent 1px)",
      backgroundSize: "18px 18px",
    },
  },
  "dots-light": { className: "dot-paper opacity-50" },
};

/** Patterns fade out towards the frame's edges. */
const PATTERN_FADE =
  "radial-gradient(70% 70% at 50% 45%, #000 0%, rgba(0,0,0,0.5) 55%, transparent 85%)";

/* ------------------------------------------------------- Loose treatments */

/** A composed render: already has its device and backdrop. Shown whole —
    contained, not cropped to the stage's shape. */
function Presented({ shot, sizes, priority }: { shot: Shot; sizes: string; priority: boolean }) {
  return (
    <Image
      src={shot.src}
      alt={shot.alt}
      fill
      quality={85}
      priority={priority}
      sizes={sizes}
      className="object-contain transition-transform duration-700 ease-smooth group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    />
  );
}

/** An interface crop, alone: a floating window, never wider than its own
    pixels, so a 319px capture is not blown up to mush. */
function CropWindow({ shot, sizes, priority, mirror, dark }: { shot: Shot; sizes: string; priority: boolean; mirror: boolean; dark: boolean }) {
  const ratio = Math.min(3, Math.max(0.9, shot.ratio));
  const m = mirror ? -1 : 1;
  return (
    <div className="absolute inset-0" style={{ perspective: "150cqw" }}>
      <FloorShadow className="bottom-[8cqh] left-1/2 h-[12cqh] w-[50cqw] -translate-x-1/2" />
      <Browser
        shot={shot}
        sizes={sizes}
        priority={priority}
        ratio={ratio}
        dark={dark}
        side={m > 0 ? "right" : "left"}
        className="left-1/2 top-1/2 shadow-[0_3cqw_6cqw_-3cqw_rgba(3,10,22,0.5)]"
        style={{
          width: `min(62cqw, calc(66cqh * ${ratio.toFixed(3)}), ${shot.width}px)`,
          transform: `translate(-50%, -54%) translateY(${hv(-1, "cqh")}) rotateX(4deg) rotateY(calc(${m} * (-6deg + ${hv(2, "deg")})))`,
        }}
      />
    </div>
  );
}

function PhoneRow({ phones, sizes }: { phones: Shot[]; sizes: string }) {
  const n = phones.length;
  return (
    <div className="absolute inset-x-0 bottom-[9cqh] top-[8cqh] flex items-end justify-center gap-[5cqw]">
      {phones.map((phone, i) => (
        <Phone
          key={phone.src}
          shot={phone}
          sizes={sizes}
          decorative={i > 0}
          className="!relative flex-none"
          style={{ width: `min(${n === 1 ? 30 : 22}cqw, calc(${n === 1 || (n === 3 && i === 1) ? 82 : 74}cqh * 0.43))` }}
        />
      ))}
    </div>
  );
}

/** For a project whose captures are still to come: its name, set as a cover.
    Deliberately typographic — a drawn interface would be a screen that was
    never built. Hidden from assistive tech; the title is on the card. */
function Cover({ title, sector, phase, tone }: { title: string; sector: string; phase: ProjectPhase; tone: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center px-[10cqw] text-center">
      <span
        className={cn("flex items-center gap-2 font-mono uppercase tracking-[0.2em]", dark ? "text-paper/55" : "text-ink-400")}
        style={{ fontSize: "max(10px, 1.25cqw)" }}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", PHASE_STYLE[phase].dot)} />
        {sector.split("·")[0].trim()}
      </span>
      <span
        className={cn("mt-[4cqh] max-w-[22ch] font-medium leading-[1.06] tracking-[-0.03em]", dark ? "text-paper/85" : "text-ink/75")}
        style={{ fontSize: "clamp(18px, 4.4cqw, 54px)" }}
      >
        {title}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ Entry */

export default function ProjectMockup({
  project,
  scene: sceneOverride,
  ground: groundOverride,
  mirror: mirrorOverride,
  sizes = "(max-width: 640px) 92vw, (max-width: 1280px) 46vw, 420px",
  priority = false,
  interactive = true,
  className,
}: {
  project: WorkProject;
  /** Force a scene — for the mockup lab. Normally the project's plan decides. */
  scene?: MockupScene;
  /** Force a ground, or `none` to sit on a parent's own backdrop. */
  ground?: MockupGround | "none";
  mirror?: boolean;
  /** The stage's rendered width, as a `sizes` attribute. */
  sizes?: string;
  priority?: boolean;
  /** Respond to an ancestor `group`'s hover — off where the visual isn't a link. */
  interactive?: boolean;
  className?: string;
}) {
  const { media, mockup } = project;
  const groundKey = groundOverride ?? mockup.ground;
  const ground = groundKey === "none" ? null : GROUNDS[groundKey];
  const tone = ground?.tone ?? "dark";
  const mirror = mirrorOverride ?? mockup.mirror;
  const pattern = ground && ground.pattern !== "none" ? PATTERNS[ground.pattern] : null;

  const { primary, phones } = media;
  let content: React.ReactNode;
  if (!primary && phones.length === 0) {
    content = <Cover title={project.title} sector={project.sector} phase={project.phase} tone={tone} />;
  } else if (!primary) {
    content = <PhoneRow phones={phones} sizes={scaleSizes(sizes, 0.25)} />;
  } else if (primary.presented) {
    content = <Presented shot={primary} sizes={sizes} priority={priority} />;
  } else if (primary.kind !== "desktop") {
    content = <CropWindow shot={primary} sizes={sizes} priority={priority} mirror={mirror} dark={false} />;
  } else {
    const Scene = SCENES[sceneOverride ?? mockup.scene];
    content = <Scene media={media} sizes={sizes} priority={priority} mirror={mirror} />;
  }

  return (
    <div
      className={cn("relative aspect-[16/10] w-full overflow-hidden", className)}
      style={ground ? { background: ground.background } : undefined}
    >
      {pattern && (
        <div
          aria-hidden
          className={cn("absolute inset-0", pattern.className)}
          style={{ ...pattern.style, maskImage: PATTERN_FADE, WebkitMaskImage: PATTERN_FADE }}
        />
      )}
      <div
        className={cn(
          "absolute inset-0 [container-name:mk] [container-type:size]",
          interactive && "mk-stage",
        )}
      >
        {content}
      </div>
    </div>
  );
}

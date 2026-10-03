import type { MockupScene, ProjectMedia, Shot } from "@/lib/work-model";
import {
  Browser,
  Capture,
  Display,
  FloorShadow,
  Glass,
  Laptop,
  Monitor,
  P3,
  Panel,
  Phone,
  Tablet,
  hv,
  screenRatio,
  turn,
} from "./devices";

/*
 * The ten scenes. Each arranges the same devices into a different
 * composition, so a grid of them reads as individually presented projects —
 * but in every one the project's own screen is the hero:
 *
 *   - The screen is sized first, to 60–80% of the stage, and the device is
 *     built round it. Where something has to give, it is the device — a
 *     laptop's deck or a monitor's foot runs off the frame — never the UI.
 *   - The screen takes the capture's own shape (`screenRatio`), so nothing is
 *     cropped at the sides or stretched.
 *   - Turns are gentle — a few degrees, less again on a small card
 *     (`turn()`, `--mk-turn`) — so the interface reads from the front.
 *   - Nothing is laid over the primary screen. Second screens sit behind it
 *     or beside it; phones and tablets stand clear of it.
 *
 * Geometry is in container units against a 16:10 stage (`cqw`/`cqh`). `m`
 * is the mirror: a scene used twice faces the other way the second time.
 * Each scene fills only with the project's real captures —
 * `lib/mockup-assign.ts` keeps a scene away from a project that can't fill it.
 */

export type SceneProps = {
  media: ProjectMedia;
  /** The stage's rendered width, as a `sizes` attribute. */
  sizes: string;
  priority: boolean;
  mirror: boolean;
};

/** Rewrites a `sizes` string so every width is `factor` of what it was —
    a device that fills a third of the stage asks for a third of the pixels. */
export function scaleSizes(sizes: string, factor: number) {
  return sizes.replace(/(\d+(?:\.\d+)?)(vw|px)(?=\s*(?:,|$))/g, (_, n, unit) =>
    `${Math.max(1, Math.round(Number(n) * factor))}${unit}`,
  );
}

/** A project's further screens: real desktop captures first, then crops. */
function extras(media: ProjectMedia): Shot[] {
  const rest = media.supporting.filter((s) => !s.presented);
  return [...rest.filter((s) => s.kind === "desktop"), ...rest.filter((s) => s.kind !== "desktop")];
}

/** The widest a screen of ratio `r` can be inside `w`cqw × `h`cqh. */
const fit = (w: number, h: number, r: number) =>
  `min(${w}cqw, calc(${h}cqh * ${r.toFixed(3)}))`;

/** A `top` that centres a block `k` × the screen's width tall, never above
    `floor`cqh. */
const centreTop = (sw: string, k: number, floor = 4) =>
  `max(${floor}cqh, calc((100cqh - ${sw} * ${k.toFixed(4)}) / 2))`;

/** The scene's camera: a long lens, so depth reads as depth rather than
    distortion, scaled to the stage so a card and a hero agree. */
function Camera({
  children,
  depth = 220,
  origin = "50% 40%",
}: {
  children: React.ReactNode;
  depth?: number;
  origin?: string;
}) {
  return (
    <div
      className="mk-camera absolute inset-0"
      style={{ perspective: `${depth}cqw`, perspectiveOrigin: origin }}
    >
      {children}
    </div>
  );
}

/** A laptop's lid is the screen plus 2.2% bezel either side; its visible
    height adds the bezels and the first of the deck. */
const LID = 0.956;
const laptopHeight = (r: number) => 1 / r + 0.166;

/* 01 — A laptop at a slight three-quarter turn, the screen near full width. */
function FloatingLaptop({ media, sizes, priority, mirror }: SceneProps) {
  const m = mirror ? -1 : 1;
  const shot = media.primary!;
  const r = screenRatio(shot);
  const sw = fit(78, 76, r);
  return (
    <Camera>
      <Laptop
        shot={shot}
        sizes={scaleSizes(sizes, 0.8)}
        priority={priority}
        side={m > 0 ? "right" : "left"}
        className="left-1/2"
        style={{
          top: centreTop(sw, laptopHeight(r), 5),
          width: `calc(${sw} / ${LID})`,
          transform: `translateX(-50%) translateY(${hv(-1, "cqh")}) rotateX(${turn(4)}) rotateY(calc(${m} * (${turn(-8)} + ${hv(2, "deg")})))`,
        }}
      />
    </Camera>
  );
}

/* 02 — A desktop display, almost square on, its stand running off the foot. */
function DesktopMonitor({ media, sizes, priority, mirror }: SceneProps) {
  const m = mirror ? -1 : 1;
  const shot = media.primary!;
  const r = screenRatio(shot);
  const sw = fit(76, 74, r);
  return (
    <Camera>
      <Monitor
        shot={shot}
        sizes={scaleSizes(sizes, 0.78)}
        priority={priority}
        side={m > 0 ? "right" : "left"}
        className="left-1/2"
        style={{
          top: centreTop(sw, 1 / r + 0.2, 5),
          width: `calc(${sw} / 0.974)`,
          transform: `translateX(-50%) translateY(${hv(-1, "cqh")}) rotateX(${turn(2)}) rotateY(calc(${m} * (${turn(-5)} + ${hv(2, "deg")})))`,
        }}
      />
    </Camera>
  );
}

/* 03 — The interface in a floating browser window, large and nearly front-on. */
function FloatingBrowser({ media, sizes, priority, mirror }: SceneProps) {
  const m = mirror ? -1 : 1;
  const shot = media.primary!;
  const r = screenRatio(shot);
  const sw = fit(86, 80, r);
  return (
    <Camera>
      <FloorShadow className="bottom-[2cqh] left-1/2 h-[10cqh] w-[70cqw] -translate-x-1/2" />
      <Browser
        shot={shot}
        sizes={scaleSizes(sizes, 0.86)}
        priority={priority}
        ratio={r}
        side={m > 0 ? "right" : "left"}
        className="left-1/2 top-1/2 shadow-[0_2.4cqw_5cqw_-2.4cqw_rgba(0,0,0,0.6)]"
        style={{
          width: sw,
          transform: `translate(-50%, -50%) translateY(${hv(-1, "cqh")}) rotateX(${turn(5)}) rotateY(calc(${m} * (${turn(-7)} + ${hv(2, "deg")})))`,
        }}
      />
    </Camera>
  );
}

/* 04 — The main window large on one side, a second screen of the same
   product behind it on the other, and its phone beside that when it has one. */
function MultiScreen({ media, sizes, priority, mirror }: SceneProps) {
  const m = mirror ? -1 : 1;
  const [second] = extras(media);
  const phone = media.phones[0];
  const near = m > 0 ? "left" : "right";
  const far = m > 0 ? "right" : "left";
  const r = screenRatio(media.primary!);
  const r2 = screenRatio(second);
  const sw = fit(72, 74, r);
  return (
    <Camera>
      <Browser
        shot={second}
        sizes={scaleSizes(sizes, 0.44)}
        decorative
        dark
        ratio={r2}
        bottom={false}
        className="top-[7cqh] shadow-[0_2cqw_4cqw_-2cqw_rgba(0,0,0,0.6)]"
        style={{
          [far]: "3cqw",
          width: fit(44, 54, r2),
          opacity: 0.85,
          transform: `translateY(${hv(-0.6, "cqh")}) translateZ(-4cqw) rotateY(calc(${m} * ${turn(8)}))`,
        }}
      />
      <Browser
        shot={media.primary!}
        sizes={scaleSizes(sizes, 0.72)}
        priority={priority}
        ratio={r}
        side={m > 0 ? "right" : "left"}
        className="shadow-[0_2.4cqw_5cqw_-2.4cqw_rgba(0,0,0,0.65)]"
        style={{
          [near]: "3cqw",
          top: centreTop(sw, 1 / r + 0.034, 8),
          width: sw,
          transform: `translateY(${hv(-1.2, "cqh")}) rotateY(calc(${m} * (${turn(-6)} + ${hv(2, "deg")})))`,
        }}
      />
      {phone && (
        <Phone
          shot={phone}
          sizes={scaleSizes(sizes, 0.13)}
          className="mk-tertiary bottom-[5cqh]"
          style={{
            [far]: "4cqw",
            width: "12cqw",
            transform: `translateY(${hv(-1.6, "cqh")}) translateZ(2cqw) rotateY(calc(${m} * ${turn(-6)}))`,
          }}
        />
      )}
    </Camera>
  );
}

/* 05 — A laptop brought close and set to one side, so the screen nearly
   fills the frame and the deck runs off the bottom. */
function OffsetLaptop({ media, sizes, priority, mirror }: SceneProps) {
  const m = mirror ? -1 : 1;
  const shot = media.primary!;
  const r = screenRatio(shot);
  const sw = fit(84, 84, r);
  return (
    <Camera origin={m > 0 ? "30% 40%" : "70% 40%"}>
      <Laptop
        shot={shot}
        sizes={scaleSizes(sizes, 0.86)}
        priority={priority}
        side={m > 0 ? "left" : "right"}
        style={{
          [m > 0 ? "left" : "right"]: "4cqw",
          top: centreTop(sw, 1 / r + 0.06, 5),
          width: `calc(${sw} / ${LID})`,
          transformOrigin: m > 0 ? "0% 50%" : "100% 50%",
          transform: `translateY(${hv(-1, "cqh")}) rotateX(${turn(3)}) rotateY(calc(${m} * (${turn(7)} - ${hv(2, "deg")})))`,
        }}
      />
    </Camera>
  );
}

/* 06 — The laptop on one side, the project's real phone standing clear of
   its screen on the other. */
function LaptopMobile({ media, sizes, priority, mirror }: SceneProps) {
  const m = mirror ? -1 : 1;
  const shot = media.primary!;
  const r = screenRatio(shot);
  const sw = fit(68, 74, r);
  const near = m > 0 ? "left" : "right";
  const far = m > 0 ? "right" : "left";
  return (
    <Camera>
      <Laptop
        shot={shot}
        sizes={scaleSizes(sizes, 0.7)}
        priority={priority}
        side={m > 0 ? "right" : "left"}
        style={{
          [near]: "3cqw",
          top: centreTop(sw, laptopHeight(r), 6),
          width: `calc(${sw} / ${LID})`,
          transform: `translateY(${hv(-1, "cqh")}) rotateX(${turn(3)}) rotateY(calc(${m} * (${turn(-6)} + ${hv(2, "deg")})))`,
        }}
      />
      <Phone
        shot={media.phones[0]}
        sizes={scaleSizes(sizes, 0.18)}
        side={m > 0 ? "right" : "left"}
        className="top-1/2"
        style={{
          [far]: "4cqw",
          width: "min(17cqw, 34cqh)",
          transform: `translateY(-46%) translateY(${hv(-1.6, "cqh")}) rotateY(calc(${m} * (${turn(-8)} + ${hv(2, "deg")})))`,
        }}
      />
    </Camera>
  );
}

/* 07 — The main screen large and in front, the project's other screens
   stepping back behind it, smaller and dimmer. */
function StackedScreens({ media, sizes, priority, mirror }: SceneProps) {
  const m = mirror ? -1 : 1;
  const screens = [media.primary!, ...extras(media).filter((s) => s.kind === "desktop").slice(0, 2)];
  const r = screenRatio(screens[0]);
  const sw = fit(72, 72, r);
  const near = m > 0 ? "left" : "right";
  return (
    <Camera>
      <div
        className="absolute bottom-[6cqh]"
        style={{
          ...P3,
          [near]: "4cqw",
          width: `calc(${sw} / 0.972)`,
          transform: `rotateY(calc(${m} * ${turn(-6)}))`,
        }}
      >
        <div className="relative w-full" style={{ ...P3, aspectRatio: r * 0.972 }}>
          {screens
            .map((shot, i) => ({ shot, i }))
            .reverse()
            .map(({ shot, i }) => (
              <Display
                key={shot.src}
                shot={shot}
                sizes={scaleSizes(sizes, 0.72)}
                priority={priority && i === 0}
                decorative={i > 0}
                dim={i * 0.3}
                ratio={r}
                side={i === 0 ? (m > 0 ? "right" : "left") : undefined}
                className={i === 2 ? "mk-tertiary inset-x-0 bottom-0" : "inset-x-0 bottom-0"}
                style={{
                  transform:
                    i === 0
                      ? `translateY(${hv(-1, "cqh")})`
                      : `translate3d(calc(${m * 12 * i}cqw * (1 + var(--mk-h) * 0.12)), calc(${-9 * i}cqh * (1 + var(--mk-h) * 0.12)), ${-10 * i}cqw)`,
                }}
              />
            ))}
        </div>
      </div>
    </Camera>
  );
}

/* 08 — The dashboard as a large frameless panel, its other screens floating
   behind it as tiles that step out past its corners. */
function FloatingDashboard({ media, sizes, priority, mirror }: SceneProps) {
  const m = mirror ? -1 : 1;
  const shot = media.primary!;
  const tiles = extras(media).slice(0, 2);
  const r = screenRatio(shot);
  const sw = fit(76, 76, r);
  return (
    <Camera>
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          ...P3,
          width: sw,
          transform: `translate(-50%, -50%) rotateX(${turn(6)}) rotateY(calc(${m} * (${turn(-6)} + ${hv(2, "deg")})))`,
        }}
      >
        {tiles.map((tile, i) => {
          const tr = Math.min(2.6, Math.max(1, tile.ratio));
          const pos: React.CSSProperties =
            i === 0
              ? { [m > 0 ? "right" : "left"]: "-9%", top: "-9%" }
              : { [m > 0 ? "left" : "right"]: "-8%", bottom: "-8%" };
          return (
            <Panel
              key={tile.src}
              shot={tile}
              sizes={scaleSizes(sizes, 0.3)}
              decorative
              ratio={tr}
              className={i === 1 ? "mk-tertiary" : undefined}
              style={{
                ...pos,
                width: tr > 1.8 ? "42%" : "34%",
                opacity: 0.8,
                transform: `translateZ(calc(${-6 - i * 2}cqw - ${hv(1, "cqw")}))`,
              }}
            />
          );
        })}
        <Panel
          shot={shot}
          sizes={scaleSizes(sizes, 0.76)}
          priority={priority}
          ratio={r}
          side={m > 0 ? "right" : "left"}
          className="!relative w-full shadow-[0_2.4cqw_5cqw_-2cqw_rgba(0,0,0,0.65)]"
          style={{ transform: `translateZ(${hv(1, "cqw")})` }}
        />
      </div>
    </Camera>
  );
}

/* 09 — The interface at its largest, in the slimmest of frames, tipped back
   by a breath: an editorial cut that lets a strong screen speak. */
function FullBleed({ media, sizes, priority, mirror }: SceneProps) {
  const m = mirror ? -1 : 1;
  const shot = media.primary!;
  const r = screenRatio(shot);
  const sw = fit(90, 88, r);
  return (
    <Camera>
      <div
        className="absolute left-1/2 top-1/2 rounded-[1cqw] bg-[#0B0D10] p-[0.45cqw] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_3cqw_6cqw_-2.4cqw_rgba(0,0,0,0.7)]"
        style={{
          width: sw,
          transform: `translate(-50%, -50%) translateY(${hv(-0.8, "cqh")}) rotateX(${turn(3)}) rotateY(calc(${m} * ${turn(-2)}))`,
        }}
      >
        <div className="relative w-full overflow-hidden rounded-[0.6cqw]" style={{ aspectRatio: r }}>
          <Capture shot={shot} sizes={scaleSizes(sizes, 0.9)} priority={priority} />
          <Glass strength={0.6} />
        </div>
      </div>
    </Camera>
  );
}

/* 10 — Desktop, tablet and phone together — only for a project with a real
   capture for each. The desktop leads; the others stand clear of it. */
function DeviceCollage({ media, sizes, priority, mirror }: SceneProps) {
  const m = mirror ? -1 : 1;
  const shot = media.primary!;
  const tabletShot = extras(media).find((s) => s.kind === "desktop")!;
  const r = screenRatio(shot);
  const sw = fit(60, 68, r);
  const near = m > 0 ? "left" : "right";
  const far = m > 0 ? "right" : "left";
  return (
    <Camera>
      <Monitor
        shot={shot}
        sizes={scaleSizes(sizes, 0.6)}
        priority={priority}
        side={m > 0 ? "right" : "left"}
        style={{
          [near]: "3cqw",
          top: centreTop(sw, 1 / r + 0.2, 5),
          width: `calc(${sw} / 0.974)`,
          transform: `translateY(${hv(-1, "cqh")}) rotateY(calc(${m} * (${turn(-5)} + ${hv(2, "deg")})))`,
        }}
      />
      <Tablet
        shot={tabletShot}
        sizes={scaleSizes(sizes, 0.32)}
        side={m > 0 ? "right" : "left"}
        className="mk-tertiary top-[12cqh]"
        style={{
          [far]: "3cqw",
          width: "31cqw",
          transform: `translateY(${hv(-1.2, "cqh")}) translateZ(-2cqw) rotateY(calc(${m} * ${turn(-8)}))`,
        }}
      />
      <Phone
        shot={media.phones[0]}
        sizes={scaleSizes(sizes, 0.12)}
        side={m > 0 ? "right" : "left"}
        className="bottom-[4cqh]"
        style={{
          [far]: "15cqw",
          width: "min(12cqw, 24cqh)",
          transform: `translateY(${hv(-1.6, "cqh")}) translateZ(3cqw) rotateY(calc(${m} * ${turn(-8)}))`,
        }}
      />
    </Camera>
  );
}

export const SCENES: Record<MockupScene, (props: SceneProps) => React.ReactElement> = {
  "floating-laptop": FloatingLaptop,
  "desktop-monitor": DesktopMonitor,
  "floating-browser": FloatingBrowser,
  "multi-screen": MultiScreen,
  "offset-laptop": OffsetLaptop,
  "laptop-mobile": LaptopMobile,
  "stacked-screens": StackedScreens,
  "floating-dashboard": FloatingDashboard,
  "full-bleed": FullBleed,
  "device-collage": DeviceCollage,
};

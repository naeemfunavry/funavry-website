"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  BrainCircuit,
  Blocks,
  Cloud,
  Cpu,
  Database,
  Globe,
  Glasses,
  LayoutGrid,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

/**
 * The hero's ecosystem: ten technology capsules in slow orbit around a glass
 * AI core, each wired back to it by a light trail carrying data packets inward.
 * The claim the picture makes is the one the copy makes — intelligence sits at
 * the centre and every technology feeds it.
 *
 * Built in SVG + transforms rather than 3D: it costs nothing to load, holds
 * 60fps, and every animation here is transform/opacity only.
 */

/** The scene is authored at this size and scaled to fit its slot. */
const SIZE = 520;
const C = SIZE / 2;
/** Orbit radius, node tile size, core radius. */
const R = 198;
const TILE = 64;
const CORE = 62;

/** One full turn of the orbit. Everything else is phased against it. */
const ORBIT_SECONDS = 90;

type Node = { label: string; icon: LucideIcon; accent?: boolean };

/** Ten technologies, clockwise from the top. Labels stay on one line — they're
    revealed in a chip on hover, not wrapped under the icon. */
const NODES: Node[] = [
  { label: "AI & Automation", icon: BrainCircuit, accent: true },
  { label: "Enterprise Software", icon: LayoutGrid },
  { label: "Cloud & DevOps", icon: Cloud },
  { label: "Data Engineering", icon: Database },
  { label: "Mobile Apps", icon: Smartphone },
  { label: "Web Engineering", icon: Globe },
  { label: "Blockchain & Web3", icon: Blocks, accent: true },
  { label: "AR / VR / XR", icon: Glasses },
  { label: "IoT", icon: Cpu },
  { label: "Cyber Security", icon: ShieldCheck },
];

const AZURE = "#449ED8";
const AMBER = "#F59F13";
/** The two hues as channels, for the tiles' translucent fills and glows. */
const RGB = { [AZURE]: "68,158,216", [AMBER]: "245,159,19" } as const;

const EXPO = [0.19, 1, 0.22, 1] as const;

/** Angle of node `i`, measured clockwise from twelve o'clock. */
const angleOf = (i: number) => (360 / NODES.length) * i;

/**
 * Trig is only accurate to within a bit, and that bit is allowed to differ
 * between engines — Node and the browser print different digits for the same
 * expression, and React reads that as a hydration mismatch. Every coordinate
 * that reaches server-rendered markup goes through here first.
 */
const round = (v: number) => Math.round(v * 1000) / 1000;

/** Polar → SVG, with 0° at the top so it matches the CSS transforms. */
const px = (a: number, r: number) => round(C + r * Math.sin((a * Math.PI) / 180));
const py = (a: number, r: number) => round(C - r * Math.cos((a * Math.PI) / 180));

/* -------------------------------------------------------------------------- */

/** A layer that drifts against the pointer. `depth` is how far it lags. */
function Parallax({
  mx,
  my,
  depth,
  className,
  children,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  className?: string;
  children: React.ReactNode;
}) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

function Core({ still }: { still: boolean }) {
  const spin = (duration: number, reverse = false) =>
    still
      ? {}
      : {
          animate: { rotate: reverse ? -360 : 360 },
          transition: {
            duration,
            repeat: Infinity,
            ease: "linear" as const,
          },
        };

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: CORE * 2, height: CORE * 2 }}
    >
      {/* Volumetric bloom. Sits well outside the orb, so what reads is light. */}
      <motion.div
        aria-hidden
        className="absolute -inset-[85%] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(closest-side, rgba(68,158,216,0.5), rgba(68,158,216,0.12) 55%, transparent 75%)`,
        }}
        animate={still ? {} : { opacity: [0.75, 1, 0.75], scale: [1, 1.07, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* The orb: a lit sphere, not a flat disc — the gradient is offset to a
          light source at the upper left, and a rim light traces the far edge. */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 34% 28%, rgba(255,255,255,0.95), rgba(190,225,247,0.55) 22%, rgba(68,158,216,0.42) 48%, rgba(31,95,135,0.55) 72%, rgba(20,45,66,0.75) 100%)`,
          boxShadow: `
            inset 0 -14px 30px rgba(68,158,216,0.55),
            inset 0 8px 22px rgba(255,255,255,0.35),
            0 0 60px rgba(68,158,216,0.45)`,
        }}
        animate={still ? {} : { scale: [1, 1.035, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Specular highlight. */}
        <span
          aria-hidden
          className="absolute left-[24%] top-[16%] h-[26%] w-[34%] rounded-full bg-white/70 blur-[6px]"
        />
        {/* Rim light. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 68% 78%, rgba(143,202,235,0.5), transparent 42%)",
          }}
        />
      </motion.div>

      {/* Meridians — the orb reads as a volume once something rotates on it. */}
      <svg
        aria-hidden
        viewBox="0 0 124 124"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <clipPath id="hero-orb">
            <circle cx="62" cy="62" r="62" />
          </clipPath>
        </defs>
        <g clipPath="url(#hero-orb)" opacity="0.5">
          <motion.g style={{ originX: "62px", originY: "62px" }} {...spin(26)}>
            <ellipse
              cx="62"
              cy="62"
              rx="24"
              ry="62"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="0.75"
              fill="none"
            />
            <ellipse
              cx="62"
              cy="62"
              rx="48"
              ry="62"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="0.75"
              fill="none"
            />
          </motion.g>
        </g>
        {/* Latitude, fixed. */}
        <ellipse
          cx="62"
          cy="62"
          rx="62"
          ry="20"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="0.75"
          fill="none"
        />
      </svg>

      {/* Holographic rings, each on its own period. */}
      <svg
        aria-hidden
        viewBox="0 0 124 124"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <motion.g style={{ originX: "62px", originY: "62px" }} {...spin(20)}>
          <circle
            cx="62"
            cy="62"
            r="76"
            stroke={AZURE}
            strokeOpacity="0.75"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="40 438"
            fill="none"
          />
        </motion.g>
        <motion.g
          style={{ originX: "62px", originY: "62px" }}
          {...spin(34, true)}
        >
          <circle
            cx="62"
            cy="62"
            r="88"
            stroke={AMBER}
            strokeOpacity="0.6"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="26 527"
            fill="none"
          />
        </motion.g>
        <motion.g style={{ originX: "62px", originY: "62px" }} {...spin(60)}>
          <circle
            cx="62"
            cy="62"
            r="88"
            stroke="rgba(245,246,244,0.16)"
            strokeWidth="1"
            strokeDasharray="1 7"
            fill="none"
          />
        </motion.g>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Trails run capsule → core, so the packets always arrive at intelligence. */
function Trails({ still }: { still: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="absolute inset-0 h-full w-full"
      fill="none"
    >
      <defs>
        <radialGradient id="hero-trail-fade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={AZURE} stopOpacity="0.85" />
          <stop offset="100%" stopColor={AZURE} stopOpacity="0.12" />
        </radialGradient>
      </defs>

      {NODES.map((node, i) => {
        const a = angleOf(i);
        const hue = node.accent ? AMBER : AZURE;
        // From just outside the core to just short of the node's tile — clear of
        // it even when it lifts on hover.
        const from = R - TILE / 2 - 10;
        const d = `M ${px(a, from)} ${py(a, from)} L ${px(a, CORE + 6)} ${py(a, CORE + 6)}`;
        const phase = (i / NODES.length) * 3;

        return (
          <g key={node.label}>
            {/* The line itself, breathing. */}
            <motion.path
              d={d}
              stroke="url(#hero-trail-fade)"
              strokeWidth="1"
              animate={still ? {} : { opacity: [0.35, 0.8, 0.35] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: phase,
              }}
            />

            {/* Data packet, running inward. */}
            {!still && (
              <motion.path
                d={d}
                pathLength={1}
                stroke={hue}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="0.06 0.94"
                initial={{ strokeDashoffset: 1 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeIn",
                  delay: phase,
                }}
              />
            )}

            {/* Where the trail meets the core. */}
            <motion.circle
              cx={px(a, CORE + 6)}
              cy={py(a, CORE + 6)}
              r="1.8"
              fill={hue}
              animate={still ? {} : { opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeOut",
                delay: phase,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

function Capsule({
  node,
  i,
  still,
}: {
  node: Node;
  i: number;
  still: boolean;
}) {
  const a = angleOf(i);
  const Icon = node.icon;
  const hue = node.accent ? AMBER : AZURE;
  const rgb = RGB[hue as keyof typeof RGB];
  const [hover, setHover] = useState(false);

  return (
    // Placed on the orbit.
    <div
      className="absolute left-1/2 top-1/2 h-0 w-0"
      style={{ transform: `rotate(${a}deg) translateY(-${R}px)` }}
    >
      {/* Cancels the orbit's spin, so the capsule never tips over. */}
      <motion.div
        className="absolute left-0 top-0"
        animate={still ? {} : { rotate: -360 }}
        transition={{
          duration: ORBIT_SECONDS,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Cancels this capsule's own placement angle. */}
        <div style={{ transform: `rotate(${-a}deg)` }}>
          {/* The invisible hit area: the tile is 64px, but a moving target wants
              more room than it occupies. */}
          <motion.div
            onHoverStart={() => setHover(true)}
            onHoverEnd={() => setHover(false)}
            className="absolute -left-[44px] -top-[44px] flex h-[88px] w-[88px] cursor-pointer items-center justify-center"
            // A slow, unsynchronised bob, so the ring never looks rigid.
            animate={still ? {} : { y: [0, -5, 0] }}
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
            // A hovered node lifts above its neighbours and the trails.
            style={{ zIndex: hover ? 20 : 1 }}
          >
            <div className="relative flex flex-col items-center">
              {/* The node, in the same tile the technology stack uses: a rounded
                  square outlined in its own hue, over a wash of it. The tile
                  scales as a whole rather than the glyph alone, so the outline
                  and the icon stay in proportion. */}
              <motion.span
                className="flex items-center justify-center rounded-2xl backdrop-blur-[2px]"
                style={{
                  width: TILE,
                  height: TILE,
                  color: hue,
                  border: `1px solid rgba(${rgb},${hover ? 0.9 : 0.35})`,
                  background: `rgba(${rgb},${hover ? 0.16 : 0.07})`,
                  boxShadow: hover
                    ? `inset 0 0 22px -8px rgba(${rgb},0.8), 0 0 34px -6px rgba(${rgb},0.85)`
                    : `inset 0 0 20px -10px rgba(${rgb},0.6)`,
                }}
                animate={
                  hover
                    ? { scale: 1.12, opacity: 1 }
                    : still
                      ? { scale: 1, opacity: 1 }
                      : { scale: 1, opacity: [0.82, 1, 0.82] }
                }
                transition={
                  hover
                    ? { type: "spring", stiffness: 320, damping: 20 }
                    : {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: (i / NODES.length) * 3,
                      }
                }
              >
                <Icon size={28} strokeWidth={1.5} />
              </motion.span>

              {/* The label rides in a chip of its own, out of flow. Out of flow
                  so revealing it can't nudge the icon or its neighbours; in a
                  chip because bare text has to survive passing over the core's
                  bloom, where the stage is no longer dark. */}
              <motion.span
                className="pointer-events-none absolute top-full mt-3 whitespace-nowrap rounded-full border border-paper/15 bg-ink-900/70 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-paper shadow-[0_10px_24px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md"
                initial={false}
                animate={{
                  opacity: hover ? 1 : 0,
                  y: hover ? 0 : -6,
                  scale: hover ? 1 : 0.9,
                }}
                transition={{ duration: 0.3, ease: EXPO }}
              >
                {node.label}
              </motion.span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Ambient motes. Deterministic positions — this renders on the server too, and
    the coordinates are rounded for the same reason `px`/`py` are. */
const MOTES = Array.from({ length: 18 }, (_, i) => {
  const a = (i * 137.5 * Math.PI) / 180; // golden angle, so they never band
  const r = 70 + ((i * 53) % 190);
  return {
    x: round(C + r * Math.cos(a)),
    y: round(C + r * Math.sin(a)),
    size: 1 + (i % 3) * 0.6,
    duration: 7 + (i % 5) * 1.6,
    delay: (i % 7) * 0.8,
  };
});

export default function AIEcosystem({ className }: { className?: string }) {
  const still = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer, in -1..1 across the scene, softened by a spring.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.6 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.6 });

  const onMove = (e: React.MouseEvent) => {
    if (still) return;
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    rawX.set(((e.clientX - box.left) / box.width - 0.5) * 2);
    rawY.set(((e.clientY - box.top) / box.height - 0.5) * 2);
  };

  const reset = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={className}
      // Scales the 520px scene down to whatever the column gives it.
      style={{ containerType: "inline-size" }}
    >
      <div
        className="relative mx-auto"
        style={{
          width: SIZE,
          height: SIZE,
          // cqw keeps the whole scene proportional in a narrow column.
          transform: `scale(min(1, calc(100cqw / ${SIZE})))`,
          transformOrigin: "center",
        }}
      >
        {/* Depth is sold by how much each layer lags the pointer. */}
        <Parallax mx={mx} my={my} depth={26} className="absolute inset-0">
          <motion.div
            aria-hidden
            className="absolute inset-[12%] rounded-full blur-[90px]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(68,158,216,0.28), rgba(55,96,121,0.14) 55%, transparent 78%)",
            }}
            animate={still ? {} : { opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </Parallax>

        {/* Motes. */}
        <Parallax mx={mx} my={my} depth={-16} className="absolute inset-0">
          <svg
            aria-hidden
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="absolute inset-0 h-full w-full"
          >
            {MOTES.map((m, i) => (
              <motion.circle
                key={i}
                cx={m.x}
                cy={m.y}
                r={m.size}
                fill={i % 5 === 0 ? AMBER : "#8FCAEB"}
                animate={
                  still
                    ? { opacity: 0.3 }
                    : { opacity: [0, 0.7, 0], y: [0, -14, 0] }
                }
                transition={{
                  duration: m.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: m.delay,
                }}
              />
            ))}
          </svg>
        </Parallax>

        {/* Orbit: trails and capsules turn together, so the wiring stays
            attached to what it's wiring. */}
        <Parallax mx={mx} my={my} depth={12} className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            animate={still ? {} : { rotate: 360 }}
            transition={{
              duration: ORBIT_SECONDS,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Trails still={still} />
            {NODES.map((node, i) => (
              <Capsule key={node.label} node={node} i={i} still={still} />
            ))}
          </motion.div>
        </Parallax>

        {/* The core is nearest the viewer, so it moves most. */}
        <Parallax mx={mx} my={my} depth={-30} className="absolute inset-0">
          <Core still={still} />
        </Parallax>
      </div>
    </div>
  );
}

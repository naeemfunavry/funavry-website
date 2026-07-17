"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Blocks,
  Bot,
  BrainCircuit,
  Building2,
  Calculator,
  ChevronRight,
  Cpu,
  GitBranch,
  Glasses,
  LayoutGrid,
  Network,
  Satellite,
  Server,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import FMark from "@/components/ui/FMark";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { SERVICES, type Service } from "@/lib/services";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  BrainCircuit,
  LayoutGrid,
  Blocks,
  Glasses,
  Cpu,
  Satellite,
  BarChart3,
  ShieldCheck,
  BadgeCheck,
  Server,
  Network,
  Building2,
  Calculator,
  Bot,
  GitBranch,
  Users,
};

/** A stylised wireframe globe with two orbits — decorative, sits behind the
    card's middle. Static, so this stays a server component. */
function GlobeMotif() {
  return (
    <svg viewBox="0 0 420 420" width="360" height="360" fill="none" aria-hidden>
      <defs>
        <pattern
          id="pf-dots"
          width="8.5"
          height="8.5"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.4" cy="1.4" r="1.15" fill="#63696B" fillOpacity="0.3" />
        </pattern>
        <clipPath id="pf-globe">
          <circle cx="210" cy="210" r="132" />
        </clipPath>
      </defs>

      {/* Dotted sphere. */}
      <g clipPath="url(#pf-globe)">
        <rect x="78" y="78" width="264" height="264" fill="url(#pf-dots)" />
      </g>
      <circle cx="210" cy="210" r="132" stroke="#CDD2C9" strokeWidth="1" />

      {/* Meridians. */}
      <ellipse
        cx="210"
        cy="210"
        rx="52"
        ry="132"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.6"
      />
      <ellipse
        cx="210"
        cy="210"
        rx="104"
        ry="132"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Parallels. */}
      <ellipse
        cx="210"
        cy="210"
        rx="132"
        ry="40"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.5"
      />
      <ellipse
        cx="210"
        cy="170"
        rx="118"
        ry="30"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.35"
      />
      <ellipse
        cx="210"
        cy="250"
        rx="118"
        ry="30"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.35"
      />

      {/* Orbits + nodes. */}
      <ellipse
        cx="210"
        cy="210"
        rx="188"
        ry="88"
        stroke="#8FCAEB"
        strokeWidth="1"
        opacity="0.55"
        transform="rotate(-24 210 210)"
      />
      <ellipse
        cx="210"
        cy="210"
        rx="176"
        ry="66"
        stroke="#F9C777"
        strokeWidth="1"
        opacity="0.45"
        transform="rotate(20 210 210)"
      />
      <circle cx="366" cy="150" r="4.5" fill="#449ED8" />
      <circle cx="66" cy="256" r="4" fill="#F59F13" />
    </svg>
  );
}

/**
 * Presentation-only metadata for the OS view: the short label a card can carry
 * without wrapping, plus the industry and stack chips the drawer shows. The
 * canonical practice copy stays in `@/lib/services` — nothing here overrides it.
 */
type Meta = { short: string; industries: string[]; stack: string[] };

const META: Record<string, Meta> = {
  "01": {
    short: "Artificial Intelligence & Automation",
    industries: [
      "Healthcare",
      "Financial Services",
      "Government",
      "Enterprise Systems",
    ],
    stack: ["Python", "LangChain", "OpenAI", "Azure AI", "Vector DB", "MLflow"],
  },
  "02": {
    short: "Digital Engineering & Product Development",
    industries: ["Commerce", "Media", "Healthcare", "Education"],
    stack: ["React", "Next.js", ".NET", "Node.js", "Flutter", "PostgreSQL"],
  },
  "03": {
    short: "Blockchain & FinTech",
    industries: ["Financial Services", "Commerce", "Enterprise Systems"],
    stack: ["Solidity", "Ethereum", "Solana", "Node.js", "React", "Rust"],
  },
  "04": {
    short: "Immersive Technologies",
    industries: ["Media", "Education", "Manufacturing", "Government"],
    stack: ["Unity", "Unreal", "WebXR", "Three.js", "C#", "Blender"],
  },
  "05": {
    short: "Robotics, IoT & Computer Vision",
    industries: [
      "Manufacturing",
      "Industrial IoT",
      "Supply Chain",
      "Government",
    ],
    stack: ["Python", "OpenCV", "PyTorch", "ROS", "MQTT", "Edge AI"],
  },
  "06": {
    short: "GIS, Geospatial AI & Satellite Analytics",
    industries: [
      "Government",
      "Supply Chain",
      "Manufacturing",
      "Industrial IoT",
    ],
    stack: ["ArcGIS", "QGIS", "PostGIS", "Python", "Mapbox", "Rasterio"],
  },
  "07": {
    short: "Data & Business Intelligence",
    industries: [
      "Financial Services",
      "Healthcare",
      "Commerce",
      "Enterprise Systems",
    ],
    stack: ["Snowflake", "Databricks", "dbt", "Kafka", "Power BI", "Airflow"],
  },
  "08": {
    short: " Cloud, DevOps & Cybersecurity",
    industries: [
      "Financial Services",
      "Government",
      "Healthcare",
      "Enterprise Systems",
    ],
    stack: ["AWS", "Azure", "Kubernetes", "Terraform", "Docker", "Grafana"],
  },
  "09": {
    short: "Quality Engineering & Audits",
    industries: ["Financial Services", "Healthcare", "Commerce", "Government"],
    stack: ["Playwright", "Cypress", "k6", "JMeter", "OWASP", "SonarQube"],
  },
  "10": {
    short: "Managed Services",
    industries: [
      "Enterprise Systems",
      "Financial Services",
      "Commerce",
      "Healthcare",
    ],
    stack: ["Azure", "AWS", "Kubernetes", "Datadog", "ServiceNow", "SIEM"],
  },
  "11": {
    short: "GBS & Operating Model Transformation",
    industries: ["Enterprise Systems", "Financial Services", "Manufacturing"],
    stack: ["Process Mining", "ServiceNow", "SAP", "Power BI", "Workday"],
  },
  "12": {
    short: "Global Capability Center (GCC) Advisory",
    industries: ["Enterprise Systems", "Financial Services", "Media"],
    stack: ["Workday", "SAP", "Power BI", "Jira", "Confluence"],
  },
  "13": {
    short: "Finance Transformation & Managed Services",
    industries: [
      "Financial Services",
      "Manufacturing",
      "Commerce",
      "Enterprise Systems",
    ],
    stack: ["SAP", "Oracle Fusion", "NetSuite", "Blackline", "Power BI"],
  },
  "14": {
    short: "AI-Powered Process Transformation",
    industries: ["Enterprise Systems", "Financial Services", "Supply Chain"],
    stack: ["UiPath", "Power Automate", "Python", "Celonis", "OpenAI"],
  },
  "15": {
    short: "Business Process Excellence",
    industries: ["Manufacturing", "Supply Chain", "Enterprise Systems"],
    stack: ["Celonis", "Signavio", "Power BI", "Visio", "Lean Six Sigma"],
  },
  "16": {
    short: "Global Workforce & Capability Solutions",
    industries: ["Enterprise Systems", "Education", "Commerce"],
    stack: ["Workday", "Deel", "Greenhouse", "Slack", "Jira"],
  },
};

const short = (s: Service) => META[s.n]?.short ?? s.title;

const TECH = SERVICES.filter((s) => s.group === "tech");
const GBS = SERVICES.filter((s) => s.group === "gbs");

/** Blue for technology, amber for business — the two halves of the network. */
const HUE = {
  tech: {
    rgb: "68,158,216",
    hex: "#449ED8",
    text: "text-azure-ink",
    chip: "bg-azure-50",
  },
  gbs: {
    rgb: "245,159,19",
    hex: "#F59F13",
    text: "text-amber-ink",
    chip: "bg-amber-50",
  },
} as const;

const GROUP_LABEL = {
  tech: "Technology & Engineering",
  gbs: "Global Business Services",
} as const;

/* --------------------------------------------------------------------------
   The core's scene

   Every coordinate below comes out of one camera, and that is the whole trick:
   the scene is projected from 18° above the horizon with a 12° yaw and a mild
   perspective, so the pyramid, the three orbits around it and the cube inside
   it are one object rather than stacked 2D art. Because the camera never moves,
   the projection is solved once and baked — there is no runtime maths, and no
   Three.js to ship for four static shapes.

   All of it lives in the core's own 200×200 viewBox, which the connection fan
   also measures against.
   -------------------------------------------------------------------------- */

/** The glass pyramid. `v0` is the near vertex, so the two faces that meet at
    the apex→v0 edge are the ones facing us; the third face and the base are
    seen *through* the glass, which is what sells it as transparent. */
const PYRAMID = {
  hull: "M 100 44.6 L 137 109.8 L 113.1 147.4 L 50.4 116.6 Z",
  faceLeft: "M 100 44.6 L 50.4 116.6 L 113.1 147.4 Z",
  faceRight: "M 100 44.6 L 113.1 147.4 L 137 109.8 Z",
  faceBack: "M 100 44.6 L 50.4 116.6 L 137 109.8 Z",
  base: "M 113.1 147.4 L 50.4 116.6 L 137 109.8 Z",
  edgeFront: "M 100 44.6 L 113.1 147.4",
  edgeBase: "M 50.4 116.6 L 137 109.8",
  /** The same hull, as percentages — a clip-path can't read a viewBox, and the
      backdrop-filter pane that does the actual frosting is an HTML element. */
  clip: "polygon(50% 22.3%, 68.5% 54.9%, 56.6% 73.7%, 25.2% 58.3%)",
  clipRight: "polygon(50% 22.3%, 56.6% 73.7%, 68.5% 54.9%)",
} as const;

/** The luminous cube suspended in the glass, low in the body where the pyramid
    is wide enough to clear it by ~7 units on every face. It carries its own 38°
    yaw on top of the scene's, so it presents a corner rather than a flat side.
    The three faces here are the three that survive back-face culling — the two
    that meet at the near vertical edge, plus the top, because the camera is
    above. Between them they tile the whole silhouette; drop one and the cube
    falls open. Centre projects to (100, 102.8), which is where the mark goes. */
const CUBE = {
  top: "M 101.65 96.67 L 117.88 90.32 L 98.5 85.47 L 81.98 91.3 Z",
  faceLeft: "M 101.65 96.67 L 101.61 121.38 L 82.36 115.09 L 81.98 91.3 Z",
  faceRight: "M 101.65 96.67 L 117.88 90.32 L 117.5 113.94 L 101.61 121.38 Z",
} as const;

/**
 * The three orbits are the delivery chain, outermost first: Build, then
 * Automate, then Operate. Each service declares which phase it lives in, so
 * hovering a card lights the orbit it belongs to — they aren't decoration,
 * they're the legend.
 *
 * Each is a real horizontal circle on the pyramid's axis, sized to clear the
 * body at the height it rides. Under an 18° camera a horizontal circle projects
 * to an ellipse with `ry = rx·sin 18°`, and its far half is the *upper* half —
 * which is why every orbit is drawn twice, once behind the glass and once in
 * front of it.
 */
const PHASE_RINGS = [
  {
    phase: "Build",
    hex: "#449ED8",
    cy: 123,
    rx: 70.8,
    ry: 21.9,
    spin: 26,
    reverse: false,
  },
  {
    phase: "Automate",
    hex: "#F59F13",
    cy: 90,
    rx: 48.9,
    ry: 15.1,
    spin: 19,
    reverse: true,
  },
  {
    /* Graphite rather than the brand's steel. Steel (#376079) is a dark
       desaturated blue, and three rings on white read as two blues and an
       amber — the eye files Build and Operate together, which is exactly
       backwards for a chain whose whole point is that they're distinct
       phases. A true neutral separates cleanly and is calmer besides. */
    phase: "Operate",
    hex: "#5A6265",
    cy: 65.2,
    rx: 33,
    ry: 10.2,
    spin: 34,
    reverse: false,
  },
] as const;

/** Loose motes on their own orbits. Same camera — every `ry` is `rx · sin 18°`,
    so they sit in the same space as the rings; the far half of each pass goes
    behind the glass and softens. Widths are tuned so nothing exceeds ~6px at
    the 440px desktop core: a mote that reads as a bead rather than a speck
    stops being atmosphere and starts competing with the cube. */
const PARTICLES = [
  { id: "p0", cy: 106, rx: 78, ry: 24.1, w: 2.2, spin: 30, reverse: false },
  { id: "p1", cy: 88, rx: 58, ry: 17.9, w: 1.4, spin: 38, reverse: true },
  { id: "p2", cy: 122, rx: 88, ry: 27.2, w: 2.8, spin: 46, reverse: false },
  { id: "p3", cy: 72, rx: 42, ry: 13, w: 1.2, spin: 34, reverse: true },
  { id: "p4", cy: 134, rx: 92, ry: 28.4, w: 1.8, spin: 54, reverse: true },
  { id: "p5", cy: 98, rx: 68, ry: 21, w: 1.1, spin: 42, reverse: false },
  { id: "p6", cy: 58, rx: 30, ry: 9.3, w: 1, spin: 28, reverse: true },
] as const;

/** An orbit as a closed path, opening at nine o'clock and running clockwise —
    so the first half is the far side, matching how the far/near clips split. */
const orbitPath = (rx: number, ry: number, cy: number) =>
  `M ${100 - rx} ${cy} a ${rx} ${ry} 0 1 1 ${rx * 2} 0 a ${rx} ${ry} 0 1 1 ${-rx * 2} 0`;

/** The far (upper) and near (lower) halves of an orbit, as open arcs. */
const farArc = (rx: number, ry: number, cy: number) =>
  `M ${100 - rx} ${cy} A ${rx} ${ry} 0 0 1 ${100 + rx} ${cy}`;
const nearArc = (rx: number, ry: number, cy: number) =>
  `M ${100 + rx} ${cy} A ${rx} ${ry} 0 0 1 ${100 - rx} ${cy}`;

const SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.9,
} as const;
const EXPO = [0.19, 1, 0.22, 1] as const;

/* --------------------------------------------------------------------------
   Connection network

   Endpoints are measured, never guessed: each card reports its inner edge and
   the core reports its centre, so a path always lands exactly on the ring.
   Cards map in reading order onto an arc, which is what keeps the fan
   symmetric and stops any two curves from crossing.
   -------------------------------------------------------------------------- */

type Link = {
  n: string;
  group: "tech" | "gbs";
  d: string;
  x1: number;
  y1: number;
};
type Geometry = {
  w: number;
  h: number;
  cx: number;
  cy: number;
  r: number;
  links: Link[];
};

/** Half-angle of the arc each column fans across, in degrees. */
const ARC = 56;

function buildLinks(
  cards: Map<string, HTMLElement>,
  wrap: DOMRect,
  core: DOMRect,
): Geometry {
  const cx = core.left + core.width / 2 - wrap.left;
  const cy = core.top + core.height / 2 - wrap.top;
  const r = core.width / 2;

  const links: Link[] = [];

  for (const column of [TECH, GBS]) {
    const side = column[0].group === "tech" ? -1 : 1; // which side of the core
    const last = Math.max(column.length - 1, 1);

    column.forEach((service, i) => {
      const el = cards.get(service.n);
      if (!el) return;

      const box = el.getBoundingClientRect();
      // Leave from the edge that faces the core.
      const x0 = (side === -1 ? box.right : box.left) - wrap.left;
      const y0 = box.top + box.height / 2 - wrap.top;

      // Top card lands high on the ring, bottom card low — order preserved,
      // so the curves never trade places.
      const t = i / last;
      const spread = (-ARC + t * 2 * ARC) * (Math.PI / 180);
      const theta = side === -1 ? Math.PI - spread : spread;
      const nx = Math.cos(theta);
      const ny = Math.sin(theta);
      const x1 = cx + r * nx;
      const y1 = cy + r * ny;

      const dx = Math.abs(x1 - x0);
      // Leave the card horizontally, arrive along the ring's normal.
      const c1x = x0 - side * dx * 0.5;
      const c1y = y0;
      const ext = Math.min(Math.max(dx * 0.32, 44), 150);
      const c2x = x1 + nx * ext;
      const c2y = y1 + ny * ext;

      links.push({
        n: service.n,
        group: service.group,
        x1,
        y1,
        d: `M ${x0.toFixed(1)} ${y0.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`,
      });
    });
  }

  return { w: wrap.width, h: wrap.height, cx, cy, r, links };
}

/** Stable per-link jitter, so idle particles don't march in lockstep. */
const drift = (n: string) => ((parseInt(n, 10) * 37) % 100) / 100;

function ConnectionNetwork({
  geom,
  activeId,
}: {
  geom: Geometry;
  activeId: string | null;
}) {
  const reduce = useReducedMotion();

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${geom.w} ${geom.h}`}
      fill="none"
    >
      <defs>
        {/* Comet head points at the core: solid where the path ends. */}
        <linearGradient id="os-flow-tech" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={HUE.tech.hex} stopOpacity="0" />
          <stop offset="100%" stopColor={HUE.tech.hex} stopOpacity="1" />
        </linearGradient>
        <linearGradient id="os-flow-gbs" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor={HUE.gbs.hex} stopOpacity="0" />
          <stop offset="100%" stopColor={HUE.gbs.hex} stopOpacity="1" />
        </linearGradient>
      </defs>

      {geom.links.map((link) => {
        const hue = HUE[link.group];
        const active = activeId === link.n;
        const dimmed = activeId !== null && !active;

        return (
          <motion.g
            key={link.n}
            animate={{ opacity: dimmed ? 0.2 : 1 }}
            transition={{ duration: 0.35, ease: EXPO }}
          >
            {/* Resting hairline. */}
            <path
              d={link.d}
              stroke={hue.hex}
              strokeOpacity={active ? 0.5 : 0.24}
              strokeWidth={active ? 1.6 : 1}
              style={{ transition: "stroke-width 300ms, stroke-opacity 300ms" }}
            />

            {/* Idle traffic: one dot drifting toward the core. */}
            {!reduce && (
              <motion.path
                d={link.d}
                pathLength={1}
                stroke={hue.hex}
                strokeOpacity={0.75}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeDasharray="0.014 0.986"
                initial={{ strokeDashoffset: 1 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{
                  duration: 5.5 + drift(link.n) * 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: drift(link.n) * 6,
                }}
              />
            )}

            {/* Hover: a gradient sweep runs the line into the core. */}
            {active && !reduce && (
              <motion.path
                d={link.d}
                pathLength={1}
                stroke={`url(#os-flow-${link.group})`}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeDasharray="0.3 0.7"
                initial={{ strokeDashoffset: 1 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{
                  duration: 1.35,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}

            {/* Where the path meets the ring. */}
            <motion.circle
              cx={link.x1}
              cy={link.y1}
              fill={hue.hex}
              animate={{ r: active ? 3.4 : 1.8, fillOpacity: active ? 1 : 0.4 }}
              transition={{ duration: 0.35, ease: EXPO }}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}

/* --------------------------------------------------------------------------
   AI core — permanently visible, never replaced by a selection.
   -------------------------------------------------------------------------- */

/**
 * One clock drives every orbit in the core.
 *
 * Hovering has to lean on the whole system's speed at once, and speed is the
 * one thing a declarative animation cannot change without flinching: hand
 * Framer a new `duration` mid-flight and the keyframes restart, so all seven
 * motes snap back to their starting points. Accumulating phase instead makes
 * hover a change of *rate*, which is continuous — the motes just lean forward.
 */
function useOrbitClock(hot: boolean, reduce: boolean | null) {
  const clock = useMotionValue(0);
  const rate = useMotionValue(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    // Never wrapped: a double holds a day of seconds without losing the
    // fraction the motes are actually positioned by.
    clock.set(clock.get() + (delta / 1000) * rate.get());
  });

  useEffect(() => {
    const controls = animate(rate, hot ? 2.4 : 1, {
      duration: 0.5,
      ease: EXPO,
    });
    return () => controls.stop();
  }, [hot, rate]);

  return clock;
}

/** A single mote riding an orbit, as a round dash travelling a path. Rendered
    once per depth layer against a far/near clip, so the same dot passes behind
    the glass and back out in front of it without ever being two dots. */
function Mote({
  clock,
  d,
  spin,
  reverse,
  hex,
  width,
  opacity,
  clip,
}: {
  clock: MotionValue<number>;
  d: string;
  spin: number;
  reverse: boolean;
  hex: string;
  width: number;
  opacity: number;
  clip: string;
}) {
  const offset = useTransform(clock, (t) => {
    const p = (t / spin) % 1;
    return reverse ? p : 1 - p;
  });

  return (
    <motion.path
      d={d}
      pathLength={1}
      fill="none"
      stroke={hex}
      strokeWidth={width}
      strokeOpacity={opacity}
      strokeLinecap="round"
      // A dash of very nearly nothing: the round cap is what draws the mote, so
      // it stays a dot instead of stretching into a capsule the way a dash long
      // enough to see would.
      strokeDasharray="0.0006 0.9994"
      clipPath={clip}
      style={{ strokeDashoffset: offset, transition: "stroke-opacity 500ms" }}
    />
  );
}

const AICore = ({
  innerRef,
  active,
  phase,
}: {
  innerRef: React.RefObject<HTMLDivElement>;
  active: "tech" | "gbs" | null;
  /** Which orbit the hovered or open service sits on. */
  phase: Service["phase"] | null;
}) => {
  const reduce = useReducedMotion();
  const [hot, setHot] = useState(false);
  const clock = useOrbitClock(hot, reduce);

  const accent = active ? HUE[active] : null;
  /** Every orbit that carries a mote, by the only two things a clip needs. */
  const orbits = [
    ...PHASE_RINGS.map((r) => ({ id: r.phase, cy: r.cy })),
    ...PARTICLES.map((p) => ({ id: p.id, cy: p.cy })),
  ];

  return (
    /* This box is measured. `buildLinks` reads it to place sixteen connectors
       on a circle at its own half-width, so it never moves and never scales —
       the float and the hover lift live on wrappers inside it.

       The centre column is `auto` in the grid, so every pixel here is taken
       from the two card columns. That's affordable at xl (they keep ~408px)
       but not at lg, where a 1024px viewport leaves them ~254px and the
       two-line practice names start truncating — so the desktop size lands on
       xl and lg holds at the tablet size. */
    <div
      ref={innerRef}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      className="relative aspect-square w-[260px] shrink-0 sm:w-[320px] lg:w-[340px] xl:w-[440px]"
    >
      {/* Key light, top left; a colder fill from the lower right. */}
      <div
        aria-hidden
        className="absolute -inset-[38%] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(68,158,216,0.16), rgba(245,159,19,0.07) 58%, transparent 78%)",
        }}
      />

      {/* The horizon every connection lands on. It stays a circle because the
          fan is aimed at a circle — but it's down to a hairline now, so the
          pyramid reads as floating on the page rather than sitting on a disc. */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full border transition-colors duration-500"
        style={{
          borderColor: accent
            ? `rgba(${accent.rgb},0.5)`
            : "rgba(46,52,54,0.1)",
        }}
      />

      <motion.svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        animate={reduce ? {} : { rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="rgba(46,52,54,0.14)"
          strokeWidth="1"
          strokeDasharray="1.5 9"
        />
      </motion.svg>

      {/* Selection pulse — the core answers the click, but never changes shape. */}
      <AnimatePresence>
        {active && !reduce && (
          <motion.span
            key={active}
            aria-hidden
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: HUE[active].hex }}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Ground: contact shadow, ambient bounce and a caustic pool. It does not
          float with the pyramid — it answers it, tightening and darkening as
          the pyramid settles back down, which is what makes the gap read. */}
      <motion.svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        style={{ originX: 0.5, originY: 0.8 }}
        animate={
          reduce ? {} : { scale: [0.94, 1.06, 0.94], opacity: [0.72, 1, 0.72] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <radialGradient id="core-shadow">
            <stop offset="0%" stopColor="#2E3436" stopOpacity="0.3" />
            <stop offset="55%" stopColor="#2E3436" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2E3436" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="core-caustic">
            <stop offset="0%" stopColor="#56A7FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#56A7FF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="102" cy="162" rx="56" ry="17" fill="url(#core-shadow)" />
        {/* Light that made it through the glass, pooled under the base. Breathes
            on scale rather than on `rx`: an animated geometry attribute is
            undefined on the frame before Framer takes it over, and the browser
            drops the shape for it. */}
        <motion.ellipse
          cx="97"
          cy="158"
          rx="26"
          ry="8"
          fill="url(#core-caustic)"
          style={{ originX: "97px", originY: "158px" }}
          animate={
            reduce ? {} : { scaleX: [1, 1.28, 1], opacity: [0.75, 1, 0.75] }
          }
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* ---- Everything below floats together. -------------------------------
          Outer wrapper answers the pointer, inner wrapper does the idle drift,
          so the hover lift never fights the float's own keyframes. */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: hot ? -6 : 0, scale: hot ? 1.03 : 1 }}
        transition={{ duration: 0.5, ease: EXPO }}
      >
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ transformPerspective: 1000 }}
          animate={reduce ? {} : { y: [-8, 8, -8], rotateY: [-6, 6, -6] }}
          transition={{
            // Different periods, so the drift never visibly repeats.
            y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
            rotateY: { duration: 13, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {/* ---- Behind the glass. ---- */}
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              {/* One clip pair per orbit, splitting it at its own horizon: an
                  orbit's far half is its upper half under this camera. Both
                  halves draw the same mote at the same place, so it crosses the
                  seam without a join. */}
              {orbits.map((o) => (
                <Fragment key={o.id}>
                  <clipPath id={`core-far-${o.id}`}>
                    <rect x="0" y="0" width="200" height={o.cy} />
                  </clipPath>
                  <clipPath id={`core-near-${o.id}`}>
                    <rect x="0" y={o.cy} width="200" height={200 - o.cy} />
                  </clipPath>
                </Fragment>
              ))}
              <linearGradient
                id="core-glass-back"
                gradientUnits="userSpaceOnUse"
                x1="46"
                y1="34"
                x2="150"
                y2="152"
              >
                <stop offset="0%" stopColor="#56A7FF" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#56A7FF" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* The pyramid's own far geometry. Painted here so the glass pane
                above frosts it — the back face and the hidden base edge go soft
                exactly the way they would through 40mm of glass. */}
            <path d={PYRAMID.base} fill="url(#core-glass-back)" />
            <path d={PYRAMID.faceBack} fill="url(#core-glass-back)" />
            {/* The base's hidden back edge. Carrying it at all is the single
                strongest cue that the pyramid is transparent, and it has to
                survive the frosting above — hence heavier than it would be if
                it were drawn in the open. */}
            <path
              d={PYRAMID.edgeBase}
              fill="none"
              stroke="#449ED8"
              strokeOpacity="0.5"
              strokeWidth="1.2"
            />

            {PHASE_RINGS.map((ring) => {
              const lit = phase === ring.phase;
              return (
                <g key={ring.phase}>
                  <path
                    d={farArc(ring.rx, ring.ry, ring.cy)}
                    fill="none"
                    stroke={ring.hex}
                    strokeOpacity={lit ? 0.6 : 0.22}
                    strokeWidth={lit ? 1.5 : 0.9}
                    style={{
                      transition: "stroke-opacity 500ms, stroke-width 500ms",
                    }}
                  />
                  <Mote
                    clock={clock}
                    d={orbitPath(ring.rx, ring.ry, ring.cy)}
                    spin={ring.spin}
                    reverse={ring.reverse}
                    hex={ring.hex}
                    width={lit ? 4.4 : 3}
                    opacity={lit ? 0.85 : 0.5}
                    clip={`url(#core-far-${ring.phase})`}
                  />
                </g>
              );
            })}

            {PARTICLES.map((p) => (
              <Mote
                key={p.id}
                clock={clock}
                d={orbitPath(p.rx, p.ry, p.cy)}
                spin={p.spin}
                reverse={p.reverse}
                hex="#449ED8"
                width={p.w}
                opacity={hot ? 0.4 : 0.2}
                clip={`url(#core-far-${p.id})`}
              />
            ))}
          </svg>

          {/* ---- The glass itself. ----
              A clip-path'd backdrop-filter is the only way to get real frosting
              out of an SVG silhouette, and it's what makes the far orbits blur
              as they pass behind. The second pane doubles up on the narrow
              right face: we look through more glass there, so it frosts harder.
              That difference is the thickness. */}
          <div
            aria-hidden
            className="absolute inset-0 transition-[backdrop-filter] duration-500"
            style={{
              clipPath: PYRAMID.clip,
              // Enough to soften what's behind, not enough to erase it: past
              // ~4px the back edge and the far orbits stop reading at all, and
              // the pyramid goes opaque.
              backdropFilter: `blur(${hot ? 5 : 3.5}px) saturate(1.3)`,
              WebkitBackdropFilter: `blur(${hot ? 5 : 3.5}px) saturate(1.3)`,
              background: "rgba(255,255,255,0.18)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              clipPath: PYRAMID.clipRight,
              backdropFilter: "blur(9px)",
              WebkitBackdropFilter: "blur(9px)",
              background: "rgba(86,167,255,0.03)",
            }}
          />

          {/* ---- The cube, inside the glass. ----
              Suspended, not mounted: it carries its own drift on periods that
              share no factor with the scene's 9s and 13s, so it never settles
              into lockstep with the pyramid and reads as floating *within* it
              rather than moulded into it. The amplitude is deliberately tiny —
              the cube clears the glass by ~7 units, and 3.5px at the 440px core
              is ~1.6 units, so it can never appear to touch a face. The mark
              rides in the same wrapper or it would slide off the cube it's
              supposed to be suspended inside. */}
          <motion.div
            className="absolute inset-0"
            animate={
              reduce ? {} : { y: [-3.5, 3.5, -3.5], x: [-1.5, 1.5, -1.5] }
            }
            transition={{
              y: { duration: 6.5, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 11, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <svg
              aria-hidden
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full"
            >
              <defs>
                <radialGradient id="core-cube-glow">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                  <stop offset="45%" stopColor="#B9DDF6" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#56A7FF" stopOpacity="0" />
                </radialGradient>
              </defs>
              <motion.ellipse
                cx="100"
                cy="102.8"
                rx="42"
                ry="40"
                fill="url(#core-cube-glow)"
                animate={
                  reduce
                    ? {}
                    : {
                        opacity: hot ? 1 : [0.72, 0.9, 0.72],
                        scale: hot ? 1.08 : 1,
                      }
                }
                style={{ originX: "100px", originY: "102.8px" }}
                transition={{
                  opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 0.5, ease: EXPO },
                }}
              />
              {/* Lit from the same top-left key as the glass. The three faces are
                held a long way apart in value on purpose, and each is outlined:
                at 35 units across, that separation and those edges are the only
                things telling the eye this is a solid and not a white shard.
                Stroking the faces rather than a hull draws every visible edge
                without anyone having to work out which ones they are. */}
              <g strokeWidth="0.5" strokeLinejoin="round">
                <path
                  d={CUBE.top}
                  fill="#FFFFFF"
                  fillOpacity="0.9"
                  stroke="#FFFFFF"
                />
                <path
                  d={CUBE.faceLeft}
                  fill="#DCEEFB"
                  fillOpacity="0.8"
                  stroke="#EAF5FD"
                />
                <path
                  d={CUBE.faceRight}
                  fill="#79B2DA"
                  fillOpacity="0.72"
                  stroke="#9FCBE7"
                />
              </g>
            </svg>

            {/* The mark sits between the cube and the pyramid's front faces, so
              the glass paints over it — which is what "embedded" is. Placed on
              the cube's projected centre rather than the box's: the cube rides
              low in the body, where the glass is wide enough to hold it. */}
            <FMark className="absolute left-1/2 top-[51.4%] h-[9.5%] w-auto -translate-x-1/2 -translate-y-1/2 text-steel/75" />
          </motion.div>

          {/* ---- In front of the glass. ---- */}
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              {/* One light field, sampled by every face — a key at the top left
                  resolving into a blue body and a warm rim at the lower right.
                  Shared, so the faces can't disagree about where the light is. */}
              <linearGradient
                id="core-key"
                gradientUnits="userSpaceOnUse"
                x1="46"
                y1="34"
                x2="150"
                y2="152"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                <stop offset="38%" stopColor="#FFFFFF" stopOpacity="0.12" />
                <stop offset="74%" stopColor="#56A7FF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#F5B347" stopOpacity="0.13" />
              </linearGradient>
              <linearGradient
                id="core-streak"
                gradientUnits="objectBoundingBox"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
              <clipPath id="core-pyr-hull">
                <path d={PYRAMID.hull} />
              </clipPath>
              <clipPath id="core-pyr-left">
                <path d={PYRAMID.faceLeft} />
              </clipPath>
              <clipPath id="core-pyr-right">
                <path d={PYRAMID.faceRight} />
              </clipPath>
            </defs>

            <path d={PYRAMID.faceLeft} fill="url(#core-key)" />
            <path d={PYRAMID.faceRight} fill="url(#core-key)" />
            {/* Extra density on the narrow face — same glass, more of it. */}
            <path d={PYRAMID.faceRight} fill="#56A7FF" fillOpacity="0.05" />

            {/* Streaks crossing the two front faces, each clipped to its own.
                They travel at different rates and rest for different beats, so
                the two faces never flash together — a single sweep across the
                whole silhouette would read as a highlight painted on top of the
                pyramid, where two independent ones read as light moving through
                two panes that happen to meet. The right face is narrower and we
                look through more glass there, so its streak is thinner, dimmer
                and slower. */}
            {!reduce && (
              <>
                <g clipPath="url(#core-pyr-left)">
                  <g transform="rotate(18 100 100)">
                    <motion.rect
                      y="-10"
                      width="11"
                      height="220"
                      fill="url(#core-streak)"
                      opacity={0.3}
                      animate={{ x: [22, 132] }}
                      transition={{
                        duration: 7,
                        repeat: Infinity,
                        repeatDelay: 4,
                        ease: "easeInOut",
                      }}
                    />
                  </g>
                </g>
                <g clipPath="url(#core-pyr-right)">
                  <g transform="rotate(18 100 100)">
                    <motion.rect
                      y="-10"
                      width="7"
                      height="220"
                      fill="url(#core-streak)"
                      opacity={0.22}
                      animate={{ x: [78, 158] }}
                      transition={{
                        duration: 9,
                        repeat: Infinity,
                        repeatDelay: 6.5,
                        delay: 2.5,
                        ease: "easeInOut",
                      }}
                    />
                  </g>
                </g>
              </>
            )}

            {/* Polished edges. On white paper a white rim is invisible, so the
                silhouette carries the darker refracted line real glass shows at
                a grazing angle, and the white goes *inside* it as a bevel —
                stroke centred on the hull, clipped to the hull, so only its
                inner half survives. */}
            <g clipPath="url(#core-pyr-hull)">
              <path
                d={PYRAMID.hull}
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity={hot ? 0.85 : 0.55}
                strokeWidth="3"
                strokeLinejoin="round"
                style={{ transition: "stroke-opacity 500ms" }}
              />
            </g>
            <path
              d={PYRAMID.hull}
              fill="none"
              stroke="#376079"
              strokeOpacity="0.34"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />
            {/* The near edge, where the two front faces meet: a soft refracted
                bloom with a fine white core riding it. It catches, but it stays
                glass — any heavier and it reads as a seam, and the pyramid looks
                folded out of paper. */}
            <path
              d={PYRAMID.edgeFront}
              fill="none"
              stroke="#56A7FF"
              strokeOpacity="0.22"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d={PYRAMID.edgeFront}
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity={hot ? 0.7 : 0.45}
              strokeWidth="0.9"
              strokeLinecap="round"
              style={{ transition: "stroke-opacity 500ms" }}
            />

            {/* Refracted specks — where the edges catch. */}
            {!reduce &&
              [
                { cx: 100, cy: 47, r: 1.5, d: 0 },
                { cx: 112.4, cy: 141, r: 1.1, d: 1.4 },
                { cx: 134.4, cy: 111.6, r: 0.9, d: 2.6 },
              ].map((s) => (
                <motion.circle
                  key={`${s.cx}-${s.cy}`}
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  fill="#FFFFFF"
                  animate={{ opacity: [0.25, 0.9, 0.25] }}
                  transition={{
                    duration: 3.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: s.d,
                  }}
                />
              ))}

            {PHASE_RINGS.map((ring) => {
              const lit = phase === ring.phase;
              return (
                <g key={ring.phase}>
                  <path
                    d={nearArc(ring.rx, ring.ry, ring.cy)}
                    fill="none"
                    stroke={ring.hex}
                    strokeOpacity={lit ? 0.95 : 0.42}
                    strokeWidth={lit ? 1.6 : 1}
                    style={{
                      transition: "stroke-opacity 500ms, stroke-width 500ms",
                    }}
                  />
                  <Mote
                    clock={clock}
                    d={orbitPath(ring.rx, ring.ry, ring.cy)}
                    spin={ring.spin}
                    reverse={ring.reverse}
                    hex={ring.hex}
                    width={lit ? 4.4 : 3}
                    opacity={lit ? 1 : 0.8}
                    clip={`url(#core-near-${ring.phase})`}
                  />
                </g>
              );
            })}

            {PARTICLES.map((p) => (
              <Mote
                key={p.id}
                clock={clock}
                d={orbitPath(p.rx, p.ry, p.cy)}
                spin={p.spin}
                reverse={p.reverse}
                hex="#449ED8"
                width={p.w}
                opacity={hot ? 0.45 : 0.2}
                clip={`url(#core-near-${p.id})`}
              />
            ))}
          </svg>

          {/* The chain, named — each label pinned to the widest point of the
              orbit it belongs to, which under this camera is `(100 ± rx, cy)`.
              The right extremity is the only one that works for all three: the
              glass never reaches it, the fan lands outside the core, and the
              three stack diagonally because the orbits narrow as they rise.

              Inside the float, so a name rides its ring instead of sliding
              across it. */}
          {PHASE_RINGS.map((ring) => {
            const lit = phase === ring.phase;
            return (
              <span
                key={ring.phase}
                className="pointer-events-none absolute flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap"
                style={{
                  left: `${((100 + ring.rx) / 200) * 100}%`,
                  top: `${(ring.cy / 200) * 100}%`,
                }}
              >
                <span
                  aria-hidden
                  className="h-[3px] w-[3px] flex-none rounded-full transition-opacity duration-500"
                  style={{ background: ring.hex, opacity: lit ? 1 : 0.4 }}
                />
                <span
                  className="font-mono text-[7.5px] uppercase leading-none tracking-[0.16em] transition-colors duration-500 sm:text-[8.5px] sm:tracking-[0.18em] xl:text-[10px]"
                  style={{ color: lit ? ring.hex : "#868C8E" }}
                >
                  {ring.phase}
                </span>
              </span>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
};

/* --------------------------------------------------------------------------
   Capability card
   -------------------------------------------------------------------------- */

function CapabilityCard({
  service,
  state,
  onHover,
  onSelect,
  register,
}: {
  service: Service;
  state: "idle" | "active" | "muted";
  onHover: (n: string | null) => void;
  onSelect: (n: string) => void;
  register: (n: string, el: HTMLElement | null) => void;
}) {
  const Icon = ICONS[service.icon];
  const hue = HUE[service.group];
  const right = service.group === "gbs";

  /* The drawer is a sibling of the card, not a child of it. Two reasons, and
     both are load-bearing:

     - The button in it has to be a real button, and a button cannot nest inside
       another button.
     - Hover has to survive the trip. The group is this wrapper, so moving the
       pointer off the card and onto the drawer never leaves the hovered region —
       the drawer stays open long enough to reach what's in it. */
  return (
    <motion.div
      onMouseEnter={() => onHover(service.n)}
      onMouseLeave={() => onHover(null)}
      animate={{ opacity: state === "muted" ? 0.42 : 1 }}
      transition={{ duration: 0.3, ease: EXPO }}
      // A hovered card's drawer hangs over its neighbour, so it has to out-rank one.
      className="group relative hover:z-30 focus-within:z-30"
    >
      <button
        ref={(el) => register(service.n, el)}
        type="button"
        onClick={() => onSelect(service.n)}
        onFocus={() => onHover(service.n)}
        onBlur={() => onHover(null)}
        aria-label={`Open ${service.title}`}
        className={cn(
          "relative flex w-full items-center gap-3.5 rounded-[14px] border px-4 py-3.5 text-left",
          "bg-white/70 backdrop-blur-md",
          "transition-[transform,box-shadow,border-color,background-color] duration-400 ease-expo will-change-transform",
          "shadow-[0_1px_2px_rgba(46,52,54,0.04)]",
          state === "active"
            ? "border-transparent bg-white shadow-[0_18px_40px_-18px_rgba(46,52,54,0.28)]"
            : "border-line/70 group-hover:bg-white group-hover:shadow-[0_14px_34px_-16px_rgba(46,52,54,0.26)]",
          // right
          //   ? "group-hover:-translate-x-0.5"
          //   : "group-hover:translate-x-0.5",
          // "group-hover:-translate-y-0.5",
        )}
        style={
          state === "active"
            ? {
                boxShadow: `0 0 0 1px rgba(${hue.rgb},0.55), 0 18px 40px -18px rgba(46,52,54,0.28)`,
              }
            : undefined
        }
      >
        {/* Number. */}
        {/* <span
        className={cn(
          "font-mono text-[10px] tabular-nums tracking-[0.12em] transition-colors duration-300",
          state === "active" ? hue.text : "text-ink-400",
        )}
      >
        {service.n}
      </span> */}

        {/* Icon well. */}
        <span
          className={cn(
            "flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border transition-all duration-400 ease-expo",
            "group-hover:rotate-[-6deg] group-hover:scale-105",
            state === "active"
              ? "border-transparent"
              : "border-line/80 bg-paper",
          )}
          style={
            state === "active"
              ? {
                  background: `rgba(${hue.rgb},0.12)`,
                  boxShadow: `inset 0 0 0 1px rgba(${hue.rgb},0.28)`,
                }
              : undefined
          }
        >
          <Icon
            size={17}
            strokeWidth={1.6}
            className={cn(
              "transition-colors duration-300",
              state === "active"
                ? hue.text
                : "text-ink-500 group-hover:text-ink",
            )}
          />
        </span>

        <span className="min-w-0 flex-1">
          {/* Two lines, not an ellipsis: the practice names are long, and a card
            that says "Artificial Intelligence &…" tells you nothing. */}
          <span className="block text-sm font-medium leading-snug tracking-[-0.01em] text-ink line-clamp-2">
            {short(service)}
          </span>
          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-ink-400">
            {service.phase} · {service.subs.length} services
          </span>
        </span>

        <ChevronRight
          size={15}
          className={cn(
            "flex-none transition-all duration-400 ease-expo",
            state === "active" ? hue.text : "text-ink-400 group-hover:text-ink",
            "group-hover:translate-x-0.5",
          )}
        />
      </button>

      {/* Hover drawer: one line of the practice's own summary, and the way in.

          It hangs off the card rather than growing it. Every card's box is
          measured to draw the connection fan, so a card that changed height on
          hover would drag its neighbours — and the lines attached to them — with
          it. As an overlay it costs the layout nothing.

          `grid-rows-[0fr] -> [1fr]` is the height transition: `auto` cannot be
          animated, a fraction can. It takes pointer events, so the button inside
          is reachable; while it is shut, `invisible` keeps it out of the way of
          the card underneath and out of the tab order. */}
      <div
        className={cn(
          // inset-x-0 and top at the card's own bottom border: the panel is the
          // same box as the card, one pixel lower, so the two read as one card
          // that grew a floor rather than two stacked rectangles.
          "invisible absolute inset-x-0 -left-[1px] -right-[1px] top-[calc(100%-12px)] grid grid-rows-[0fr] overflow-hidden rounded-b-[14px] border border-t-0 bg-white opacity-0",
          "shadow-[0_18px_38px_-18px_rgba(46,52,54,0.3)]",
          "transition-[grid-template-rows,opacity,visibility] duration-400 ease-expo",
          "group-hover:visible group-hover:grid-rows-[1fr] group-hover:opacity-100",
          "group-focus-within:visible group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100",
        )}
        // The panel carries the practice's own colour, as the card does when it
        // is active — azure for engineering, amber for GBS.
        style={{ borderColor: `rgba(${hue.rgb},0.45)` }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-3.5 pt-3">
            <p className="text-[12px] leading-snug text-ink-500 line-clamp-1">
              {service.summary}
            </p>

            <button
              type="button"
              onClick={() => onSelect(service.n)}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] transition-transform duration-300 ease-expo hover:translate-x-0.5"
              style={{
                background: `rgba(${hue.rgb},0.1)`,
                boxShadow: `inset 0 0 0 1px rgba(${hue.rgb},0.3)`,
              }}
            >
              <span className={hue.text}>Explore practice</span>
              <ArrowRight size={11} className={hue.text} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------------
   Side drawer
   -------------------------------------------------------------------------- */

function Drawer({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  const Icon = ICONS[service.icon];
  const hue = HUE[service.group];
  const meta = META[service.n];
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 639px)").matches);

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [onClose]);

  const hidden = mobile ? { y: "100%" } : { x: "100%" };
  const shown = mobile ? { y: 0 } : { x: 0 };

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.18 + i * 0.05, duration: 0.45, ease: EXPO },
  });

  return (
    <motion.div
      className="fixed inset-0 z-[80]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Kept light: the core stays readable behind it. */}
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-ink/15 backdrop-blur-[2px]"
      />

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={service.title}
        initial={hidden}
        animate={shown}
        exit={hidden}
        transition={SPRING}
        className={cn(
          "absolute right-0 flex flex-col overflow-hidden bg-white/85 backdrop-blur-2xl",
          "shadow-[-30px_0_80px_-30px_rgba(46,52,54,0.35)]",
          // Mobile: near-full-screen bottom sheet.
          "inset-x-0 bottom-0 top-[6vh] rounded-t-[24px]",
          // Tablet and up: right-edge panel.
          "sm:inset-y-0 sm:left-auto sm:top-0 sm:w-[420px] sm:rounded-l-[24px] sm:rounded-tr-none",
          "lg:w-[520px] xl:w-[560px]",
        )}
      >
        {/* Phase seam. */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: hue.hex }}
        />

        <header className="flex items-start justify-between gap-5 border-b border-line/70 px-6 pb-6 pt-7 lg:px-8">
          <div className="flex min-w-0 items-start gap-4">
            <span
              className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px]"
              style={{
                background: `rgba(${hue.rgb},0.12)`,
                boxShadow: `inset 0 0 0 1px rgba(${hue.rgb},0.25)`,
              }}
            >
              <Icon size={22} strokeWidth={1.6} className={hue.text} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] tracking-[0.16em] text-ink-400">
                  {service.n}
                </span>
                <span aria-hidden className="h-px w-3 bg-line-strong" />
                <span
                  className={cn(
                    "font-mono text-[9.5px] uppercase tracking-[0.16em]",
                    hue.text,
                  )}
                >
                  {GROUP_LABEL[service.group]}
                </span>
              </div>
              <h3 className="mt-2 text-[20px] font-medium leading-[1.2] tracking-[-0.025em] text-ink lg:text-[23px]">
                {service.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-line text-ink-500 transition-colors duration-300 hover:bg-ink hover:text-paper"
          >
            <X size={15} />
          </button>
        </header>

        {/* Lenis is stopped while this is open, and a stopped Lenis swallows
            wheel events — this hands them back to the browser so the panel
            itself still scrolls. */}
        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-7 lg:px-8"
        >
          <motion.div {...stagger(0)} className="space-y-3.5">
            <p className="text-[14.5px] leading-[1.75] text-ink-500">
              {service.summary}
            </p>
            <p className="text-[14.5px] leading-[1.75] text-ink-500">
              The practice runs on four tracks —{" "}
              {service.subs.map((s, i) => (
                <span key={s.title}>
                  <span className="font-medium text-ink">{s.title}</span>
                  {i < service.subs.length - 2
                    ? ", "
                    : i === service.subs.length - 2
                      ? ", and "
                      : ""}
                </span>
              ))}
              . Each can be engaged on its own or as one chain.
            </p>
            <p className="text-[14.5px] leading-[1.75] text-ink-500">
              It sits in the{" "}
              <span className="font-medium" style={{ color: hue.hex }}>
                {service.phase.toLowerCase()}
              </span>{" "}
              phase of delivery, wired into the same core as the other{" "}
              {SERVICES.length - 1} practices — so a build hands off to
              automation and operations without a seam.
            </p>
          </motion.div>

          {/* Sub-capabilities. */}
          <motion.h4
            {...stagger(1)}
            className="mt-9 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400"
          >
            Key sub-capabilities
          </motion.h4>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 ">
            {service.subs.map((sub, i) => (
              <motion.a
                key={sub.title}
                href="#contact"
                onClick={onClose}
                {...stagger(2 + i)}
                className={cn(
                  "group flex items-start gap-3.5 rounded-[14px] border border-line/70 bg-white/70 p-4",
                  "transition-[transform,box-shadow,border-color] duration-400 ease-expo",
                  "hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_16px_36px_-18px_rgba(46,52,54,0.3)]",
                )}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-[9px] font-mono text-[9.5px]"
                  style={{ background: `rgba(${hue.rgb},0.1)`, color: hue.hex }}
                >
                  {service.n}.{i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium leading-snug text-ink">
                    {sub.title}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-[1.6] text-ink-400">
                    {sub.desc}
                  </span>
                </span>
                <ArrowUpRight
                  size={14}
                  className="mt-1 flex-none text-ink-400 transition-all duration-400 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                />
              </motion.a>
            ))}
          </div>

          {/* Industries. */}
          <motion.h4
            {...stagger(6)}
            className="mt-9 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400"
          >
            Industries
          </motion.h4>
          <motion.div {...stagger(7)} className="mt-3.5 flex flex-wrap gap-2">
            {meta?.industries.map((industry) => (
              <span
                key={industry}
                className={cn(
                  "rounded-full border border-line/70 px-3 py-1.5 text-[12px] text-ink-500",
                  hue.chip,
                )}
              >
                {industry}
              </span>
            ))}
          </motion.div>

          {/* Stack. */}
          <motion.h4
            {...stagger(8)}
            className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400"
          >
            Technology stack
          </motion.h4>
          <motion.div {...stagger(9)} className="mt-3.5 flex flex-wrap gap-1.5">
            {meta?.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-line/70 bg-paper px-2.5 py-1 font-mono text-[10.5px] tracking-[0.04em] text-ink-500"
              >
                {tech}
              </span>
            ))}
          </motion.div>

          {/* Case study preview. */}
          <motion.h4
            {...stagger(10)}
            className="mt-9 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400"
          >
            Case studies
          </motion.h4>
          <motion.a
            {...stagger(11)}
            href="#work"
            onClick={onClose}
            className="group mt-3.5 flex items-center gap-4 overflow-hidden rounded-[14px] border border-line/70 bg-white/70 p-4 transition-[transform,box-shadow] duration-400 ease-expo hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-18px_rgba(46,52,54,0.3)]"
          >
            <span
              className="flex h-12 w-12 flex-none items-center justify-center rounded-[10px]"
              style={{
                background: `linear-gradient(135deg, rgba(${hue.rgb},0.18), rgba(${hue.rgb},0.04))`,
              }}
            >
              <Icon size={18} strokeWidth={1.6} className={hue.text} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium text-ink">
                Selected work in {short(service)}
              </span>
              <span className="mt-0.5 block text-[12.5px] text-ink-400">
                Delivery stories from the{" "}
                {GROUP_LABEL[service.group].toLowerCase()} portfolio.
              </span>
            </span>
            <ArrowUpRight
              size={15}
              className="flex-none text-ink-400 transition-all duration-400 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
            />
          </motion.a>

          {/* CTAs. */}
          <motion.div
            {...stagger(12)}
            className="mt-9 space-y-2.5 border-t border-line/70 pt-7"
          >
            <a
              href="#contact"
              onClick={onClose}
              className="group relative flex items-center justify-between overflow-hidden rounded-[12px] bg-ink px-5 py-3.5 text-[14px] font-medium text-paper"
            >
              <span
                aria-hidden
                className="absolute inset-0 translate-x-[-101%] transition-transform duration-600 ease-expo group-hover:translate-x-0"
                style={{
                  background: `linear-gradient(102deg, ${hue.hex}, #376079 70%, #2E3436)`,
                }}
              />
              <span className="relative">Explore solutions</span>
              <ArrowRight
                size={15}
                className="relative transition-transform duration-400 ease-expo group-hover:translate-x-1"
              />
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="#work"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-[12px] border border-line-strong px-4 py-3 text-[13px] font-medium text-ink transition-colors duration-300 hover:border-ink hover:bg-paper"
              >
                View case studies
              </a>
              <a
                href="#contact"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-[12px] border border-line-strong px-4 py-3 text-[13px] font-medium text-ink transition-colors duration-300 hover:border-ink hover:bg-paper"
              >
                Schedule a call
              </a>
            </div>
          </motion.div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/* --------------------------------------------------------------------------
   Section
   -------------------------------------------------------------------------- */

export default function CapabilitiesOS() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef(new Map<string, HTMLElement>());

  const [geom, setGeom] = useState<Geometry | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const open = SERVICES.find((s) => s.n === openId) ?? null;
  // A click keeps the line lit while the drawer is up; hover lights it too.
  const activeId = hovered ?? openId;
  const activeService = SERVICES.find((s) => s.n === activeId) ?? null;
  const activeGroup = activeService?.group ?? null;
  const activePhase = activeService?.phase ?? null;

  const register = useCallback((n: string, el: HTMLElement | null) => {
    if (el) cardsRef.current.set(n, el);
    else cardsRef.current.delete(n);
  }, []);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const core = coreRef.current;
    if (!wrap || !core) return;

    // The fan only exists in the three-column layout.
    if (window.innerWidth < 1024) {
      setGeom(null);
      return;
    }

    setGeom(
      buildLinks(
        cardsRef.current,
        wrap.getBoundingClientRect(),
        core.getBoundingClientRect(),
      ),
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", measure);
    // Webfonts settle after paint and nudge every card's height.
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const cardState = (n: string): "idle" | "active" | "muted" =>
    activeId === n ? "active" : activeId ? "muted" : "idle";

  /* Two-up on a phone and tablet, a single vertical rail from lg — which is
     also the only breakpoint where the connection fan exists to attach to. */
  const column = (services: Service[]) => (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:flex lg:flex-col lg:justify-center">
      {services.map((service) => (
        <CapabilityCard
          key={service.n}
          service={service}
          state={cardState(service.n)}
          onHover={setHovered}
          onSelect={setOpenId}
          register={register}
        />
      ))}
    </div>
  );

  return (
    <section
      id="capabilities"
      className="relative overflow-hidden border-t border-line bg-white"
    >
      {/* Blueprint paper. */}
      <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />
      {/* Very light washes, one per half of the network. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, rgba(68,158,216,0.06), transparent 70%), radial-gradient(40% 40% at 92% 78%, rgba(245,159,19,0.05), transparent 70%), radial-gradient(40% 40% at 6% 20%, rgba(55,96,121,0.045), transparent 70%)",
        }}
      />
      {/* Mask the grid out at the edges so the whitespace reads as open. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_50%,transparent,white_95%)]"
      />

      <Container wide className="relative z-10 py-24 lg:py-32">
        {/* Header. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Capabilities
              </span>
            </div>
            <h2 className="mt-6 text-h1 text-ink">
              <KineticWords text="Every practice," />
              <br />
              <KineticWords
                text="one delivery chain."
                delay={0.12}
                wordClassName={() => "text-sweep"}
              />
            </h2>
          </div>

          <Wipe delay={0.2}>
            <p className="text-[16px] leading-[1.75] text-ink-500 text-justify">
              Engineering and Global Business Services, mapped to a single
              delivery chain. Each practice sits where it creates value across{" "}
              <span className="font-medium text-azure">build</span>,{" "}
              <span className="font-medium text-amber-ink">automate</span>, and{" "}
              <span className="font-medium text-steel">operate</span>, not in a
              separate silo. Open any one to explore what's inside.
            </p>
          </Wipe>
        </div>

        {/* Network. */}
        <div
          ref={wrapRef}
          className="relative mt-14 lg:mt-20"
          onMouseLeave={() => setHovered(null)}
        >
          {geom && <ConnectionNetwork geom={geom} activeId={activeId} />}

          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8 xl:gap-14">
            {/* Core first on small screens — the visualisation is the point, so
                it leads rather than being buried under sixteen cards. */}
            <div className="order-first flex justify-center lg:order-none lg:col-start-2">
              <AICore
                innerRef={coreRef}
                active={activeGroup}
                phase={activePhase}
              />
            </div>

            <div className="lg:col-start-1 lg:row-start-1">
              <p className="mb-4 border-b border-line pb-3 font-mono text-sm uppercase tracking-[0.2em] text-azure-ink lg:border-0 lg:pb-0">
                Technology &amp; Engineering
              </p>
              {column(TECH)}
            </div>

            <div className="lg:col-start-3 lg:row-start-1 mb-auto">
              <p className="mb-4 border-b border-line pb-3 font-mono text-sm uppercase tracking-[0.2em] text-amber lg:border-0 lg:pb-0 lg:text-right">
                Global Business Services
              </p>
              {column(GBS)}

              {/* The GBS column is four cards shorter than the technology one,
                  which leaves a hole under it at lg. A colour logo dropped in
                  that hole just reads as a stray logo, so the mark is drained to
                  grey and embossed instead — a hairline, a line of type, and the
                  mark sunk into the paper behind them. It fills the space as a
                  stamp on the drawing rather than as a second brand impression.
                  Only where the hole exists: below lg the columns stack and there
                  is none. */}

              <div
                aria-hidden
                className="pointer-events-none relative mt-12 hidden select-none flex-col items-end lg:flex"
              >
                <div className="pointer-events-none absolute left-1/2 top-1/2 mt-28 hidden -translate-x-1/2 -translate-y-1/2 opacity-50 lg:block">
                  <GlobeMotif />
                </div>
                {/* <span className="h-px w-full bg-gradient-to-l from-line-strong to-transparent" />

                <Logo
                  className="mt-6 h-auto w-[74%] max-w-[300px] text-ink opacity-[0.09] grayscale"
                  onDark={false}
                />

                <span className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-400/70">
                  Build · Automate · Operate
                </span> */}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {open && <Drawer service={open} onClose={() => setOpenId(null)} />}
      </AnimatePresence>
    </section>
  );
}

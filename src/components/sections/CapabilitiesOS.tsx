"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

/**
 * The core's three rings are the delivery chain, outermost first: Build, then
 * Automate, then Operate. Each service declares which phase it lives in, so
 * hovering a card lights the ring it belongs to — the rings aren't decoration,
 * they're the legend.
 */
const PHASE_RINGS = [
  { phase: "Build", r: 88, hex: "#449ED8", spin: 34, reverse: false },
  { phase: "Automate", r: 68, hex: "#F59F13", spin: 26, reverse: true },
  { phase: "Operate", r: 48, hex: "#376079", spin: 20, reverse: false },
] as const;

/** A circle as a path, starting at nine o'clock and running clockwise — so
    `startOffset: 25%` puts a label upright at the top of the ring. */
const ringPath = (r: number) =>
  `M ${100 - r} 100 a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 ${-r * 2} 0`;

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

const AICore = ({
  innerRef,
  active,
  phase,
}: {
  innerRef: React.RefObject<HTMLDivElement>;
  active: "tech" | "gbs" | null;
  /** Which ring the hovered or open service sits on. */
  phase: Service["phase"] | null;
}) => {
  const reduce = useReducedMotion();
  const spin = (duration: number, reverse = false) =>
    reduce
      ? {}
      : {
          animate: { rotate: reverse ? -360 : 360 },
          transition: { duration, repeat: Infinity, ease: "linear" as const },
        };

  const accent = active ? HUE[active].hex : null;

  return (
    <div
      ref={innerRef}
      className="relative aspect-square w-[250px] shrink-0 sm:w-[300px] lg:w-[340px] xl:w-[380px]"
    >
      {/* Lighting. */}
      <div
        aria-hidden
        className="absolute -inset-[38%] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(68,158,216,0.16), rgba(245,159,19,0.07) 58%, transparent 78%)",
        }}
      />

      {/* Glass disc. */}
      <div
        className="absolute inset-0 rounded-full border border-white/70 bg-white/55 shadow-[0_40px_100px_-30px_rgba(46,52,54,0.35),0_2px_10px_rgba(46,52,54,0.05)] backdrop-blur-xl"
        style={{
          backgroundImage:
            "linear-gradient(150deg, rgba(255,255,255,0.9), rgba(255,255,255,0.35))",
        }}
      />

      {/* The ring every connection lands on. */}
      <div
        className="absolute inset-0 rounded-full border transition-colors duration-500"
        style={{
          borderColor: accent
            ? `rgba(${HUE[active!].rgb},0.55)`
            : "rgba(46,52,54,0.12)",
        }}
      />

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

      {/* The delivery chain, as three rings. */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          {PHASE_RINGS.map((ring) => (
            <path
              key={ring.phase}
              id={`core-ring-${ring.phase}`}
              d={ringPath(ring.r)}
              fill="none"
            />
          ))}
        </defs>

        {/* Outer tick ring — the only purely decorative one left. */}
        <motion.g style={{ originX: "100px", originY: "100px" }} {...spin(46)}>
          <circle
            cx="100"
            cy="100"
            r="96"
            stroke="rgba(46,52,54,0.16)"
            strokeWidth="1"
            strokeDasharray="2 8"
            fill="none"
          />
        </motion.g>

        {PHASE_RINGS.map((ring) => {
          const lit = phase === ring.phase;

          return (
            <g key={ring.phase}>
              <circle
                cx="100"
                cy="100"
                r={ring.r}
                fill="none"
                stroke={ring.hex}
                strokeOpacity={lit ? 0.9 : 0.3}
                strokeWidth={lit ? 1.8 : 1}
                style={{
                  transition: "stroke-opacity 400ms, stroke-width 400ms",
                }}
              />

              {/* A mote riding each ring, so the chain reads as running. */}
              <motion.g
                style={{ originX: "100px", originY: "100px" }}
                {...spin(ring.spin, ring.reverse)}
              >
                <circle
                  cx="100"
                  cy={100 - ring.r}
                  r={lit ? 2.8 : 1.8}
                  fill={ring.hex}
                  fillOpacity={lit ? 1 : 0.75}
                  style={{ transition: "r 400ms, fill-opacity 400ms" }}
                />
              </motion.g>

              {/* The ring's name, set on the ring itself. The white stroke is
                  painted under the fill, so the label knocks a clean gap in the
                  line rather than sitting on top of it. */}
              <text
                fontSize="6.4"
                letterSpacing="1.7"
                fontWeight={500}
                textAnchor="middle"
                fill={ring.hex}
                fillOpacity={lit ? 1 : 0.8}
                stroke="#FFFFFF"
                strokeWidth="3"
                paintOrder="stroke"
                strokeLinejoin="round"
                className="font-mono uppercase"
                style={{ transition: "fill-opacity 400ms" }}
              >
                <textPath href={`#core-ring-${ring.phase}`} startOffset="25%">
                  {ring.phase}
                </textPath>
              </text>
            </g>
          );
        })}
      </svg>

      {/* Nucleus. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-sweep shadow-[0_10px_30px_-8px_rgba(68,158,216,0.7)] lg:h-14 lg:w-14"
          animate={reduce ? {} : { scale: [1, 1.06, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <FMark className="h-6 w-auto text-white lg:h-7" />
        </motion.div>
        <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-400">
          Funavry Core
        </span>
        {/* <span className="text-[12.5px] font-medium tracking-[-0.01em] text-ink">
          16 practices, one chain
        </span> */}
      </div>
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

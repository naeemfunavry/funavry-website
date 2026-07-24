"use client";

import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
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
  Boxes,
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
// The globe that used to fill the hole under the GBS column. Its markup is
// still below, commented out — the import stays commented with it, or the
// whole 400-line component ships to every visitor for nothing.
// import Globe from "@/components/ui/Globe";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { SERVICES, type Service } from "@/lib/services";
import { useInView } from "@/lib/use-in-view";
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

   Three stacked 3D pillars — glossy cylinders, one per delivery phase, seen
   slightly from above: Operate the blue lid on top, Build the dark foundation
   at the base. Everything lives in one 200×200 viewBox, which the connection
   fan still measures against, so the sixteen lines land exactly as before.
   -------------------------------------------------------------------------- */

type Pillar = {
  phase: Service["phase"];
  icon: LucideIcon;
  /** Cylinder geometry in the 200×200 viewBox: vertical centre, body height,
      half-width, and the ellipse's vertical radius (the perspective squash). */
  cy: number;
  h: number;
  rx: number;
  ry: number;
  /** Body gradient across the cylinder: dark edge, lit centre — the shading
      that makes a flat rect read as round. */
  edge: string;
  mid: string;
  /** The top lid — lighter, because it faces the light. There is no base
      colour: the front lip keeps its curve but is painted in the body's own
      gradient, so the bottom rounds off without a tonal step. */
  lid: string;
  /** The bright amber pillar takes dark labels; the blue and navy take white. */
  darkLabel?: boolean;
  caption: [string, string];
};

/** The three delivery pillars, top to base — Operate, Automate, Build. Colours
    follow the stacked-pillars reference: a bright azure lid, an amber middle,
    and a dark navy foundation, all within the brand palette. */
const PILLARS: Pillar[] = [
  {
    phase: "Operate",
    icon: Users,
    cy: 40,
    h: 48,
    rx: 80,
    ry: 13,
    edge: "#2A6BA3",
    mid: "#4FA0D6",
    lid: "#86C4EE",
    caption: ["Managed services", "GCC · Excellence"],
  },
  {
    phase: "Automate",
    icon: BrainCircuit,
    cy: 100,
    h: 48,
    rx: 80,
    ry: 13,
    edge: "#BC7207",
    mid: "#F2A22C",
    lid: "#FBC163",
    darkLabel: true,
    caption: ["AI agents · Automation", "Process optimization"],
  },
  {
    phase: "Build",
    icon: Boxes,
    cy: 160,
    h: 48,
    rx: 80,
    ry: 13,
    edge: "#0F151D",
    mid: "#2C3A48",
    lid: "#3B4A58",
    caption: ["AI · Engineering · Data", "Cloud · Security"],
  },
];

/** The fuller copy a pillar reveals on hover — a one-line framing plus the
    practices that sit in that phase, drawn from the deck's delivery model. */
const PILLAR_DETAIL: Record<
  Service["phase"],
  { blurb: string; items: string[] }
> = {
  Build: {
    blurb: "Engineer the platform.",
    items: [
      "AI Solutions",
      "Digital Engineering",
      "Data & Business Intelligence",
      "Cloud & Cybersecurity",
    ],
  },
  Automate: {
    blurb: "Put AI to work.",
    items: [
      "AI Agents & Assistants",
      "Intelligent Automation",
      "Document Intelligence",
      "Process Optimization",
    ],
  },
  Operate: {
    blurb: "Run it at scale.",
    items: [
      "Managed Services",
      "GCC Enablement",
      "Workforce Solutions",
      "Operational Excellence",
    ],
  },
};

/** What the delivery chain is for — the deck's four business outcomes (slide
    10), shown as the card beneath the shorter GBS column. */
const OUTCOMES = [
  { title: "Efficiency", desc: "Lower cost, less effort" },
  { title: "Growth", desc: "Faster time-to-market" },
  { title: "Innovation", desc: "New digital capabilities" },
  { title: "Scale", desc: "Grows without friction" },
] as const;

/** How far in from a pillar's top and bottom edges the fan may land, as a
    fraction of the body height. Keeps the outermost lines clear of the lid and
    base curves, where the silhouette is still turning — a line arriving level
    with `topY` meets the lid ellipse at its widest and reads as touching air. */
const PILLAR_INSET = 0.22;

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
   the core reports its box, so a path always lands exactly where it should.

   Routing is orthogonal, not curved: out of the card horizontally, one turn
   down or up, one turn back in toward the core — with the corners rounded off.

   Lines land ON their phase's pillar, at the side face it actually presents:
   x is the pillar's own `rx`, y is spread down its body. They used to aim at a
   set of invented anchor ellipses whose geometry matched no pillar, and fade to
   nothing at the core's centre — a deliberate "circuitry disappearing under the
   stack" read, but one that left every line stopping in mid-air short of the
   thing it was describing. The fade now runs to the pillar face and settles
   there at half strength, so a line is plainly weaker at the core end than at
   its card without ever losing contact.

   Each phase aims at its own pillar, so a Build card and an Operate card leave
   for visibly different heights. The cost is that the fan doesn't guarantee a
   non-crossing layout — cards sit in reading order, phases don't, so a Build
   card below an Operate card sends its line up and over. Sorting the columns by
   phase would fix it and is not on the table: the card order is the card order.
   -------------------------------------------------------------------------- */

type Link = {
  n: string;
  group: "tech" | "gbs";
  d: string;
  /** The card end, where the line gets its solid dot. */
  x0: number;
  y0: number;
};
type Geometry = {
  w: number;
  h: number;
  /** Where each column's lines terminate: the x of the pillars' side face, in
      wrapper pixels. The fade gradients run to exactly this point, so the stop
      that ends the fade and the point the stroke ends are the same place. */
  edge: { tech: number; gbs: number };
  links: Link[];
};

/** A right-angled connector with rounded corners: horizontal out of the card
    to `mx`, vertical to the target row, horizontal in to the target. Falls
    back to a straight line when a leg is too short to round. */
const elbow = (x0: number, y0: number, mx: number, x1: number, y1: number) => {
  const sy = Math.sign(y1 - y0) || 1;
  const s1 = Math.sign(mx - x0) || 1;
  const s2 = Math.sign(x1 - mx) || 1;
  const r = Math.min(
    12,
    Math.abs(y1 - y0) / 2,
    Math.abs(mx - x0),
    Math.abs(x1 - mx),
  );
  const f = (n: number) => n.toFixed(1);
  if (r < 1.5) return `M ${f(x0)} ${f(y0)} L ${f(x1)} ${f(y1)}`;
  return [
    `M ${f(x0)} ${f(y0)}`,
    `L ${f(mx - s1 * r)} ${f(y0)}`,
    `Q ${f(mx)} ${f(y0)} ${f(mx)} ${f(y0 + sy * r)}`,
    `L ${f(mx)} ${f(y1 - sy * r)}`,
    `Q ${f(mx)} ${f(y1)} ${f(mx + s2 * r)} ${f(y1)}`,
    `L ${f(x1)} ${f(y1)}`,
  ].join(" ");
};

function buildLinks(
  cards: Map<string, HTMLElement>,
  wrap: DOMRect,
  core: DOMRect,
): Geometry {
  // The core's 200-unit viewBox expressed in wrapper pixels. Every orbit lives
  // in that space, so this is the only bridge the fan needs to reach them.
  const k = core.width / 200;
  const ox = core.left - wrap.left;
  const oy = core.top - wrap.top;

  const links: Link[] = [];

  for (const column of [TECH, GBS]) {
    const side = column[0].group === "tech" ? -1 : 1; // which side of the core

    // Bucket by phase, keeping reading order inside each bucket.
    const byPhase = new Map<Service["phase"], Service[]>();
    for (const service of column) {
      const bucket = byPhase.get(service.phase);
      if (bucket) bucket.push(service);
      else byPhase.set(service.phase, [service]);
    }

    for (const [phaseName, bucket] of byPhase) {
      const pillar = PILLARS.find((candidate) => candidate.phase === phaseName);
      if (!pillar) continue;
      const last = Math.max(bucket.length - 1, 1);
      const top = pillar.cy - pillar.h / 2;

      bucket.forEach((service, i) => {
        const el = cards.get(service.n);
        if (!el) return;

        const box = el.getBoundingClientRect();
        // Leave from the edge that faces the core.
        const x0 = (side === -1 ? box.right : box.left) - wrap.left;
        const y0 = box.top + box.height / 2 - wrap.top;

        // Land on the face of this phase's pillar, on the side the card lives
        // on, spread down the body. A lone card takes the middle of the face
        // rather than one end of it, so a group of one looks aimed rather than
        // parked.
        const t = bucket.length === 1 ? 0.5 : i / last;

        const x1 = ox + (100 + side * pillar.rx) * k;
        const y1 =
          oy +
          (top + pillar.h * (PILLAR_INSET + t * (1 - 2 * PILLAR_INSET))) * k;

        // Where the line makes its turn. Staggered per card so that sixteen
        // vertical runs don't pile onto the same few columns — with a fixed
        // offset the lines in a bucket would overlap into one thick bar.
        const mx = x0 - side * (26 + i * 15);

        links.push({
          n: service.n,
          group: service.group,
          x0,
          y0,
          d: elbow(x0, y0, mx, x1, y1),
        });
      });
    }
  }

  // All three pillars present the same side face, so one x per side serves the
  // whole fan. Taken as the widest rather than PILLARS[0].rx, so a future pillar
  // with a different width can't quietly leave the gradients aiming short.
  const faceRx = Math.max(...PILLARS.map((p) => p.rx));

  return {
    w: wrap.width,
    h: wrap.height,
    edge: {
      tech: ox + (100 - faceRx) * k,
      gbs: ox + (100 + faceRx) * k,
    },
    links,
  };
}

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
        {/* The fade. Each side runs from its own card column to the pillar face
            its lines terminate on — the gradient's end and the stroke's end are
            now the same x, which is the whole trick. It used to run to the core
            CENTRE and hit zero there, which meant every line had already faded
            out somewhere in the empty space before the pillars: the last thing
            you saw was a stroke evaporating in mid-air.

            Ending at 0.5 rather than 0 keeps the falloff — a line is still
            visibly weaker at the core end than at its card — while leaving it
            plainly in contact with the pillar it belongs to.

            Laid out in user space rather than per-path bounding boxes so all
            eight lines on a side fade at the same screen x, which is what makes
            them read as one field rather than eight independent strokes. */}
        <linearGradient
          id="os-fade-tech"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={geom.edge.tech}
          y2="0"
        >
          <stop offset="0%" stopColor={HUE.tech.hex} stopOpacity="0.9" />
          <stop offset="55%" stopColor={HUE.tech.hex} stopOpacity="0.78" />
          <stop offset="100%" stopColor={HUE.tech.hex} stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          id="os-fade-gbs"
          gradientUnits="userSpaceOnUse"
          x1={geom.w}
          y1="0"
          x2={geom.edge.gbs}
          y2="0"
        >
          <stop offset="0%" stopColor={HUE.gbs.hex} stopOpacity="0.9" />
          <stop offset="55%" stopColor={HUE.gbs.hex} stopOpacity="0.78" />
          <stop offset="100%" stopColor={HUE.gbs.hex} stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {geom.links.map((link) => {
        const hue = HUE[link.group];
        const active = activeId === link.n;
        const dimmed = activeId !== null && !active;

        return (
          <motion.g
            key={link.n}
            initial={{ opacity: dimmed ? 0.25 : 1 }}
            animate={{ opacity: dimmed ? 0.25 : 1 }}
            transition={{ duration: 0.35, ease: EXPO }}
          >
            <path
              d={link.d}
              stroke={`url(#os-fade-${link.group})`}
              strokeWidth={active ? 1.8 : 1.1}
              strokeLinecap="round"
              style={{ transition: "stroke-width 300ms" }}
            />

            {/* Hover: one bright dot runs the line in and disappears into the
                fade with it. */}
            {active && !reduce && (
              <motion.path
                d={link.d}
                pathLength={1}
                stroke={`url(#os-fade-${link.group})`}
                strokeWidth={3.4}
                strokeLinecap="round"
                strokeDasharray="0.05 0.95"
                initial={{ strokeDashoffset: 1 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* The solid dot at the card end, where the line is fully opaque. */}
            <motion.circle
              cx={link.x0}
              cy={link.y0}
              fill={hue.hex}
              initial={{
                r: active ? 3.4 : 2.2,
                fillOpacity: active ? 1 : 0.85,
              }}
              animate={{
                r: active ? 3.4 : 2.2,
                fillOpacity: active ? 1 : 0.85,
              }}
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
  /** False while the section is off screen — the idle drift stops entirely
      rather than holding a composited layer alive down the whole page. */
  animate,
}: {
  innerRef: React.RefObject<HTMLDivElement>;
  active: "tech" | "gbs" | null;
  /** Which band the hovered or open service sits on. */
  phase: Service["phase"] | null;
  animate: boolean;
}) => {
  const [hot, setHot] = useState(false);
  /** Which pillar the pointer is over — drives the fade-in details popup. Kept
      local so it never touches the card/fan logic the section owns. */
  const [hovered, setHovered] = useState<Service["phase"] | null>(null);
  const accent = active ? HUE[active] : null;

  /** A pillar lights when the pointer is on it, or when a side card in its
      phase is active; the others dim. */
  const litPhase = hovered ?? phase;

  return (
    /* This box is measured. `buildLinks` reads it to place sixteen connectors
       on a circle at its own half-width, so it never moves and never scales —
       the float and the hover lift live on wrappers inside it. */
    <div
      ref={innerRef}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => {
        setHot(false);
        setHovered(null);
      }}
      className="relative aspect-square w-[310px] shrink-0 sm:w-[400px] lg:w-[350px] xl:w-[480px]"
    >
      {/* Ambient halo — warms toward the hovered pillar's hue, or the hovered
          half of the network. Blurred past its own edge, so it reads as light
          in the air rather than as a disc. */}
      <motion.div
        aria-hidden
        className="absolute -inset-[26%] rounded-full blur-3xl"
        initial={false}
        animate={{ opacity: hot || accent || hovered ? 0.85 : 0.55 }}
        transition={{ duration: 0.6, ease: EXPO }}
        style={{
          background: accent
            ? `radial-gradient(closest-side, rgba(${accent.rgb},0.18), rgba(${accent.rgb},0.06) 58%, transparent 78%)`
            : "radial-gradient(closest-side, rgba(68,158,216,0.12), transparent 74%)",
          transition: "background 500ms",
        }}
      />

      {/* Hover-lift only — the idle bob is gone, so the pillars hold still. */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: hot ? -5 : 0 }}
        transition={{ duration: 0.5, ease: EXPO }}
      >
        <div className="absolute inset-0">
          {/* ---- The pillars. ----
              Each is a glossy cylinder: a body rect shaded edge-dark to
              centre-lit, capped by a lighter top-lid ellipse and a darker
              rounded base. Painted bottom-up so every pillar and the soft
              shadow it casts land on top of the one beneath it. */}
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              {PILLARS.map((p) => (
                <linearGradient
                  key={p.phase}
                  id={`pil-body-${p.phase}`}
                  gradientUnits="userSpaceOnUse"
                  x1={100 - p.rx}
                  y1="0"
                  x2={100 + p.rx}
                  y2="0"
                >
                  <stop offset="0%" stopColor={p.edge} />
                  <stop offset="18%" stopColor={p.mid} />
                  <stop offset="42%" stopColor={p.lid} />
                  <stop offset="64%" stopColor={p.mid} />
                  <stop offset="100%" stopColor={p.edge} />
                </linearGradient>
              ))}
              <radialGradient id="pil-shadow">
                <stop offset="0%" stopColor="#0A1017" stopOpacity="0.45" />
                <stop offset="70%" stopColor="#0A1017" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0A1017" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="pil-ground">
                <stop offset="30%" stopColor="#0A1017" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0A1017" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="pil-sheen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Ground shadow under the whole stack. */}
            <ellipse cx="100" cy="194" rx="86" ry="9" fill="url(#pil-ground)" />

            {[...PILLARS].reverse().map((p) => {
              const halfH = p.h / 2;
              const topY = p.cy - halfH;
              const botY = p.cy + halfH;
              const lit = litPhase === p.phase;
              const dim = litPhase !== null && !lit;
              return (
                <motion.g
                  key={p.phase}
                  initial={false}
                  animate={{ opacity: dim ? 0.5 : 1 }}
                  transition={{ duration: 0.35, ease: EXPO }}
                >
                  {/* Cast shadow onto the pillar below. */}
                  <ellipse
                    cx="100"
                    cy={botY + 5}
                    rx={p.rx * 0.86}
                    ry="7"
                    fill="url(#pil-shadow)"
                  />
                  {/* Body. */}
                  <rect
                    x={100 - p.rx}
                    y={topY}
                    width={p.rx * 2}
                    height={p.h}
                    fill={`url(#pil-body-${p.phase})`}
                  />
                  {/* Rounded base (front lip), in the body's OWN gradient
                      rather than a darker tone of its own — the curve stays,
                      the shading that made it read as a separate 3D lip goes.

                      A flat fill can't do this job: the gradient runs bright at
                      the cylinder's centre and dark at its edges, so any single
                      colour is wrong somewhere along the lip. Filling with the
                      same paint makes the join invisible at every x, because
                      `pil-body-*` is `userSpaceOnUse` across exactly this
                      ellipse's own span. */}
                  <ellipse
                    cx="100"
                    cy={botY}
                    rx={p.rx}
                    ry={p.ry}
                    fill={`url(#pil-body-${p.phase})`}
                  />
                  {/* Top sheen. */}
                  <rect
                    x={100 - p.rx}
                    y={topY}
                    width={p.rx * 2}
                    height={p.h * 0.5}
                    fill="url(#pil-sheen)"
                    opacity="0.45"
                  />
                  {/* Top lid. */}
                  <ellipse
                    cx="100"
                    cy={topY}
                    rx={p.rx}
                    ry={p.ry}
                    fill={p.lid}
                  />
                  <ellipse
                    cx="100"
                    cy={topY}
                    rx={p.rx}
                    ry={p.ry}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeOpacity="0.3"
                    strokeWidth="0.6"
                  />
                  {/* "This one's lit" wash — over the lip and the lid as well
                      as the body, so the whole cylinder brightens as one
                      object. It used to cover the body rect alone, which was
                      invisible while the lip carried its own darker tone but
                      shows plainly now the lip is painted in the body's
                      gradient: on hover the body lifted 10% and the lip didn't,
                      putting back the exact tonal step at the join that
                      matching the fills removed.

                      The opacity sits on the GROUP, not on each shape. These
                      three overlap by `ry` at both joins, and per-shape alpha
                      would compound there — two washes over one another read as
                      20%, drawing a bright band around each join instead of
                      lighting the cylinder evenly. A group is composited first
                      and faded once. */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: lit ? 0.1 : 0 }}
                    transition={{ duration: 0.35, ease: EXPO }}
                  >
                    <ellipse
                      cx="100"
                      cy={botY}
                      rx={p.rx}
                      ry={p.ry}
                      fill="#FFFFFF"
                    />
                    <rect
                      x={100 - p.rx}
                      y={topY}
                      width={p.rx * 2}
                      height={p.h}
                      fill="#FFFFFF"
                    />
                    <ellipse
                      cx="100"
                      cy={topY}
                      rx={p.rx}
                      ry={p.ry}
                      fill="#FFFFFF"
                    />
                  </motion.g>
                </motion.g>
              );
            })}
          </svg>

          {/* ---- Icon + label per pillar. ---- Icon left, phase and caption
              to the right, centred on the pillar body — the layout the
              reference uses. */}
          {PILLARS.map((p) => {
            const Icon = p.icon;
            const lit = litPhase === p.phase;
            const labelColor = p.darkLabel ? "text-ink-900" : "text-white";
            const capColor = p.darkLabel ? "text-ink-900" : "text-white/95";
            return (
              <motion.div
                key={p.phase}
                aria-hidden
                /* Two layouts, because the pillar is two very different heights.

                   sm and up (`block`): only the icon+name row is in flow, so
                   `-translate-y-1/2` centres THAT on the pillar and the caption
                   hangs out of flow beneath it. Centring the row and the caption
                   as one block — what this used to do — let the caption's height
                   lever the name up off the middle.

                   Below sm (`flex flex-col`): the caption comes back into flow
                   and the whole group is centred again. It has to be: the core
                   is 310px there, so the body is only ~74px tall and a caption
                   hung beneath the row would hang off the bottom of the pillar
                   and onto the section's white background — where white caption
                   text is simply invisible. In flow, the group measures ~55px
                   and sits inside the body with room to spare. */
                className="pointer-events-none absolute left-1/2 flex w-[88%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center sm:block sm:gap-0 [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]"
                style={{ top: `${(p.cy / 200) * 100}%` }}
                initial={false}
                animate={{ opacity: litPhase && !lit ? 0.7 : 1 }}
                transition={{ duration: 0.35, ease: EXPO }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon
                    className={cn(
                      "h-6 w-6 flex-none sm:h-7 sm:w-7 lg:h-8 lg:w-8 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.35))]",
                      labelColor,
                    )}
                    strokeWidth={1.8}
                  />
                  <p
                    className={cn(
                      "text-[16px] font-extrabold uppercase tracking-[0.08em] sm:text-[19px] lg:text-[23px]",
                      labelColor,
                    )}
                  >
                    {p.phase}
                  </p>
                </div>
                {/* In flow on mobile (see above); out of flow from sm up, hung
                    directly under the row so its height stops counting toward
                    what `-translate-y-1/2` is centring. */}
                <p
                  className={cn(
                    "text-[9.5px] font-medium leading-[1.4] sm:absolute sm:inset-x-0 sm:top-full sm:mt-1 sm:text-[10.5px] lg:text-[12.5px]",
                    capColor,
                  )}
                >
                  {p.caption[0]}
                  <br />
                  {p.caption[1]}
                </p>
              </motion.div>
            );
          })}

          {/* ---- Hover targets. ---- Transparent copies of each body, above
              everything, so hover lands on the true pillar and rides the same
              float wrapper as the graphic. */}
          <svg
            viewBox="0 0 200 200"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            {PILLARS.map((p) => (
              <rect
                key={p.phase}
                x={100 - p.rx}
                y={p.cy - p.h / 2 - p.ry}
                width={p.rx * 2}
                height={p.h + p.ry * 2}
                fill="transparent"
                className="pointer-events-auto cursor-pointer"
                onMouseEnter={() => setHovered(p.phase)}
              />
            ))}
          </svg>
        </div>
      </motion.div>

      {/* ---- Fade-in details popup. ---- A child of the measured box (not the
          float), so it holds still and the pointer can travel onto it. Sized
          under the box width, so it never collides with the side cards. */}
      <AnimatePresence mode="wait">
        {hovered && (
          /* Placement only — and it animates OPACITY ONLY, deliberately.
             Framer writes the whole `transform` property itself, so the moment
             this element animated `scale` its inline transform replaced the one
             Tailwind's `-translate-x-1/2 -translate-y-1/2` had built. The panel
             lost its centring for the entire animation and settled half its own
             width to the right and half its height down. Keeping every transform
             value off this element lets the utility classes hold; the scale
             moved to the child below, which has no positioning to lose. */
          <motion.div
            key={hovered}
            onMouseEnter={() => setHovered(hovered)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EXPO }}
            className={cn(
              "absolute left-1/2 z-40 w-[220px] -translate-x-1/2",
              // Mobile: hung under the whole core. At 310px the panel is most of
              // the core's width, so centred on its pillar it buried the stack —
              // you could not see which pillar you had opened.
              "top-full mt-3",
              // Tablet and up there is room to sit on the pillar it describes.
              "sm:top-[var(--pop-y)] sm:mt-0 sm:-translate-y-1/2",
            )}
            style={
              {
                "--pop-y": `${(PILLARS.find((p) => p.phase === hovered)!.cy / 200) * 100}%`,
              } as React.CSSProperties
            }
          >
            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
              transition={{ duration: 0.3, ease: EXPO }}
              className="relative overflow-hidden rounded-2xl border border-line bg-white/95 p-4 shadow-[0_26px_60px_-28px_rgba(20,30,50,0.5)] backdrop-blur-xl"
            >
            {(() => {
              const pop = {
                Build: "#2E3B4A",
                Automate: "#B87407",
                Operate: "#2C74AE",
              }[hovered];
              const detail = PILLAR_DETAIL[hovered];
              return (
                <>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
                    style={{ background: pop }}
                  />
                  <div className="flex items-baseline justify-between gap-2">
                    <h4
                      className="text-[15px] font-semibold tracking-[-0.02em]"
                      style={{ color: pop }}
                    >
                      {hovered}
                    </h4>
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-400">
                      {detail.blurb}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {detail.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-[12.5px] text-ink"
                      >
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 flex-none rounded-full"
                          style={{ background: pop }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              );
            })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
        /* No aria-label: the button's visible text (the practice name plus the
           phase/count line) is its accessible name. An `aria-label` here used
           the full `service.title`, which didn't contain the shortened visible
           label — a WCAG 2.5.3 name/label mismatch for voice-control users. */
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
          {/* <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-ink-400">
            {service.phase} · {service.subs.length} services
          </span> */}
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

/* Memoised, and the three callbacks it takes are all `useCallback`-stable, so
   a card only re-renders when its own `state` flips. Without this, hovering
   any one of the sixteen re-rendered all sixteen — plus the core — on every
   pointer entry and exit, which is the most-repeated interaction in the
   section. */
const CapabilityCardMemo = memo(CapabilityCard);

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
  /* Read before the first paint, not after it.

     This used to start `false` and correct itself in the effect below, which
     stranded the panel off screen on every phone. Framer reads `initial` on
     the first render, so the sheet mounted with the desktop hidden state
     (`x: 100%`) and began sliding in from the right. The effect then flipped
     `mobile` to true, `animate` became `{ y: 0 }`, and `x` — no longer named
     in the target — was simply abandoned wherever it had got to. Around 100%
     to the right, i.e. just off the edge of the screen, which is exactly what
     it looked like.

     The drawer only ever mounts on a click, well after hydration, so reading
     `matchMedia` in the initialiser is safe; the `typeof window` guard is
     belt-and-braces for any future server render. */
  const [mobile, setMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches,
  );

  useEffect(() => {
    // Keep it honest through an orientation change, which crosses this
    // breakpoint on most tablets.
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", onChange);

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [onClose]);

  /* Both axes are always named, even though only one ever moves. A target that
     mentions just the axis in play leaves the other wherever it happens to be,
     so any swap between these two shapes mid-flight — an orientation change
     across the breakpoint — abandons the old axis at a non-zero offset and
     parks the panel off screen. Pinning both costs nothing and removes the
     failure mode. */
  const hidden = mobile ? { x: 0, y: "100%" } : { x: "100%", y: 0 };
  const shown = { x: 0, y: 0 };

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
  const [sectionRef, inView] = useInView<HTMLElement>();

  const [geom, setGeom] = useState<Geometry | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const open = useMemo(
    () => SERVICES.find((s) => s.n === openId) ?? null,
    [openId],
  );
  // A click keeps the line lit while the drawer is up; hover lights it too.
  const activeId = hovered ?? openId;
  const activeService = useMemo(
    () => SERVICES.find((s) => s.n === activeId) ?? null,
    [activeId],
  );
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
    /* `measure` reads eighteen bounding boxes — sixteen cards, the wrapper and
       the core — and then writes state, so it must run at most once per frame.

       It used to be wired to a ResizeObserver AND a window resize listener,
       which are not alternatives: a window resize fires both, so every resize
       frame ran the whole eighteen-rect measurement twice and set state twice.
       Worse, measuring synchronously inside a ResizeObserver callback reads
       layout during layout, which is what produces "ResizeObserver loop
       completed with undelivered notifications" and forces a second pass.

       Both sources now funnel through one rAF-coalesced call: whatever
       combination fires in a frame, the measurement happens once, after layout
       has settled. The window listener stays because the observer only watches
       the wrapper's own box, and a height-only viewport change (a mobile URL
       bar collapsing) moves the cards without resizing that box. */
    let queued = 0;
    const schedule = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        measure();
      });
    };

    measure();
    const ro = new ResizeObserver(schedule);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", schedule, { passive: true });
    // Webfonts settle after paint and nudge every card's height.
    document.fonts?.ready.then(schedule).catch(() => {});
    return () => {
      if (queued) cancelAnimationFrame(queued);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [measure]);

  const cardState = (n: string): "idle" | "active" | "muted" =>
    activeId === n ? "active" : activeId ? "muted" : "idle";

  /* Two-up on a phone and tablet, a single vertical rail from lg — which is
     also the only breakpoint where the connection fan exists to attach to.

     `setHovered`/`setOpenId` are setState functions and `register` is a
     `useCallback`, so every prop but `state` is referentially stable across
     renders — which is what lets the memo on the card actually hold. */
  const column = (services: Service[]) => (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:flex lg:flex-col lg:justify-center">
      {services.map((service) => (
        <CapabilityCardMemo
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
      ref={sectionRef}
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

      <Container wide className="relative z-10 py-16 sm:py-24 lg:py-32">
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
            {/* Justified only once there's column width to justify into. On a
                phone this measure is ~40 characters, and justifying that
                stretches word spacing into visible rivers — the one place
                justified text reliably looks worse than ragged-right. */}
            <p className="text-[16px] leading-[1.75] text-ink-500 lg:text-justify">
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
                animate={inView}
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
                  which leaves a hole under it at lg. The globe fills it, and
                  earns the space rather than just occupying it: this section's
                  claim is a single delivery chain run across four continents, so
                  the planet is the one motif here that is actually load-bearing.
                  It also gives the fan somewhere to travel to — the whole right
                  side resolves downward into it instead of stopping at the last
                  card.

                  Bleeds past the column and is allowed to run under the section's
                  right edge (the section clips), because a globe that fits neatly
                  inside a column reads as an illustration in a box. Only where
                  the hole exists: below lg the columns stack and there is none —
                  which also matches the connection fan's own 1024px gate, so the
                  two interactive layers appear together or not at all.

                  The globe answers to hover now, so this is NOT aria-hidden or
                  pointer-events-none any more. `w-[122%]` sits on the wrapper
                  rather than on the svg: the globe positions its markers as
                  percentages of the svg's box, so the relative parent has to be
                  that same box or every marker lands in the wrong place. */}

              {/* <div className="relative mt-6 hidden w-[122%] max-w-none opacity-90 lg:block">
                <Globe />
              </div> */}
              {/* The chain, named once under the whole picture. The pyramid reads
              bottom-up as a stack; the line beneath it reads left-to-right as
              a sequence, and between them they say the same thing twice in
              the two ways people look at a diagram like this. */}
              <div className="mt-4 lg:mt-10">
                {/* <p className="flex items-start justify-start gap-3 text-[15px] font-semibold tracking-[0.02em] text-ink lg:gap-4 lg:text-[19px]">
                  {(["Build", "Automate", "Operate"] as const).map(
                    (name, i) => (
                      <Fragment key={name}>
                        {i > 0 && (
                          <span aria-hidden className="text-azure">
                            ·
                          </span>
                        )}
                        <span>{name}</span>
                      </Fragment>
                    ),
                  )}
                </p> */}
                {/* Business Outcomes — what the delivery chain is for. Kept
                    minimal to sit with the paper theme: the section's own
                    hairline-and-mono header, then four quiet rows. Fills the
                    hole under the shorter GBS column. */}
                <div className="rounded-2xl border border-line bg-paper-white p-6 shadow-[0_2px_20px_-14px_rgba(20,30,50,0.2)]">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-px w-10 flex-none bg-amber"
                    />
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                      Business Outcomes
                    </span>
                  </div>
                  <ul className="mt-4 divide-y divide-line/60">
                    {OUTCOMES.map((o) => (
                      <li
                        key={o.title}
                        className="flex items-baseline gap-3 py-3"
                      >
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 flex-none translate-y-[-1px] rounded-full bg-amber"
                        />
                        <div className="flex flex-1 flex-wrap items-baseline gap-2">
                          <span className="text-[14.5px] font-medium text-ink">
                            {o.title}
                          </span>
                          <span className="text-[13px] text-ink-500">
                            {o.desc}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
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

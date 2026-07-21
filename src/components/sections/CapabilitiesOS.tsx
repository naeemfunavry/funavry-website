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

   A plain frontal pyramid now, not a projected 3D object — the corner-on
   camera, the glass and the orbiting rings are gone in favour of the simpler
   thing the reference actually shows: a flat triangle, cut into three solid
   trapezoids, seen straight on. Everything still lives in one 200×200
   viewBox, which the connection fan still measures against.
   -------------------------------------------------------------------------- */

type Band = {
  phase: Service["phase"];
  icon: LucideIcon;
  /** Front face, straight on, in the core's 200×200 viewBox. */
  top: number;
  bottom: number;
  halfTop: number;
  halfBottom: number;
  /** How far this slab's top surface recedes behind its front edge. 0 for
      the tip, which has no top face to show. */
  depth: number;
  /** Front face gradient, top stop then bottom stop. */
  face: [string, string];
  /** The top surface — always lighter than the face, because it points at
      the light rather than away from it. */
  crown: string;
  caption: [string, string];
  /** Where the icon/label/caption cluster sits, as a percentage of the core's
      own box. Each is pushed low in its own slab, where the taper has opened
      up enough to hold a full line of caption. */
  label: { top: string; width: string };
};

/** The three delivery-chain slabs, tip to base: Operate is the small outcome
    everyone sees first, Build is the wide foundation the other two stand on.

    Colours are the reference's, not the brand ramp's. This graphic reads as a
    single object — a bright tip on two dark masses — and dropping the brand's
    amber into the middle of it broke that read completely: it made the middle
    slab look like a different material from the two around it. The phase
    colours still hold everywhere they're type rather than mass (`Hero.tsx`,
    `Footer.tsx`, this section's own subtitle), which is where they actually
    do their job. */
const BANDS: Band[] = [
  {
    phase: "Operate",
    icon: Users,
    top: 12,
    bottom: 90,
    halfTop: 0,
    halfBottom: 47,
    depth: 0,
    face: ["#4FA3FF", "#1B76EF"],
    crown: "#6FB6FF",
    caption: [
      "Managed Services · Workforce Solutions",
      "GCC Enablement · Operational Excellence",
    ],
    label: { top: "25%", width: "42%" },
  },
  {
    phase: "Automate",
    icon: BrainCircuit,
    top: 97,
    bottom: 145,
    halfTop: 53,
    halfBottom: 77,
    depth: 8,
    face: ["#2C5B87", "#13304C"],
    crown: "#3C6E9C",
    caption: [
      "AI Agents · Intelligent Automation",
      "Document Intelligence · Process Optimization",
    ],
    label: { top: "50%", width: "64%" },
  },
  {
    phase: "Build",
    icon: Boxes,
    top: 152,
    bottom: 198,
    halfTop: 80,
    halfBottom: 96,
    depth: 8,
    face: ["#38434F", "#1D2530"],
    crown: "#47535F",
    caption: [
      "AI Solutions · Digital Engineering · Data",
      "Cloud · Cybersecurity · Emerging Technologies",
    ],
    label: { top: "77%", width: "82%" },
  },
];

/** Corner radius. Rounded corners come from stroking each face in its own
    fill colour with `strokeLinejoin="round"`: the stroke rounds every join
    and grows the shape by half its width, so the geometry below is inset by
    `R` first and comes back out at exactly the right size. Cheaper than
    splicing four arcs by hand, and the fill and the rounding can't drift out
    of sync because they're the same path. */
const R = 3.5;

/** A slab's front face — a triangle at the tip, a trapezoid below it. */
const facePath = (b: Band) => {
  const y0 = b.top + R;
  const y1 = b.bottom - R;
  const hb = b.halfBottom - R;
  if (b.halfTop < 1)
    return `M 100 ${y0} L ${100 + hb} ${y1} L ${100 - hb} ${y1} Z`;
  const ht = b.halfTop - R;
  return `M ${100 - ht} ${y0} L ${100 + ht} ${y0} L ${100 + hb} ${y1} L ${100 - hb} ${y1} Z`;
};

/** A slab's top surface, narrowing as it recedes. Most of it ends up hidden
    behind the slab sitting on it — the sliver that survives around the edges
    is the entire reason the stack reads as solid rather than as three flat
    shapes. */
const crownPath = (b: Band) => {
  const back = b.top - b.depth;
  const hf = b.halfTop;
  const hk = b.halfTop * 0.93;
  return `M ${100 - hf} ${b.top} L ${100 + hf} ${b.top} L ${100 + hk} ${back} L ${100 - hk} ${back} Z`;
};

/** Where the connection fan's sixteen lines aim — one ellipse per phase, read
    by `buildLinks` below. Never drawn: the lines fade out well before they
    reach these, exactly as they do in the reference. They exist only to give
    each phase's cards an arc to spread across, sized for a clean spread
    rather than pinned to its slab's own edge. */
const PHASE_ANCHORS = [
  { phase: "Operate", cy: 56, rx: 46, ry: 30 },
  { phase: "Automate", cy: 112, rx: 74, ry: 40 },
  { phase: "Build", cy: 168, rx: 86, ry: 40 },
] as const;

/** The faint rings behind the pyramid. Two concentric circles and a scatter
    of motes, all fading out toward the edges of the box. */
const RINGS = [
  { r: 92, dash: "1.5 4" },
  { r: 72, dash: "" },
] as const;

const RING_MOTES = [
  { a: -164, r: 92 },
  { a: -118, r: 92 },
  { a: -46, r: 92 },
  { a: -14, r: 92 },
  { a: -142, r: 72 },
  { a: -38, r: 72 },
] as const;

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
   Every line then fades to nothing before it arrives, so the fan reads as
   circuitry disappearing under the pyramid rather than as sixteen wires
   plugged into it.

   Each phase still aims at its own anchor arc, so a Build card and an Operate
   card leave for visibly different heights. The cost is that the fan doesn't
   guarantee a non-crossing layout — cards sit in reading order, phases don't,
   so a Build card below an Operate card sends its line up and over. Sorting
   the columns by phase would fix it and is not on the table: the card order is
   the card order.
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
  /** Core centre, in wrapper pixels — the point every line fades toward. */
  cx: number;
  links: Link[];
};

/** Half-angle of the arc each phase group fans across, in degrees. */
const ARC = 56;

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
      const ring = PHASE_ANCHORS.find(
        (candidate) => candidate.phase === phaseName,
      );
      if (!ring) continue;
      const last = Math.max(bucket.length - 1, 1);

      bucket.forEach((service, i) => {
        const el = cards.get(service.n);
        if (!el) return;

        const box = el.getBoundingClientRect();
        // Leave from the edge that faces the core.
        const x0 = (side === -1 ? box.right : box.left) - wrap.left;
        const y0 = box.top + box.height / 2 - wrap.top;

        // Fan this phase's cards across its own anchor arc, on the side they
        // live on. A lone card takes the arc's widest point rather than one
        // end of it, so a group of one still looks aimed rather than parked.
        const t = bucket.length === 1 ? 0.5 : i / last;
        const spread = ((-ARC + t * 2 * ARC) * Math.PI) / 180;
        const theta = side === -1 ? Math.PI - spread : spread;

        const x1 = ox + (100 + ring.rx * Math.cos(theta)) * k;
        const y1 = oy + (ring.cy + ring.ry * Math.sin(theta)) * k;

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

  return {
    w: wrap.width,
    h: wrap.height,
    cx: ox + 100 * k,
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
        {/* The fade. Each side runs from its own card column toward the core
            centre and dies before it gets there, so no line ever visibly
            touches the pyramid — it just thins out under it. Laid out in user
            space rather than per-path bounding boxes so all eight lines on a
            side fade at the same screen x, which is what makes them read as
            one field rather than eight independent strokes. */}
        <linearGradient
          id="os-fade-tech"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={geom.cx}
          y2="0"
        >
          <stop offset="0%" stopColor={HUE.tech.hex} stopOpacity="0.85" />
          <stop offset="62%" stopColor={HUE.tech.hex} stopOpacity="0.7" />
          <stop offset="88%" stopColor={HUE.tech.hex} stopOpacity="0.12" />
          <stop offset="100%" stopColor={HUE.tech.hex} stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="os-fade-gbs"
          gradientUnits="userSpaceOnUse"
          x1={geom.w}
          y1="0"
          x2={geom.cx}
          y2="0"
        >
          <stop offset="0%" stopColor={HUE.gbs.hex} stopOpacity="0.85" />
          <stop offset="62%" stopColor={HUE.gbs.hex} stopOpacity="0.7" />
          <stop offset="88%" stopColor={HUE.gbs.hex} stopOpacity="0.12" />
          <stop offset="100%" stopColor={HUE.gbs.hex} stopOpacity="0" />
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
  const reduce = useReducedMotion();
  const [hot, setHot] = useState(false);
  const accent = active ? HUE[active] : null;
  const idle = animate && !reduce;

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
      className="relative aspect-square w-[300px] shrink-0 sm:w-[400px] lg:w-[340px] xl:w-[460px]"
    >
      {/* Ambient halo, and the one place a selection still shows on the core
          itself: the glow simply warms toward the hovered half of the
          network. Blurred past any edge of its own, so it reads as light in
          the air rather than as a disc. */}
      <motion.div
        aria-hidden
        className="absolute -inset-[30%] rounded-full blur-3xl"
        animate={{ opacity: hot || accent ? 0.9 : 0.6 }}
        transition={{ duration: 0.6, ease: EXPO }}
        style={{
          background: accent
            ? `radial-gradient(closest-side, rgba(${accent.rgb},0.18), rgba(${accent.rgb},0.06) 58%, transparent 78%)`
            : "radial-gradient(closest-side, rgba(68,158,216,0.14), transparent 74%)",
          transition: "background 500ms",
        }}
      />

      {/* ---- The rings. ----
          Two faint circles and a scatter of motes, sitting behind the
          pyramid and fading out toward the edges of the box. The fade is a
          mask rather than a flat opacity: a ring at uniform 8% still draws a
          hard closed curve the eye follows all the way round, which fights
          the pyramid for attention. Fading the ends leaves only the arcs
          either side of the body, which is what the reference shows. */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="core-ring-fade">
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="76%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <mask id="core-ring-mask">
            <rect width="200" height="200" fill="url(#core-ring-fade)" />
          </mask>
        </defs>
        <g mask="url(#core-ring-mask)">
          {RINGS.map((ring) => (
            <circle
              key={ring.r}
              cx="100"
              cy="104"
              r={ring.r}
              fill="none"
              stroke="#8FA9B8"
              strokeOpacity="0.42"
              strokeWidth="0.6"
              strokeDasharray={ring.dash || undefined}
            />
          ))}
          {RING_MOTES.map((m) => {
            const rad = (m.a * Math.PI) / 180;
            return (
              <circle
                key={`${m.a}-${m.r}`}
                cx={100 + m.r * Math.cos(rad)}
                cy={104 + m.r * Math.sin(rad)}
                r="1.1"
                fill="#8FA9B8"
                fillOpacity="0.55"
              />
            );
          })}
        </g>
      </svg>

      {/* Everything below bobs together on one gentle vertical drift — no 3D
          tilt, because the pyramid is drawn straight on rather than
          projected. */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: hot ? -5 : 0 }}
        transition={{ duration: 0.5, ease: EXPO }}
      >
        <motion.div
          className="absolute inset-0"
          animate={idle ? { y: [-4, 4, -4] } : { y: 0 }}
          transition={
            idle
              ? { duration: 9, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.4, ease: EXPO }
          }
        >
          {/* ---- The slabs. ----
              Painted bottom-up, each as a crown (its top surface) then a
              front face, so every slab covers the inner part of the crown
              belonging to the one below it. What's left showing is the rim,
              and that rim is the whole 3D read. */}
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              {BANDS.map((band) => (
                <linearGradient
                  key={band.phase}
                  id={`core-face-${band.phase}`}
                  gradientUnits="userSpaceOnUse"
                  x1="30"
                  y1={band.top}
                  x2="170"
                  y2={band.bottom}
                >
                  <stop offset="0%" stopColor={band.face[0]} />
                  <stop offset="100%" stopColor={band.face[1]} />
                </linearGradient>
              ))}
              {/* The contact shadow each slab drops onto the one beneath it. */}
              <linearGradient id="core-drop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B1520" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0B1520" stopOpacity="0" />
              </linearGradient>
              {/* Soft blobs as radial gradients rather than blurred shapes.
                  These were three `feGaussianBlur` filters, which is the most
                  expensive way to ask for exactly this: an SVG filter
                  rasterises its subtree off the fast path, and these sat
                  inside a wrapper on an infinite transform, so the cost was
                  being paid against a moving layer. A gradient is a texture
                  lookup — same soft edge, none of the filter machinery. */}
              <radialGradient id="core-ground">
                <stop offset="35%" stopColor="#0B1520" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0B1520" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="core-bloom">
                <stop offset="20%" stopColor="#3E97FF" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#3E97FF" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#3E97FF" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ground shadow under the whole stack. */}
            <ellipse cx="100" cy="199" rx="96" ry="13" fill="url(#core-ground)" />

            {/* Operate's glow, which the reference carries as a distinct blue
                bloom spilling onto the slab below it. */}
            <ellipse cx="100" cy="89" rx="58" ry="16" fill="url(#core-bloom)" />

            {[...BANDS].reverse().map((band) => {
              const lit = phase === band.phase;
              const dim = phase !== null && !lit;
              return (
                <motion.g
                  key={band.phase}
                  animate={{ opacity: dim ? 0.62 : 1 }}
                  transition={{ duration: 0.35, ease: EXPO }}
                >
                  {/* Cast onto whatever is underneath, before this slab's own
                      surfaces go down over it. The `core-drop` gradient does
                      the softening on its own — this used to carry a blur
                      filter on top of an already-graded fill, which is paying
                      twice for one soft edge. */}
                  {band.depth > 0 && (
                    <path
                      d={crownPath(band)}
                      fill="url(#core-drop)"
                      transform="translate(0,-6)"
                      opacity="0.75"
                    />
                  )}
                  {band.depth > 0 && (
                    <path
                      d={crownPath(band)}
                      fill={band.crown}
                      stroke={band.crown}
                      strokeWidth={R * 2}
                      strokeLinejoin="round"
                    />
                  )}
                  <path
                    d={facePath(band)}
                    fill={`url(#core-face-${band.phase})`}
                    stroke={`url(#core-face-${band.phase})`}
                    strokeWidth={R * 2}
                    strokeLinejoin="round"
                  />
                  {/* The "this one's lit" wash, over the slab's own fill. */}
                  <motion.path
                    d={facePath(band)}
                    fill="#FFFFFF"
                    stroke="#FFFFFF"
                    strokeWidth={R * 2}
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: lit ? 0.12 : 0 }}
                    transition={{ duration: 0.35, ease: EXPO }}
                  />
                </motion.g>
              );
            })}
          </svg>

          {/* ---- Icon, label and caption, one cluster per slab. ----
              HTML rather than SVG: this text only has to wrap and stay crisp
              at every core size, and percentage positioning against the same
              box the SVG fills lands each cluster on its own slab without
              restating the geometry in a second coordinate system. */}
          {BANDS.map((band) => {
            const Icon = band.icon;
            const lit = phase === band.phase;
            return (
              <motion.div
                key={band.phase}
                aria-hidden
                className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center text-center"
                style={{ top: band.label.top, width: band.label.width }}
                animate={{ opacity: phase && !lit ? 0.72 : 1 }}
                transition={{ duration: 0.35, ease: EXPO }}
              >
                <Icon
                  className="h-4 w-4 text-white sm:h-5 sm:w-5 lg:h-7 lg:w-7"
                  strokeWidth={1.5}
                />
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white sm:text-[13px] lg:text-[15px]">
                  {band.phase}
                </p>
                {/* Dropped below `sm`, not merely shrunk. The core is 300px
                    wide on a phone, and a two-line caption inside a tapering
                    slab that narrow lands around 5px — small enough that it
                    reads as texture rather than words, while still costing
                    layout. The icon and the phase name carry the diagram at
                    that size; the captions come back as soon as there's room
                    to set them at a legible size. */}
                <p className="mt-1 hidden text-[7px] leading-[1.5] text-white/85 sm:block sm:text-[7.5px] lg:text-[9px]">
                  {band.caption[0]}
                  <br />
                  {band.caption[1]}
                </p>
              </motion.div>
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
                <p className="mt-2 text-base leading-[1.7] text-ink-500">
                  A unified approach to build, automate and operate smarter
                  enterprises for the future.
                </p>
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

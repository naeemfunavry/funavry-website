import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Blocks,
  Bot,
  Boxes,
  Building2,
  Camera,
  ClipboardCheck,
  ClipboardList,
  Cloud,
  Cog,
  Compass,
  Cpu,
  CreditCard,
  Database,
  Eye,
  FileText,
  Files,
  Gamepad2,
  Gauge,
  GitBranch,
  Glasses,
  Globe,
  GraduationCap,
  Headphones,
  Hexagon,
  KeyRound,
  Landmark,
  Link2,
  Lock,
  Map,
  MapPin,
  MessageSquare,
  Network,
  Radio,
  RefreshCw,
  Satellite,
  Scale,
  ScanLine,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Video,
  Wallet,
  Workflow,
  Wrench,
  Coins,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";

/** Icons are passed as names, not components, so the data can live in a server
    component. The names below are resolved through `ICONS`. */
export type DepthItem = {
  title: string;
  desc: string;
  icon: keyof typeof ICONS;
};

export type DepthGroup = {
  title: string;
  icon: keyof typeof ICONS;
  items: DepthItem[];
  /** The tools/platforms this capability runs on, shown as tagged chips. */
  stack: string[];
  /** Unused by the column layout; kept so other presentations can read them. */
  tagline?: string;
  blurb?: string;
};

/** The glyphs the capability data may name, resolved by the section. */
const ICONS = {
  Cpu,
  Workflow,
  FileText,
  Settings2,
  Network,
  Bot,
  MessageSquare,
  Sparkles,
  Cog,
  GitBranch,
  Blocks,
  Files,
  ScanLine,
  Search,
  ShieldCheck,
  RefreshCw,
  BarChart3,
  SlidersHorizontal,
  Database,
  Activity,
  Cloud,
  Boxes,
  AlertTriangle,
  KeyRound,
  Bell,
  Building2,
  Camera,
  ClipboardCheck,
  ClipboardList,
  Compass,
  CreditCard,
  Eye,
  Gamepad2,
  Gauge,
  Glasses,
  Globe,
  GraduationCap,
  Headphones,
  Lock,
  Map,
  MapPin,
  Satellite,
  Scale,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Video,
  Wrench,
  Zap,
  Coins,
  Landmark,
  Wallet,
} satisfies Record<string, LucideIcon>;

/** A representative glyph per tool, so each technology tag carries an icon.
    Anything unmapped falls back to a neutral hexagon. */
const STACK_ICON: Record<string, LucideIcon> = {
  LangGraph: Network,
  CrewAI: Users,
  LangChain: Link2,
  Claude: Sparkles,
  OpenAI: Bot,
  n8n: Workflow,
  Zapier: Zap,
  "SAP / ERP": Building2,
  "Event-driven": Radio,
  "Azure AI Search": Search,
  Pinecone: Database,
  Chroma: Database,
  Elasticsearch: Search,
  MLflow: GitBranch,
  Kubeflow: Boxes,
  LangSmith: Activity,
  SageMaker: Cloud,
  "Vertex AI": Cloud,
};

/**
 * "Capabilities in depth" — the practice broken into its four capabilities, each
 * a column of named items with a short line of its own, closing on the stack it
 * runs on (each tool tagged with its own glyph).
 *
 * Deliberately *not* a card layout: the page already carries a card grid, so
 * this reads as open columns ruled off from one another — hairline dividers,
 * no boxes, no shadows — for a calmer, more editorial feel.
 */
export default function CapabilitiesDepth({
  id,
  label = "Capabilities in depth",
  title,
  body,
  groups,
}: {
  id: string;
  label?: string;
  title?: React.ReactNode;
  body?: React.ReactNode;
  groups: DepthGroup[];
}) {
  if (groups.length === 0) return null;

  return (
    <section
      aria-labelledby={id}
      className="relative overflow-hidden border-b border-line bg-paper-deep"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />
      <Container wide className="relative z-10 py-12 sm:py-16 lg:py-20">
        {/* ---- Head ---- */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                {label}
              </span>
            </div>
            {title && (
              <h2 id={id} className="mt-5 text-h3 text-ink">
                {title}
              </h2>
            )}
          </div>
          {body && (
            <p className="max-w-[44ch] text-[15px] leading-[1.8] text-ink-500 lg:text-[16px]">
              {body}
            </p>
          )}
        </div>

        {/* ---- Columns ----
            A four-up grid, each column ruled off from the next by a hairline on
            its left (the first gets none). The rules collapse to top borders
            when the grid wraps to one or two columns on smaller screens.

            On large screens the grid declares four row tracks
            (header · title · items · stack) and every column spans them as a
            subgrid, so those four bands line up across all columns — the title
            band sizes to the tallest title, the 1fr items band fills the
            height, and the stacks sit flush along the bottom. */}
        <div className="mt-12 grid gap-y-12 border-t border-line pt-10 sm:grid-cols-2 sm:gap-x-10 lg:mt-14 lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr_auto] lg:gap-x-0 lg:gap-y-0">
          {groups.map((group, g) => {
            const Head = ICONS[group.icon] ?? Hexagon;
            return (
              <Wipe
                key={group.title}
                delay={g * 0.06}
                className="flex h-full flex-col lg:row-span-4 lg:grid lg:grid-rows-subgrid lg:gap-y-0 lg:px-8 lg:first:pl-0 lg:last:pr-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-line"
              >
                {/* Column header: index, glyph, title. */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-semibold tracking-[0.1em] text-azure">
                    {String(g + 1).padStart(2, "0")}
                  </span>
                  <Head
                    aria-hidden
                    size={18}
                    strokeWidth={1.6}
                    className="flex-none text-amber"
                  />
                </div>
                {/* Title — capped at two lines (longer titles truncate with an
                    ellipsis). On large screens every column shares one subgrid
                    row for the title, so the block sizes to the tallest title
                    across the row and all item lists start on the same line. */}
                <h3 className="mt-4 line-clamp-2 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                  {group.title}
                </h3>

                {/* Items. */}
                <ul className="mt-5 flex-1 space-y-5">
                  {group.items.map((item) => {
                    const Icon = ICONS[item.icon] ?? Hexagon;
                    return (
                      <li key={item.title} className="flex gap-3">
                        <Icon
                          aria-hidden
                          size={16}
                          strokeWidth={1.6}
                          className="mt-[3px] flex-none text-ink-400"
                        />
                        <div>
                          <h4 className="text-[13.5px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-[12.5px] leading-[1.6] text-ink-500">
                            {item.desc}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Stack — a quiet footer of tagged tools, ruled off from the
                    items; each tool carries its own glyph. */}
                {group.stack.length > 0 && (
                  <ul className="mt-7 flex flex-wrap gap-1.5 border-t border-line/70 pt-5">
                    {group.stack.map((tool) => {
                      const Tool = STACK_ICON[tool] ?? Hexagon;
                      return (
                        <li
                          key={tool}
                          className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[10px] tracking-[0.02em] text-ink-500"
                        >
                          <Tool
                            aria-hidden
                            size={12}
                            strokeWidth={1.8}
                            className="flex-none text-azure"
                          />
                          {tool}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Wipe>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

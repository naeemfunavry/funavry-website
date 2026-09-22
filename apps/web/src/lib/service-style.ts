import {
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
  type LucideIcon,
} from "lucide-react";
import type { Service } from "./services";

/**
 * How a practice is drawn: its icon, its phase hue, its house label. Kept out
 * of `ServiceDrawer` (a client module) so server pages can read the values —
 * constants exported through a "use client" file reach a server component as
 * client references, not objects.
 */

export const SERVICE_ICONS: Record<string, LucideIcon> = {
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

/** Each phase keeps its logo hue, so a service says where in the chain it acts. */
export const PHASE = {
  Build: { text: "text-azure", dot: "bg-azure", tint: "68,158,216" },
  Automate: { text: "text-amber-ink", dot: "bg-amber", tint: "245,159,19" },
  Operate: { text: "text-steel", dot: "bg-steel", tint: "55,96,121" },
} as const;

export const HOUSE_LABEL: Record<Service["group"], string> = {
  tech: "Technology & Engineering",
  gbs: "Global Business Services",
};

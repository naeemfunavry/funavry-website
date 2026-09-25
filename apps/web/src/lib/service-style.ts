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

/**
 * A photograph per engineering practice, keyed by slug, for the Services
 * page's carousel. 1920px wide WebP in /public/services, from Unsplash (free
 * for commercial use, no attribution required). A practice without one falls
 * back to its icon.
 */
export const SERVICE_IMAGES: Record<string, string> = {
  "ai-automation": "/services/ai-automation.webp",
  "digital-engineering": "/services/digital-engineering.webp",
  "blockchain-fintech": "/services/blockchain-fintech.webp",
  "immersive-technologies": "/services/immersive-technologies.webp",
  "robotics-iot-computer-vision": "/services/robotics-iot-computer-vision.webp",
  "geospatial-ai": "/services/geospatial-ai.webp",
  "data-business-intelligence": "/services/data-business-intelligence.webp",
  "cloud-devops-cybersecurity": "/services/cloud-devops-cybersecurity.webp",
  "quality-engineering": "/services/quality-engineering.webp",
  "managed-services": "/services/managed-services.webp",
};

export const HOUSE_LABEL: Record<Service["group"], string> = {
  tech: "Technology & Engineering",
  gbs: "Global Business Services",
};

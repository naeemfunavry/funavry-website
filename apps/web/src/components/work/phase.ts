import type { ProjectPhase } from "@/lib/work-model";

/**
 * Phase colours for the Work components — the same values as `CASE_PHASE` in
 * `@/lib/case-studies`. Not imported from there: that module statically imports
 * every home-page capture (with its blur placeholder), and these components run
 * on the client, so importing it would ship all of that to the browser. Living
 * under /components also puts the class names where Tailwind scans for them.
 */
export const PHASE_STYLE: Record<
  ProjectPhase,
  { text: string; dot: string; tint: string }
> = {
  Build: { text: "text-azure-ink", dot: "bg-azure", tint: "68,158,216" },
  Automate: { text: "text-amber-ink", dot: "bg-amber", tint: "245,159,19" },
  Operate: { text: "text-steel-ink", dot: "bg-steel", tint: "55,96,121" },
};

import {
  Building2,
  Clock3,
  Globe2,
  Layers,
  MonitorSmartphone,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import type { GlanceRow } from "@/lib/case-study-view";
import DetailHeading from "./DetailHeading";

const ICONS: Record<GlanceRow["key"], LucideIcon> = {
  industry: Building2,
  engagement: Settings2,
  platform: MonitorSmartphone,
  services: Layers,
  duration: Clock3,
  client: Users,
  region: Globe2,
};

/**
 * Project at a Glance: the brief's key facts as a row of small cards — glyph,
 * label, value — on the paper-deep band with the drafting grid.
 */
export default function ProjectGlance({ rows }: { rows: GlanceRow[] }) {
  if (rows.length === 0) return null;

  return (
    <section
      aria-labelledby="glance-heading"
      className="relative overflow-hidden border-b border-line bg-paper-deep"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
      <Container wide className="relative py-12 lg:py-16">
        <DetailHeading
          id="glance-heading"
          eyebrow="Overview"
          title="Project at a Glance"
        />

        <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-5 lg:gap-4">
          {rows.map((row) => {
            const Icon = ICONS[row.key];
            return (
              <div
                key={row.key}
                className="flex items-start gap-4 rounded-lg bg-paper-white p-5 ring-1 ring-line"
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  aria-hidden
                  className="mt-0.5 flex-none text-azure"
                />
                <div className="min-w-0">
                  <dt className="text-[14.5px] font-medium text-ink">
                    {row.label}
                  </dt>
                  {row.values.map((value) => (
                    <dd
                      key={value}
                      className="mt-1 text-[13px] leading-[1.5] text-ink-500"
                    >
                      {value}
                    </dd>
                  ))}
                </div>
              </div>
            );
          })}
        </dl>
      </Container>
    </section>
  );
}

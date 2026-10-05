import {
  Briefcase,
  Building2,
  Globe2,
  Users,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import type { Glance } from "@/lib/case-study-view";
import DetailHeading from "./DetailHeading";

/**
 * Project at a Glance, as one card in two panels: the brief's facts —
 * industries as chips, the client (or region), the dev team size — on paper,
 * each behind a round azure badge; the highlights on the ink panel beside
 * them, ruled apart, the first in amber as the brief sets it.
 */
export default function ProjectGlance({ glance }: { glance: Glance }) {
  const { industries, highlights, client, team } = glance;

  return (
    <section
      aria-labelledby="glance-heading"
      className="relative overflow-hidden border-b border-line bg-paper-deep"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
      <Container wide className="relative py-6 sm:py-8 lg:py-10">
        <DetailHeading
          id="glance-heading"
          eyebrow="Overview"
          title="Project at a Glance"
        />

        <div
          className={`mt-5 grid overflow-hidden rounded-xl bg-paper-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] ring-1 ring-line lg:mt-6 ${
            highlights.length > 0
              ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
              : ""
          }`}
        >
          {/* ---------------------------------------------------- Facts -- */}
          <div className="divide-y divide-line">
            <Fact icon={Building2} label="Industries">
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {industries.map((name) => (
                  <li
                    key={name}
                    className="rounded-full bg-azure/[0.07] px-2.5 py-0.5 text-[12px] leading-[1.5] text-azure-ink ring-1 ring-azure/15"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </Fact>

            {(client || team) && (
              <div className="grid grid-cols-2 divide-x divide-line">
                {client && (
                  <Fact
                    icon={client.label === "Region" ? Globe2 : Briefcase}
                    label={client.label}
                  >
                    <p className="mt-1 text-[14px] font-medium leading-[1.4] text-ink">
                      {client.value}
                    </p>
                  </Fact>
                )}
                {team && (
                  <Fact icon={Users} label="Dev Team Size">
                    <p className="mt-1 text-[14px] font-medium leading-[1.4] text-ink">
                      {team}
                    </p>
                  </Fact>
                )}
              </div>
            )}
          </div>

          {/* ----------------------------------------------- Highlights -- */}
          {highlights.length > 0 && (
            <div className="relative isolate overflow-hidden bg-[#102e54] px-5 py-5 sm:px-6 lg:px-7 lg:py-6">
              {/* Ambient glow and a faint grid, so the panel reads as lit
                  rather than flat. */}
              <div
                aria-hidden
                className="absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-azure/25 blur-3xl"
              />
              <div
                aria-hidden
                className="absolute -bottom-24 -left-10 -z-10 h-48 w-48 rounded-full bg-amber/15 blur-3xl"
              />
              <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:28px_28px]"
              />

              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-6 flex-none bg-amber" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/60">
                  Highlights
                </span>
              </div>

              <ul className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-paper/10">
                {highlights.map((h, i) => (
                  <li
                    key={h.value + i}
                    className="sm:px-5 sm:first:pl-0 sm:last:pr-0"
                  >
                    <p
                      className={`text-[clamp(18px,1.7vw,24px)] font-semibold leading-[1.15] tracking-[-0.02em] ${
                        i === 0 ? "text-amber" : "text-paper"
                      }`}
                    >
                      {h.value}
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-[1.45] text-paper/65">
                      {h.label}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

/** One fact: a round azure badge beside a mono label and its value. */
function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <dl className="flex items-start gap-3.5 px-5 py-4 sm:px-6">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-azure text-paper-white shadow-[0_6px_14px_-6px_rgba(31,95,135,0.6)]">
        <Icon size={16} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-500">
          {label}
        </dt>
        <dd>{children}</dd>
      </div>
    </dl>
  );
}

import Image from "next/image";
import {
  BrainCircuit,
  Building2,
  Handshake,
  ShieldCheck,
  TrendingUp,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import { Wipe } from "@/components/ui/Kinetic";

/* The three logo hues, "r,g,b", cycled down the reasons. */
const AZURE = "68,158,216";
const AMBER = "245,159,19";
const STEEL = "55,96,121";

/** The six reasons, as the company profile states them. */
const REASONS: { title: string; body: string; icon: LucideIcon; tint: string }[] = [
  {
    title: "AI-First by Design",
    body: "AI, agents, and automation embedded across every engagement and operating model.",
    icon: BrainCircuit,
    tint: AZURE,
  },
  {
    title: "End-to-End Delivery",
    body: "Strategy to execution to managed operations, under one accountable model.",
    icon: Workflow,
    tint: AMBER,
  },
  {
    title: "Deep Functional Expertise",
    body: "Decades of leadership in GBS, shared services, and enterprise transformation.",
    icon: Handshake,
    tint: STEEL,
  },
  {
    title: "Enterprise-Grade & Compliant",
    body: "SOC 2 Type II, ISO 27001, HIPAA, and DEA built in.",
    icon: ShieldCheck,
    tint: AZURE,
  },
  {
    title: "Proven at Scale",
    body: "500+ projects delivered across four regions in eight years.",
    icon: TrendingUp,
    tint: AMBER,
  },
  {
    title: "Industry-Specific Depth",
    body: "Proven across eleven industries, from healthcare to agriculture.",
    icon: Building2,
    tint: STEEL,
  },
];

/** The figures the photo carries, taken from the reasons themselves. */
const FIGURES = [
  { value: "500+", label: "Projects delivered" },
  { value: "11", label: "Industries" },
  { value: "4", label: "Regions" },
];

/**
 * Why organizations choose Funavry: the team's photograph on the left,
 * carrying the statement and the headline figures, and the six reasons beside
 * it as framed cards, each with an icon tile in one of the logo's hues.
 */
export default function WhyWorkWithUs({ id = "why-us" }: { id?: string }) {
  return (
    <section
      aria-labelledby={id}
      className="relative overflow-hidden border-b border-line bg-paper-deep"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />

      <Container wide className="relative z-10 py-8 sm:py-12 lg:py-14">
        {/* Heading row. */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-amber" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Why Work With Us
              </span>
            </div>
            <h2 id={id} className="mt-6 text-h3 text-ink">
              Why organizations{" "}
              <span className="text-azure-ink">choose Funavry.</span>
            </h2>
          </div>
          <p className="max-w-[46ch] text-[15.5px] leading-[1.7] text-ink-500">
            Six reasons enterprise and government leaders partner with Funavry.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
          {/* ---- The photograph, with the statement and figures. ---- */}
          <Wipe className="h-full">
            <figure className="relative h-full min-h-[440px] overflow-hidden bg-ink-900">
              <Image
                src="/about/2.webp"
                alt="The Funavry team gathered in the office lobby"
                fill
                quality={90}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-[center_35%]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(0deg,#21262A_0%,rgba(33,38,42,0.86)_38%,rgba(33,38,42,0.2)_72%,rgba(33,38,42,0.05)_100%)]"
              />
              <span aria-hidden className="absolute left-0 top-0 h-[3px] w-24 bg-amber" />

              {/* Compliance, pinned to the corner. */}
              <span className="absolute right-4 top-4 inline-flex items-center gap-2 bg-ink-900/85 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/85">
                <ShieldCheck size={13} aria-hidden className="text-amber" />
                SOC 2 · ISO 27001 · HIPAA
              </span>

              <figcaption className="absolute inset-x-0 bottom-0 p-7 lg:p-8">
                <p className="max-w-[26ch] text-[22px] font-medium leading-snug tracking-[-0.02em] text-paper lg:text-[24px]">
                  One accountable partner, from strategy to managed operations.
                </p>
                <dl className="mt-7 grid grid-cols-3 border-t border-paper/15 pt-6">
                  {FIGURES.map((f, i) => (
                    <div
                      key={f.label}
                      className={
                        i > 0 ? "flex flex-col-reverse border-l border-paper/15 pl-5" : "flex flex-col-reverse"
                      }
                    >
                      <dt className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/55">
                        {f.label}
                      </dt>
                      <dd className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-paper lg:text-[34px]">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </figcaption>
            </figure>
          </Wipe>

          {/* ---- The six reasons. ---- */}
          <ul className="grid gap-5 sm:grid-cols-2">
            {REASONS.map(({ title, body, icon: Icon, tint }, i) => (
              <li key={title} className="h-full">
                <Wipe delay={(i % 2) * 0.06} className="h-full">
                  <Frame
                    tint={tint}
                    className="group/why h-full"
                    innerClassName="flex h-full flex-col p-6"
                  >
                    <span
                      style={{ "--tint": tint } as React.CSSProperties}
                      className="flex h-12 w-12 items-center justify-center border border-[rgba(var(--tint),0.3)] bg-[rgba(var(--tint),0.1)] text-[rgb(var(--tint))] transition-colors duration-300 group-hover/why:border-[rgb(var(--tint))] group-hover/why:bg-[rgb(var(--tint))] group-hover/why:text-paper"
                    >
                      <Icon size={21} strokeWidth={1.6} aria-hidden />
                    </span>
                    <h3 className="mt-5 text-[17px] font-medium leading-snug tracking-[-0.015em] text-ink">
                      {title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-[1.65] text-ink-500">
                      {body}
                    </p>
                  </Frame>
                </Wipe>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

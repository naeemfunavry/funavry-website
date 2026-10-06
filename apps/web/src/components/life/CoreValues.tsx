import {
  BookOpen,
  BrainCircuit,
  Flag,
  Handshake,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import { Wipe } from "@/components/ui/Kinetic";

/* The three logo hues, "r,g,b", cycled along the values. */
const AZURE = "68,158,216";
const AMBER = "245,159,19";
const STEEL = "55,96,121";

const VALUES: { title: string; body: string; icon: LucideIcon; tint: string }[] = [
  {
    title: "AI-Driven Innovation",
    body: "AI built into how we work.",
    icon: BrainCircuit,
    tint: AZURE,
  },
  {
    title: "Client-Centric Mindset",
    body: "Your outcomes set our priorities.",
    icon: Handshake,
    tint: AMBER,
  },
  {
    title: "Engineering Excellence",
    body: "Rigorous, production-grade work.",
    icon: Wrench,
    tint: STEEL,
  },
  {
    title: "Trust & Integrity",
    body: "We do what we say — securely.",
    icon: ShieldCheck,
    tint: AMBER,
  },
  {
    title: "Ownership & Accountability",
    body: "We own outcomes, end to end.",
    icon: Flag,
    tint: AZURE,
  },
  {
    title: "Continuous Learning",
    body: "Always sharpening our craft.",
    icon: BookOpen,
    tint: STEEL,
  },
];

/**
 * The principles the team works by: the heading row, then the six values as
 * framed cards, each with an icon tile in one of the logo's hues.
 */
export default function CoreValues() {
  return (
    <section
      aria-labelledby="life-values"
      className="relative overflow-hidden border-b border-line bg-paper-white"
    >
      <Container wide className="relative z-10 py-8 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-amber" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Our Core Values
              </span>
            </div>
            <h2 id="life-values" className="mt-6 text-h3 text-ink">
              The principles that{" "}
              <span className="text-azure-ink">guide us.</span>
            </h2>
          </div>
          <p className="max-w-[46ch] text-[15.5px] leading-[1.7] text-ink-500">
            Our values shape how we work, make decisions and support each
            other. They sit at the heart of our culture and everything we build.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 xl:grid-cols-6">
          {VALUES.map(({ title, body, icon: Icon, tint }, i) => (
            <li key={title} className="h-full">
              <Wipe delay={i * 0.06} className="h-full">
                <Frame
                  tint={tint}
                  className="group/value h-full"
                  innerClassName="flex h-full flex-col p-6"
                >
                  <div className="flex items-start justify-between">
                    <span
                      style={{ "--tint": tint } as React.CSSProperties}
                      className="flex h-12 w-12 items-center justify-center border border-[rgba(var(--tint),0.3)] bg-[rgba(var(--tint),0.1)] text-[rgb(var(--tint))] transition-colors duration-300 group-hover/value:border-[rgb(var(--tint))] group-hover/value:bg-[rgb(var(--tint))] group-hover/value:text-paper"
                    >
                      <Icon size={21} strokeWidth={1.6} aria-hidden />
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.12em] text-ink-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
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
      </Container>
    </section>
  );
}

import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import { SERVICES, type Service } from "@/lib/services";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services — Funavry Technologies",
  description:
    "Sixteen practices across technology engineering and global business services, mapped to one delivery model: build, automate, operate.",
};

/* Each practice sits in a phase of Build → Automate → Operate, and wears that
   phase's logo hue — the same system the home page's capabilities section runs
   on. */
const PHASE = {
  Build: { tint: "68,158,216", dot: "bg-azure", text: "text-azure-ink" },
  Automate: { tint: "245,159,19", dot: "bg-amber", text: "text-amber-ink" },
  Operate: { tint: "55,96,121", dot: "bg-steel", text: "text-steel-ink" },
} as const;

const GROUPS = [
  { key: "tech", label: "Technology & Engineering" },
  { key: "gbs", label: "Global Business Services" },
] as const;

function ServiceCard({ service }: { service: Service }) {
  const phase = PHASE[service.phase];
  return (
    <Frame
      as="article"
      tint={phase.tint}
      className="h-full"
      innerClassName="flex h-full flex-col p-6 lg:p-7"
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2">
          <span aria-hidden className={cn("h-1 w-1 rounded-full", phase.dot)} />
          <span
            className={cn(
              "font-mono text-[9.5px] uppercase tracking-[0.16em]",
              phase.text,
            )}
          >
            {service.phase}
          </span>
        </span>
        <span aria-hidden className="h-px w-4 bg-line-strong" />
        <span className="font-mono text-[9.5px] tracking-[0.16em] text-ink-400">
          {service.n}
        </span>
      </div>

      {/* h2 sits under the page's single h1 — no level skipped. */}
      <h2 className="mt-4 text-[20px] font-medium leading-snug tracking-[-0.02em] text-ink lg:text-[22px]">
        {service.title}
      </h2>

      <p className="mt-3 text-[14px] leading-[1.7] text-ink-500">
        {service.summary}
      </p>

      <ul className="mt-6 grid gap-3.5 border-t border-line pt-5">
        {service.subs.map((sub) => (
          <li key={sub.title} className="flex gap-3">
            <span
              aria-hidden
              className="mt-[7px] h-1 w-1 flex-none rounded-full"
              style={{ background: `rgb(${phase.tint})` }}
            />
            <div>
              <p className="text-[13.5px] font-medium leading-snug text-ink">
                {sub.title}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-ink-400">
                {sub.desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export default function ServicesPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden border-b border-line bg-paper-deep pt-[130px]">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />

          <Container wide className="relative z-10 pb-24 pt-16 lg:pb-28 lg:pt-20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-end lg:gap-20">
              <div>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 flex-none bg-azure" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                    Services
                  </span>
                </div>
                <h1 className="mt-6 text-h1 text-ink">
                  <KineticWords text="Sixteen practices," trigger="mount" />
                  <br />
                  <KineticWords
                    text="one delivery model."
                    delay={0.12}
                    trigger="mount"
                  />
                </h1>
              </div>

              <Wipe delay={0.2}>
                <p className="text-[16px] leading-[1.75] text-ink-500">
                  Technology engineering and global business services, mapped to
                  a single chain. Each practice sits where it creates value —
                  across{" "}
                  <span className="font-medium text-azure">build</span>,{" "}
                  <span className="font-medium text-amber-ink">automate</span>,
                  and <span className="font-medium text-steel">operate</span> —
                  and can be engaged on its own or as one.
                </p>
              </Wipe>
            </div>

            {/* Phase legend — the three-part chain, read once. */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              {(
                [
                  ["Build", "Engineer the platform"],
                  ["Automate", "Put AI to work"],
                  ["Operate", "Run it at scale"],
                ] as const
              ).map(([name, blurb], i) => {
                const phase = PHASE[name];
                return (
                  <div key={name} className="flex items-center gap-2.5">
                    {i > 0 && (
                      <span
                        aria-hidden
                        className="mr-3.5 hidden text-line-strong sm:inline"
                      >
                        →
                      </span>
                    )}
                    <span
                      aria-hidden
                      className={cn("h-1.5 w-1.5 rounded-full", phase.dot)}
                    />
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-[0.16em]",
                        phase.text,
                      )}
                    >
                      {name}
                    </span>
                    <span className="text-[12.5px] text-ink-400">{blurb}</span>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        {/* The practices, grouped by side of the business. */}
        <section className="relative overflow-hidden bg-paper">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />

          <Container wide className="relative z-10 py-20 lg:py-28">
            {GROUPS.map((group, gi) => {
              const items = SERVICES.filter((s) => s.group === group.key);
              return (
                <div key={group.key} className={cn(gi > 0 && "mt-20 lg:mt-28")}>
                  <div className="flex items-center gap-4">
                    <span
                      aria-hidden
                      className={cn(
                        "h-px w-10 flex-none",
                        group.key === "tech" ? "bg-azure" : "bg-amber",
                      )}
                    />
                    <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-ink-500">
                      {group.label}
                    </h2>
                    <span className="font-mono text-[11px] tracking-[0.16em] text-ink-400">
                      {String(items.length).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
                    {items.map((service) => (
                      <ServiceCard key={service.n} service={service} />
                    ))}
                  </div>
                </div>
              );
            })}

            <Rule className="mt-20 lg:mt-28" />
          </Container>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}

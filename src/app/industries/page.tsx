import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import { INDUSTRIES, type Industry } from "@/lib/industries";

export const metadata: Metadata = {
  title: "Industries — Funavry Technologies",
  description:
    "Ten industries with deep domain fluency: healthcare, financial services, media, government, supply chain, manufacturing, industrial IoT, education, commerce, and enterprise systems.",
};

/* A little colour rhythm across the grid — the three logo hues, cycled — so ten
   photographic cards don't all wear the same tick colour. */
const TINTS = ["68,158,216", "245,159,19", "55,96,121"] as const;

function IndustryCard({ industry, i }: { industry: Industry; i: number }) {
  return (
    <Frame
      as="article"
      tint={TINTS[i % TINTS.length]}
      className="h-full"
      innerClassName="flex h-full flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-line">
        <Image
          src={industry.image}
          alt={industry.name}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
          className="object-cover transition-transform duration-700 ease-expo group-hover/frame:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-900/25 to-transparent"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-7">
        {/* h2 sits under the page's single h1 — no level skipped. */}
        <h2 className="text-[18px] font-medium leading-snug tracking-[-0.02em] text-ink lg:text-[20px]">
          {industry.name}
        </h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-ink-500">
          {industry.desc}
        </p>
        <div className="mt-auto flex items-center gap-2.5 pt-6">
          <span aria-hidden className="h-1 w-1 flex-none rounded-full bg-azure" />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-400">
            {industry.proof}
          </span>
        </div>
      </div>
    </Frame>
  );
}

export default function IndustriesPage() {
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
                    Industries
                  </span>
                </div>
                <h1 className="mt-6 text-h1 text-ink">
                  <KineticWords text="Ten industries," trigger="mount" />
                  <br />
                  <KineticWords
                    text="deep domain fluency."
                    delay={0.12}
                    trigger="mount"
                  />
                </h1>
              </div>

              <Wipe delay={0.2}>
                <p className="text-[16px] leading-[1.75] text-ink-500">
                  Five hundred delivered projects across the sectors we know
                  cold. Not a vertical playbook applied everywhere — real domain
                  fluency, earned platform by platform, in the industries where
                  the constraints are the hardest part.
                </p>
              </Wipe>
            </div>
          </Container>
        </section>

        <section className="relative overflow-hidden bg-paper">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />

          <Container wide className="relative z-10 py-16 lg:py-24">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {INDUSTRIES.map((industry, i) => (
                <IndustryCard key={industry.name} industry={industry} i={i} />
              ))}
            </div>

            <Rule className="mt-16 lg:mt-24" />
          </Container>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}

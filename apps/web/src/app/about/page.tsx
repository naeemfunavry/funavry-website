import type { Metadata } from "next";
import Image from "next/image";
import { BrainCircuit, LayoutGrid, Server } from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import { getLeaders, getStats } from "@/lib/api";
import Contact from "@/components/sections/Contact";
import Footprint from "@/components/sections/Footprint";
import Gallery, { type GalleryPhoto } from "@/components/sections/Gallery";
import { TrustedStrip } from "@/components/sections/Clients";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import Button from "@/components/ui/Button";
import PageHero, { HeroStats } from "@/components/ui/PageHero";
import { SectionLabel } from "@/components/ui/DetailParts";
import { Wipe } from "@/components/ui/Kinetic";
import { CASE_PHASE } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "About Us",
  description:
    "Funavry is an AI-first engineering and Global Business Services partner. Since 2018 we have built modern platforms, automated the work inside them, and operated them at global scale — 500+ projects, 200+ engineers, offices in the US, Saudi Arabia and Pakistan, and delivery across nine countries.",
};

/* Every figure here is an approved company fact, the same ones the home page's
   Proof section and the footer carry. Nothing is invented for this page. */

const MODEL = [
  {
    phase: "Build" as const,
    icon: LayoutGrid,
    line: "Design and engineer the platform.",
    body: "Product design, digital engineering, data and the systems underneath — the modern platform your business runs on, built to last.",
  },
  {
    phase: "Automate" as const,
    icon: BrainCircuit,
    line: "Put AI to work on top of it.",
    body: "Artificial intelligence, intelligent automation and document intelligence applied to the work inside the platform, so the process moves faster than the headcount.",
  },
  {
    phase: "Operate" as const,
    icon: Server,
    line: "Run it at scale.",
    body: "Managed services, cloud and security, and global teams through GBS operating models — we keep the platform running so outcomes hold once the build is done.",
  },
];

/* Life at Funavry — the company's own photographs, in /public/about. Add a
   photo by dropping it in that folder and listing it here with its pixel
   size; the strip takes any number. */
const GALLERY: GalleryPhoto[] = [
  {
    src: "/about/team-2.webp",
    alt: "Engineers at work on the open-plan floor of the Funavry delivery center",
    caption: "The engineering floor",
    width: 5712,
    height: 4284,
  },
  {
    src: "/about/team.webp",
    alt: "The Funavry team gathered outside the Islamabad engineering centre",
    caption: "The Funavry team · Islamabad",
    width: 680,
    height: 416,
  },
  {
    src: "/about/team-3.webp",
    alt: "The games room at the Funavry delivery center, with a table-tennis table and a graffiti wall",
    caption: "Time out · the games room",
    width: 4032,
    height: 3024,
  },
];

/**
 * About:
 *
 *   hero → trusted by → who we are → how we work → leadership →
 *   life at Funavry → footprint → contact
 *
 * The same frame as the industry and service pages: a dark photographic hero,
 * a centred statement, then lean sections under the site's section label.
 */
export default async function AboutPage() {
  const [chrome, STATS, LEADERS] = await Promise.all([
    getChrome(),
    getStats("about"),
    getLeaders(),
  ]);

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        <PageHero
          image={{ src: "/about/team-2.webp", position: "center 40%" }}
          eyebrow="About Funavry"
          title={["An AI-first partner that", "builds, automates and operates."]}
          body="Funavry is an AI-first technology and Global Business Services company. We build modern platforms, automate the work inside them, and operate them at global scale — so our clients get outcomes, not just software."
          actions={
            <>
              <Button href="/contact" variant="accent" size="md" arrow>
                Work with us
              </Button>
              <Button href="/case-studies" variant="outline" size="md">
                Our work
              </Button>
            </>
          }
        >
          <HeroStats stats={STATS} />
        </PageHero>

        {/* ------------------------------------------------ Trusted ----
            The home page's client strip, as its own band under the hero. */}
        <section aria-label="Trusted by" className="border-b border-line bg-paper">
          <Container wide>
            <TrustedStrip className="border-t-0" />
          </Container>
        </section>

        {/* ------------------------------------------------ Who we are ----
            One centred statement, as the industry page opens with. */}
        <section className="relative overflow-hidden border-b border-line bg-paper-deep">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
          <Container wide className="relative z-10 py-16 lg:py-20">
            <div className="mx-auto max-w-[860px] text-center">
              <h2 className="text-h3 text-ink">Who We Are</h2>
              <span
                aria-hidden
                className="mx-auto mt-6 block h-px w-full bg-line-strong"
              />
              <p className="mx-auto mt-6 max-w-[62ch] text-[17px] leading-[1.75] text-ink-500 lg:text-[18px]">
                Founded in <strong className="font-semibold text-ink">2018</strong>,
                Funavry is a team of{" "}
                <strong className="font-semibold text-ink">
                  200+ engineers and specialists
                </strong>{" "}
                who have delivered{" "}
                <strong className="font-semibold text-ink">500+ projects</strong>{" "}
                from a 25,000 sq ft engineering and delivery center and offices
                in the United States, Saudi Arabia and Pakistan. AI runs through
                everything we do — the build, the automation and the operation
                alike.
              </p>
            </div>
          </Container>
        </section>

        {/* ------------------------------------------------ How we work ---- */}
        <section
          aria-labelledby="about-model"
          className="border-b border-line bg-paper-white"
        >
          <Container wide className="py-16 lg:py-24">
            <SectionLabel id="about-model">How We Work</SectionLabel>
            <ol className="mt-8 grid gap-6 md:grid-cols-3 lg:mt-10">
              {MODEL.map((m, i) => {
                const phase = CASE_PHASE[m.phase];
                const Icon = m.icon;
                return (
                  <li key={m.phase} className="h-full">
                    <Wipe delay={i * 0.06} className="h-full">
                      <Frame
                        tint={phase.tint}
                        className="h-full"
                        innerClassName="flex h-full flex-col p-6 lg:p-8"
                      >
                        <span
                          className="flex h-12 w-12 items-center justify-center border border-line bg-paper"
                          style={{ color: `rgb(${phase.tint})` }}
                        >
                          <Icon size={20} strokeWidth={1.6} aria-hidden />
                        </span>
                        <span className="mt-6 flex items-center gap-2">
                          <span
                            aria-hidden
                            className={cn("h-1.5 w-1.5 rounded-full", phase.dot)}
                          />
                          <span
                            className={cn(
                              "font-mono text-[10px] uppercase tracking-[0.18em]",
                              phase.text,
                            )}
                          >
                            {m.phase}
                          </span>
                        </span>
                        <h3 className="mt-3 text-[19px] font-medium leading-snug tracking-[-0.015em] text-ink">
                          {m.line}
                        </h3>
                        <p className="mt-3 text-[14.5px] leading-[1.7] text-ink-500">
                          {m.body}
                        </p>
                      </Frame>
                    </Wipe>
                  </li>
                );
              })}
            </ol>
          </Container>
        </section>

        {/* --------------------------------------------- Leadership ---- */}
        {LEADERS.length > 0 && (
          <section
            aria-labelledby="about-leadership"
            className="bg-paper"
          >
            <Container wide className="py-16 lg:py-24">
              <SectionLabel id="about-leadership">Leadership</SectionLabel>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
                {LEADERS.map((leader) => (
                  <li key={leader.name}>
                    <Frame
                      as="article"
                      tint="68,158,216"
                      className="h-full"
                      innerClassName="flex h-full flex-col"
                    >
                      {/* Portrait slot — always reserved, filled by an initials
                          placeholder until a real photo is supplied. */}
                      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-paper-deep">
                        {leader.photo ? (
                          <Image
                            src={leader.photo}
                            alt={`${leader.name}, ${leader.role}`}
                            fill
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 320px"
                            className="object-cover object-top"
                          />
                        ) : (
                          <div className="absolute inset-0 grid-paper">
                            <div className="flex h-full items-center justify-center">
                              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line-strong bg-paper-white font-mono text-[18px] tracking-[0.04em] text-ink-500">
                                {leader.initials}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                        <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                          {leader.name}
                        </h3>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-azure-ink">
                          {leader.role}
                        </p>
                        <ul className="mt-4 space-y-2 border-t border-line pt-4 text-[13px] leading-[1.6] text-ink-500">
                          {leader.points.map((point) => (
                            <li key={point} className="flex gap-2.5">
                              <span
                                aria-hidden
                                className="mt-[7px] h-1 w-1 flex-none rounded-full bg-azure"
                              />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Frame>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )}

        <Gallery title="Life at Funavry." photos={GALLERY} />

        <Footprint
          offices={chrome.offices}
          deliveryCountries={chrome.deliveryCountries}
          eyebrow="Global footprint"
          title="One team, delivering worldwide."
        />

        <Contact />
      </main>
      <Footer
        offices={chrome.offices}
        deliveryCountries={chrome.deliveryCountries}
        socials={chrome.socials}
      />
    </>
  );
}

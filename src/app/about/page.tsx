import type { Metadata } from "next";
import Image from "next/image";
import { BrainCircuit, LayoutGrid, Server } from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Contact from "@/components/sections/Contact";
import { TrustedStrip } from "@/components/sections/Clients";
import DirectLine from "@/components/sections/DirectLine";
import Footprint from "@/components/sections/Footprint";
import SelectedWork from "@/components/sections/SelectedWork";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import Button from "@/components/ui/Button";
import BrandPanel from "@/components/ui/BrandPanel";
import { Eyebrow, TextLink } from "@/components/ui/SectionLabel";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { CASE_PHASE } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us — Funavry Technologies",
  description:
    "Funavry is an AI-first engineering and Global Business Services partner. Since 2018 we have built modern platforms, automated the work inside them, and operated them at global scale — 500+ projects, 200+ engineers, offices in the US, Saudi Arabia and Pakistan, and delivery across nine countries.",
};

/**
 * The hero's company image.
 *
 * A reserved slot, the same convention as the leadership portraits below and
 * the case-study screenshots: set `src` and the photo fills the hero panel;
 * leave it empty and the panel shows the brand arcs at the same dimensions, so
 * dropping the file in later changes no layout. `alt` and `caption` live here
 * too, so the description can never drift from the picture.
 *
 * Asset spec is in `public/about/README.md`.
 */
const ABOUT_IMAGE = {
  src: "", // e.g. "/about/team.webp"
  alt: "",
  caption: "Islamabad · 17,000 sq ft engineering & delivery center",
};

/* Every figure here is an approved company fact, the same ones the home page's
   Proof section and the footer carry. Nothing is invented for this page. */
const STATS = [
  { value: "2018", label: "Founded" },
  { value: "500+", label: "Projects delivered" },
  { value: "200+", label: "Engineers & specialists" },
  { value: "17K", label: "Sq ft facility" },
];

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

/* The leadership team, verbatim from the company profile. Portraits live under
   /public/team when supplied; until then each card holds its space with an
   initials placeholder, so a real photo drops into the same slot with no
   layout change. Nothing here is invented — these are the profile's own bios. */
const LEADERS = [
  {
    name: "Dr. Adnan Tariq",
    role: "Founder & CEO",
    initials: "AT",
    photo: "/team/dr.adnan-tariq.png", // e.g. "/team/adnan-tariq.webp"
    points: [
      "PhD (Stuttgart) · Post-Doc (Georgia Tech)",
      "20+ years in technology leadership",
      "AI, cloud, blockchain, IoT & data platforms",
      "Drives Funavry's AI-first strategy",
    ],
  },
  {
    name: "Salman Tariq",
    role: "Chief Business Officer",
    initials: "ST",
    photo: "",
    points: [
      "20+ years in business development",
      "Strategic partnerships & client engagement",
      "Global growth across industries",
      "Aligns business goals with technology",
    ],
  },
  {
    name: "Imran Khawar",
    role: "Chief Technology Officer",
    initials: "IK",
    photo: "",
    points: [
      "30+ years in technology leadership",
      "Enterprise architecture & cloud-native platforms",
      "Product engineering & modern practices",
      "Secure, scalable, high-performing systems",
    ],
  },
  {
    name: "Imran Ashraf",
    role: "Chief GBS Officer",
    initials: "IA",
    photo: "",
    points: [
      "30+ years in Finance & Shared Services",
      "GBS, SSC & GCC strategy & operating-model design",
      "Service delivery excellence & transformation",
      "Governance, organization & change management",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* ---------------------------------------------------- Hero ---- */}
        <section className="relative overflow-hidden border-b border-line bg-paper-deep pt-[130px]">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />

          <Container wide className="relative z-10 pb-16 pt-12 lg:pb-24 lg:pt-16">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,640px)] lg:items-center lg:gap-16">
              <div>
                <Eyebrow label="About Funavry" />

                <h1 className="mt-6 max-w-[20ch] text-h2 text-ink">
                  <KineticWords
                    text="An AI-first partner that"
                    trigger="mount"
                  />
                  <br />
                  <KineticWords
                    text="builds, automates and operates."
                    delay={0.12}
                    trigger="mount"
                  />
                </h1>

                <Wipe delay={0.15}>
                  <p className="mt-8 max-w-[52ch] text-[16px] leading-[1.8] text-ink-500 lg:text-[17px]">
                    Funavry is an AI-first technology and Global Business
                    Services company. We build modern platforms, automate the
                    work inside them, and operate them at global scale — so our
                    clients get outcomes, not just software.
                  </p>
                </Wipe>

                <Wipe delay={0.22}>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <Button
                      href="/contact"
                      variant="accent"
                      size="lg"
                      arrow
                      className="w-full sm:w-auto"
                    >
                      Work with us
                    </Button>
                    <Button
                      href="/case-studies"
                      variant="secondary"
                      size="lg"
                      arrow
                      className="w-full sm:w-auto"
                    >
                      Explore our case studies
                    </Button>
                  </div>
                </Wipe>

                <Wipe delay={0.3}>
                  <dl className="mt-14 grid grid-cols-2 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
                    {STATS.map((s, i) => (
                      <div
                        key={s.label}
                        className={cn(
                          "flex flex-col-reverse justify-end pr-4",
                          i > 0 && "sm:border-l sm:border-line sm:pl-6",
                        )}
                      >
                        <dt className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-400">
                          {s.label}
                        </dt>
                        <dd className="text-[26px] font-medium leading-none tracking-[-0.03em] text-ink">
                          {s.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Wipe>
              </div>

              <Wipe delay={0.2}>
                <BrandPanel
                  label="Since 2018"
                  caption={ABOUT_IMAGE.caption}
                  image={
                    ABOUT_IMAGE.src
                      ? { src: ABOUT_IMAGE.src, alt: ABOUT_IMAGE.alt }
                      : undefined
                  }
                />
              </Wipe>
            </div>
          </Container>
        </section>

        {/* ------------------------------------------------ Trusted ---- */}
        {/* The hero above already draws the dividing rule, so the strip's own
            top border is dropped. */}
        <section className="border-b border-line bg-paper-white">
          <Container wide>
            <TrustedStrip className="border-t-0" />
          </Container>
        </section>

        {/* ------------------------------------------------ Who we are ---- */}
        <section className="border-b border-line bg-paper">
          <Container wide className="py-16 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
              <div>
                <Eyebrow label="Who we are" />
                <h2 className="mt-6 max-w-[16ch] text-h3 text-ink">
                  Engineering and operations, under one delivery model.
                </h2>
                <div className="mt-8">
                  <TextLink href="/industries">Industries we serve</TextLink>
                </div>
              </div>

              <div className="grid gap-6 text-[15.5px] leading-[1.85] text-ink-500 md:grid-cols-2 md:gap-10 lg:text-[16px]">
                <p className="md:col-span-2 text-[18px] leading-[1.7] text-ink lg:text-[20px]">
                  Founded in 2018, Funavry has grown into a team of more than
                  200 engineers and specialists who have delivered over 500
                  projects across industries worldwide, from a
                  17,000-square-foot engineering and delivery center and
                  regional offices in the United States, Saudi Arabia and
                  Pakistan, delivering across nine countries.
                </p>
                <p className="border-t border-line pt-6">
                  We pair sixteen technology and global-business-services
                  practices with a single way of working: design and engineer
                  the platform, put AI to work on top of it, and run it at
                  scale. It is the same model behind every engagement, whether
                  we are standing up a new product or taking an operation off
                  spreadsheets and onto software.
                </p>
                <p className="border-t border-line pt-6">
                  AI is not a side practice here — it runs through the build,
                  the automation and the operation alike. That is what lets a
                  small, senior team ship the kind of platforms that usually
                  take far more people to move.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ----------------------------------------- Build/Automate/Operate ---- */}
        <section className="border-b border-line bg-paper">
          <Container wide className="py-16 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
              <div>
                <Eyebrow label="How we work" />
                <h2 className="mt-6 text-h3 text-ink">
                  Build. Automate. Operate.
                </h2>
                <p className="mt-5 max-w-[40ch] text-[15px] leading-[1.8] text-ink-500">
                  Technology engineering and global business services, mapped
                  to a single chain — engaged on its own or as one.
                </p>
                <div className="mt-8">
                  <TextLink href="/services">Explore all capabilities</TextLink>
                </div>
              </div>

              <ol className="grid gap-5 md:grid-cols-3">
                {MODEL.map((m, i) => {
                  const phase = CASE_PHASE[m.phase];
                  const Icon = m.icon;
                  return (
                    <li key={m.phase}>
                      <Frame
                        tint={phase.tint}
                        className="h-full"
                        innerClassName="flex h-full flex-col p-6 lg:p-7"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span
                            className="flex h-10 w-10 flex-none items-center justify-center border border-line"
                            style={{ color: `rgb(${phase.tint})` }}
                          >
                            <Icon size={18} strokeWidth={1.6} />
                          </span>
                          <span className="font-mono text-[10px] tracking-[0.16em] text-ink-400">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                          <span
                            aria-hidden
                            className={cn("h-1 w-1 rounded-full", phase.dot)}
                          />
                          <span
                            className={cn(
                              "font-mono text-[10px] uppercase tracking-[0.18em]",
                              phase.text,
                            )}
                          >
                            {m.phase}
                          </span>
                        </div>
                        <h3 className="mt-3 text-[18px] font-medium leading-snug tracking-[-0.015em] text-ink">
                          {m.line}
                        </h3>
                        <p className="mt-3 text-[14px] leading-[1.7] text-ink-500">
                          {m.body}
                        </p>
                      </Frame>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Container>
        </section>

        {/* --------------------------------------------- Leadership ---- */}
        <section className="bg-paper">
          <Container wide className="py-16 lg:py-24">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-end lg:gap-16">
              <div>
                <Eyebrow label="Leadership" />
                <h2 className="mt-6 text-h3 text-ink">
                  Global leadership team.
                </h2>
              </div>
              <p className="max-w-[56ch] text-[15px] leading-[1.8] text-ink-500">
                A senior team spanning engineering, business and global business
                services — the people who set how Funavry builds, automates and
                operates.
              </p>
            </div>

            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {LEADERS.map((leader) => (
                <li key={leader.name}>
                  <Frame
                    as="article"
                    tint="68,158,216"
                    className="h-full"
                    innerClassName="flex h-full flex-col p-3"
                  >
                    {/* Portrait slot — always reserved, filled by an initials
                        placeholder until a real photo is supplied. */}
                    <div className="relative aspect-[4/3] overflow-hidden border border-line bg-paper-deep">
                      {leader.photo ? (
                        <Image
                          src={leader.photo}
                          alt={`${leader.name}, ${leader.role}`}
                          fill
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 300px"
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

                    <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
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

        <Footprint
          eyebrow="Global footprint"
          title="One team, delivering worldwide."
          action={{ label: "Contact the team", href: "/contact" }}
        />

        <SelectedWork />

        <DirectLine
          eyebrow="Work with us"
          title="Have a platform in mind?"
          body="Tell us where you are — an idea, a platform under pressure, or an operation ready to scale. We come back within one business day with a point of view, not a sales script."
          cta={{ label: "Contact us", href: "/contact" }}
        />

        <Contact />
      </main>
      <Footer />
    </>
  );
}

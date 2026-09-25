import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import { getServices } from "@/lib/api";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import TechCarousel from "@/components/services/TechCarousel";
import GbsTimeline from "@/components/services/GbsTimeline";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "Services",
  description:
    "Sixteen practices across technology engineering and global business services, mapped to one delivery model: build, automate, operate.",
};

/** A section's opening: eyebrow and title on the left, a line of context on
    the right — the listing hero's layout, one size down. */
function GroupHead({
  id,
  label,
  title,
  hue,
  children,
}: {
  id: string;
  label: string;
  title: string;
  hue: "bg-azure" | "bg-amber";
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end lg:gap-20">
      <div>
        <div className="flex items-center gap-3">
          <span aria-hidden className={cn("h-px w-10 flex-none", hue)} />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
            {label}
          </span>
        </div>
        <h2 id={id} className="mt-5 text-h3 text-ink">
          <KineticWords text={title} />
        </h2>
      </div>
      <Wipe delay={0.1}>
        <p className="text-[15px] leading-[1.75] text-ink-500">{children}</p>
      </Wipe>
    </div>
  );
}

export default async function ServicesPage() {
  const [chrome, SERVICES] = await Promise.all([getChrome(), getServices()]);

  const tech = SERVICES.filter((s) => s.group === "tech");
  const gbs = SERVICES.filter((s) => s.group === "gbs");

  return (
    <>
      <Nav services={chrome.services} industries={chrome.industries} socials={chrome.socials} />
      <main id="main">
        <section className="relative overflow-hidden border-b border-line bg-paper-deep pt-[130px]">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />

          <Container
            wide
            className="relative z-10 pb-24 pt-16 lg:pb-28 lg:pt-20"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-end lg:gap-20">
              <div>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 flex-none bg-azure" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                    Services
                  </span>
                </div>
                <h1 className="mt-6 text-h2 text-ink">
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
                  across <span className="font-medium text-azure">build</span>,{" "}
                  <span className="font-medium text-amber-ink">automate</span>,
                  and <span className="font-medium text-steel">operate</span> —
                  and can be engaged on its own or as one.
                </p>
              </Wipe>
            </div>
          </Container>
        </section>

        {/* -------------------------------- Technology & Engineering ----
            The product side: a strip of screens, one practice open at a time. */}
        <section
          aria-labelledby="services-tech"
          className="relative overflow-hidden border-b border-line bg-paper"
        >
          <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />
          <Container wide className="relative z-10 py-16 lg:py-24">
            <GroupHead
              id="services-tech"
              label="Technology & Engineering"
              title="The platforms we engineer."
              hue="bg-azure"
            >
              {tech.length} engineering practices — from AI and product
              engineering to cloud, security and data. Pick one to see
              what it covers.
            </GroupHead>
            <div className="mt-10 lg:mt-14">
              <TechCarousel services={tech} />
            </div>
          </Container>
        </section>

        {/* --------------------------------- Global Business Services ----
            The operating side: a line of stops, detail beside the line. */}
        <section
          aria-labelledby="services-gbs"
          className="relative overflow-hidden bg-paper-deep"
        >
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
          <Container wide className="relative z-10 py-16 lg:py-24">
            <GroupHead
              id="services-gbs"
              label="Global Business Services"
              title="The operations we run."
              hue="bg-amber"
            >
              {gbs.length} business services that keep the organisation
              running — delivered from our centres, measured on outcomes.
            </GroupHead>
            <div className="mt-12 lg:mt-16">
              <GbsTimeline services={gbs} />
            </div>

            <Rule className="mt-16 lg:mt-24" />
          </Container>
        </section>

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

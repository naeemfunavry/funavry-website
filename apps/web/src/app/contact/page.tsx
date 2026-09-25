import type { Metadata } from "next";
import { ArrowRight, Lightbulb, Mail, MessageSquare, UserCheck } from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Contact from "@/components/sections/Contact";
import Footprint from "@/components/sections/Footprint";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Frame from "@/components/ui/Frame";
import PageHero, { HeroStats } from "@/components/ui/PageHero";
import { SectionLabel } from "@/components/ui/DetailParts";
import { Wipe } from "@/components/ui/Kinetic";
import NeedGrid from "@/components/contact/NeedGrid";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "Contact Us",
  description:
    "Talk to Funavry about a platform to build, a process to automate, or an operation to run. Email hello@funavry.com or reach our offices in the US, Saudi Arabia and Pakistan — we reply within one business day.",
};

const EMAIL = "hello@funavry.com";

/* The path from first message to first conversation, written from the promises
   the site already makes: a person reads it, a reply inside one business day,
   and a point of view rather than a sales script. */
const STEPS = [
  {
    icon: MessageSquare,
    title: "Tell us where you are",
    body: "An idea, a platform under pressure, or an operation ready to scale — through the form below or by email.",
  },
  {
    icon: UserCheck,
    title: "A person reads it",
    body: "Every message is read by a person, and you hear back within one business day.",
  },
  {
    icon: Lightbulb,
    title: "You get a point of view",
    body: "Not a sales script: a view on where the work sits across build, automate and operate.",
  },
];

/**
 * Contact:
 *
 *   hero → what you're looking to solve → what happens next → offices →
 *   the form
 *
 * The same frame as the industry and service pages. The shared closing
 * section carries the form, so there is one form to maintain, not two; the
 * need grid above it pre-fills its subject.
 */
export default async function ContactPage() {
  const chrome = await getChrome();

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        <PageHero
          image={{ src: "/contact/conversation.webp", position: "center 35%" }}
          eyebrow="Contact Us"
          title={["Let's talk about", "what you're building."]}
          body="Tell us where you are — an idea, a platform under pressure, or an operation ready to scale. A person reads every message, and you'll hear back within one business day."
          actions={
            <>
              <Button href="#contact" variant="accent" size="md" arrow>
                Start a conversation
              </Button>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex min-h-[44px] items-center gap-2.5 border border-paper/25 px-5 text-[14px] font-medium text-paper transition-colors duration-300 hover:border-paper/60 hover:bg-paper/[0.06]"
              >
                <Mail size={16} aria-hidden className="text-amber" />
                {EMAIL}
              </a>
            </>
          }
        >
          <HeroStats
            stats={[
              { value: "1 day", label: "Reply time" },
              { value: String(chrome.offices.length), label: "Offices" },
              {
                value: String(chrome.deliveryCountries.length),
                label: "Countries served",
              },
              { value: "200+", label: "Engineers" },
            ]}
          />
        </PageHero>

        {/* ------------------------------------------- What you need ----
            Picking a practice carries it into the form below. */}
        <section
          aria-labelledby="contact-need"
          className="relative overflow-hidden border-b border-line bg-paper-deep"
        >
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
          <Container wide className="relative z-10 py-16 lg:py-24">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <SectionLabel id="contact-need">
                What Are You Looking to Solve?
              </SectionLabel>
              <p className="max-w-[52ch] text-[14.5px] leading-[1.7] text-ink-500">
                Pick the closest fit and we&apos;ll carry it into the form; if
                you&apos;re not sure yet, say so.
              </p>
            </div>
            <div className="mt-8 lg:mt-10">
              <NeedGrid services={chrome.services} />
            </div>
          </Container>
        </section>

        {/* ------------------------------------------- What happens next ---- */}
        <section
          aria-labelledby="contact-next"
          className="bg-paper-white"
        >
          <Container wide className="py-16 lg:py-24">
            <SectionLabel id="contact-next">What Happens Next</SectionLabel>
            <ol className="mt-8 grid gap-6 md:grid-cols-3 lg:mt-10">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="relative h-full">
                    <Wipe delay={i * 0.06} className="h-full">
                      <Frame
                        className="h-full"
                        innerClassName="flex h-full flex-col p-6 lg:p-8"
                      >
                        <span className="flex h-12 w-12 items-center justify-center bg-ink text-paper">
                          <Icon size={20} strokeWidth={1.6} aria-hidden />
                        </span>
                        <h3 className="mt-6 text-[18px] font-medium tracking-[-0.015em] text-ink">
                          {step.title}
                        </h3>
                        <p className="mt-2.5 text-[14.5px] leading-[1.7] text-ink-500">
                          {step.body}
                        </p>
                      </Frame>
                    </Wipe>
                    {i < STEPS.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute -right-[18px] top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-paper-white text-azure-ink md:flex"
                      >
                        <ArrowRight size={14} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </Container>
        </section>

        <Footprint
          offices={chrome.offices}
          deliveryCountries={chrome.deliveryCountries}
        />

        {/* The shared closing section carries the form, the email and the
            compliance strip. */}
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

import type { Metadata } from "next";
import { ArrowRight, Mail } from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Contact from "@/components/sections/Contact";
import { TrustedStrip } from "@/components/sections/Clients";
import DirectLine from "@/components/sections/DirectLine";
import Footprint from "@/components/sections/Footprint";
import SelectedWork from "@/components/sections/SelectedWork";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Frame from "@/components/ui/Frame";
import BrandPanel from "@/components/ui/BrandPanel";
import { Eyebrow, TextLink } from "@/components/ui/SectionLabel";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import NeedGrid from "@/components/contact/NeedGrid";
import { INDUSTRIES } from "@/lib/industries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us — Funavry Technologies",
  description:
    "Talk to Funavry about a platform to build, a process to automate, or an operation to run. Email hello@funavry.com or reach our offices in the US, Saudi Arabia and Pakistan — we reply within one business day.",
};

const EMAIL = "hello@funavry.com";

/* Approved company facts only — the same figures the About page, the Proof
   section and the footer carry. The industry count is read from the list the
   Industries section renders, so the two cannot disagree. */
const STATS = [
  { value: "2018", label: "Founded" },
  { value: "500+", label: "Projects delivered" },
  { value: "200+", label: "Engineers & specialists" },
  { value: `${INDUSTRIES.length}`, label: "Industries" },
];

/* The path from first message to first conversation, written from the promises
   the site already makes: a person reads it, a reply inside one business day,
   and a point of view rather than a sales script. */
const STEPS = [
  {
    title: "Tell us where you are",
    body: "An idea, a platform under pressure, or an operation ready to scale — through the form below or by email.",
  },
  {
    title: "A person reads it",
    body: "Every message is read by a person, and you hear back within one business day.",
  },
  {
    title: "You get a point of view",
    body: "Not a sales script: a view on where the work sits across build, automate and operate.",
  },
];

export default function ContactPage() {
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
                <Eyebrow label="Start a conversation" />

                <h1 className="mt-6 max-w-[16ch] text-h2 text-ink">
                  <KineticWords text="Let's talk about" trigger="mount" />
                  <br />
                  <KineticWords
                    text="what you're building."
                    delay={0.12}
                    trigger="mount"
                  />
                </h1>

                <Wipe delay={0.15}>
                  <p className="mt-8 max-w-[52ch] text-[16px] leading-[1.8] text-ink-500 lg:text-[17px]">
                    Tell us where you are — an idea, a platform under pressure,
                    or an operation ready to scale. A person reads every
                    message, and you&apos;ll hear back within one business day
                    with a point of view, not a sales script.
                  </p>
                </Wipe>

                <Wipe delay={0.22}>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-7">
                    <Button
                      href="#contact"
                      variant="accent"
                      size="lg"
                      arrow
                      className="w-full sm:w-auto"
                    >
                      Start a conversation
                    </Button>
                    <a
                      href={`mailto:${EMAIL}`}
                      className="group inline-flex items-center gap-3 self-start border-b border-line-strong pb-1 text-[15px] font-medium tracking-[-0.01em] text-ink transition-colors hover:border-azure hover:text-azure-ink sm:self-auto"
                    >
                      <Mail size={16} className="text-azure" />
                      {EMAIL}
                    </a>
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
                <BrandPanel />
              </Wipe>
            </div>
          </Container>
        </section>

        {/* ------------------------------------------------ Trusted ---- */}
        {/* The same client strip the home page carries. The hero above already
            draws the dividing rule, so the strip's own top border is dropped. */}
        <section className="border-b border-line bg-paper-white">
          <Container wide>
            <TrustedStrip className="border-t-0" />
          </Container>
        </section>

        {/* ------------------------------------------- What you need ---- */}
        <section className="relative border-b border-line bg-paper">
          <Container wide className="py-16 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
              <div>
                <Eyebrow label="Our services" />
                <h2 className="mt-6 max-w-[14ch] text-h3 text-ink">
                  What are you looking to solve?
                </h2>
                <p className="mt-5 max-w-[40ch] text-[15px] leading-[1.8] text-ink-500">
                  Sixteen practices across technology engineering and global
                  business services, mapped to one chain — build, automate,
                  operate — and engaged on their own or as one. Pick the closest
                  fit and we&apos;ll carry it into the form; if you&apos;re not
                  sure yet, say so.
                </p>
                <div className="mt-8">
                  <TextLink href="/services">Explore all services</TextLink>
                </div>
              </div>

              <NeedGrid />
            </div>
          </Container>
        </section>

        <DirectLine />

        <Footprint />

        {/* ------------------------------------------- What happens next ---- */}
        <section className="border-b border-line bg-paper">
          <Container wide className="py-16 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
              <div>
                <Eyebrow label="Our process" />
                <h2 className="mt-6 text-h3 text-ink">What happens next?</h2>
                <p className="mt-5 max-w-[38ch] text-[15px] leading-[1.8] text-ink-500">
                  From your first message to a real conversation, the path is
                  short — and a person is on it from the start.
                </p>
                <div className="mt-8">
                  <TextLink href="/about">How we work</TextLink>
                </div>
              </div>

              <ol className="grid gap-5 md:grid-cols-3">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="relative">
                    <Frame
                      interactive={false}
                      className="h-full"
                      innerClassName="flex h-full flex-col p-6 lg:p-7"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong font-mono text-[12px] tracking-[0.04em] text-ink">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-6 text-[17px] font-medium tracking-[-0.015em] text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-2.5 text-[14px] leading-[1.7] text-ink-500">
                        {step.body}
                      </p>
                    </Frame>
                    {i < STEPS.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute -right-[14px] top-[42px] z-20 hidden h-6 w-6 items-center justify-center rounded-full border border-line bg-paper text-ink-400 md:flex"
                      >
                        <ArrowRight size={12} />
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>

        <SelectedWork />

        {/* The shared closing section carries the form, the email and the
            compliance strip — the contact page ends on the same surface every
            other page does, so there is one form to maintain, not two. */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}

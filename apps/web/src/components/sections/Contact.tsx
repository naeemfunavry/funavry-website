"use client";

import { useState, type FormEvent } from "react";
import {
  Mail,
  Check,
  ArrowRight,
  CheckCheck,
  Copy,
  Sparkles,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { cn } from "@/lib/utils";

export const INTERESTS = [
  "Build — engineering a platform",
  "Automate — AI inside our processes",
  "Operate — managed services & global teams",
  "Not sure yet",
];

/** Which form option each phase of the delivery model pre-selects. */
export const INTEREST_BY_PHASE = {
  Build: INTERESTS[0],
  Automate: INTERESTS[1],
  /* Orchestration is AI agents wired into process — the Automate option. */
  Orchestrate: INTERESTS[1],
  Operate: INTERESTS[2],
} as const;

/**
 * Anything on the page can pre-fill "What do you need?" by dispatching this on
 * `window` with the option as `detail` — the contact page's practice cards do,
 * so picking one carries the choice down into the form instead of asking twice.
 */
export const INTEREST_EVENT = "funavry:interest";

/** Real certifications from the company profile — nothing invented. */
const CREDENTIALS = [
  "SOC 2 Type II",
  "ISO 27001",
  "HIPAA Compliant",
  "DEA Certified",
];

/**
 * The closing section every page ends on — or, with `variant="page"`, the
 * Contact page's opening: the heading becomes the page's h1, the eyebrow says
 * where you are, and the top clears the fixed nav.
 */
export default function Contact({
  variant = "closing",
}: {
  variant?: "closing" | "page";
} = {}) {
  const page = variant === "page";
  const Heading = page ? "h1" : "h2";
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("hello@funavry.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-paper/10 bg-[#102e54] text-paper"
    >
      {/* Background Engineering Grids and Textures */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 grid-paper-dark pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute inset-0 grain opacity-[0.14] mix-blend-overlay pointer-events-none"
      />

      {/* Atmospheric Aurora Washes */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[180px] -top-[160px] h-[640px] w-[640px] rounded-full bg-azure/[0.18] blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[200px] right-[-100px] h-[600px] w-[600px] rounded-full bg-amber/[0.12] blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-steel/[0.10] blur-[160px]"
      />

      {/* Decorative Technical Crosshairs */}
      {/* Opening the Contact page they drop below the fixed nav, which would
          otherwise sit on top of them. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-8 hidden font-mono text-[11px] text-paper/20 lg:block",
          page ? "top-[100px]" : "top-8",
        )}
      >
        + 00.1
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-8 hidden font-mono text-[11px] text-paper/20 lg:block",
          page ? "top-[100px]" : "top-8",
        )}
      >
        + 00.2
      </div>

      <Container
        wide
        className={cn(
          "relative z-10",
          page
            ? "pb-16 pt-[120px] sm:pb-20 lg:pb-24 lg:pt-[150px]"
            : "py-8 sm:py-12 lg:py-14",
        )}
      >
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,540px)] lg:gap-20 xl:gap-24 items-start">
          {/* Left Column — The closing vision, trust matrix & direct lines */}
          <div>
            {/* Live Indicator Eyebrow */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="relative flex h-2 w-2 flex-none">
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-azure" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-azure" />
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/60">
                {page ? "CONTACT US" : "START A CONVERSATION"}
              </span>
            </div>

            {/* Display Headline */}
            <Heading className="mt-7 text-h2 text-paper">
              <KineticWords text="Let's build what" />
              <br />
              <KineticWords
                text="runs your future"
                delay={0.12}
                wordClassName={() =>
                  "text-azure drop-shadow-[0_0_30px_rgba(68,158,216,0.35)]"
                }
              />
            </Heading>

            {/* Context Paragraph */}
            <Wipe delay={0.18}>
              <p className="mt-8 max-w-[48ch] text-[17px] leading-[1.75] text-paper/65 lg:text-[18px]">
                Tell us where you are — an idea, a platform under pressure, or
                an operation ready to scale. We come back within one business
                day with an engineering point of view, not a sales script.
              </p>
            </Wipe>

            {/* Direct Email Card with Interactive Copy */}
            <Wipe delay={0.24}>
              {/* Both controls share one fixed height so they sit on a single
                  line, edge to edge, rather than centring against each other.
                  They never wrap: on a phone the address takes the spare width
                  and Copy collapses to its icon, where a wrapping row dropped
                  Copy under the address as a mismatched second line. */}
              <div className="mt-9 flex items-center gap-2.5 sm:gap-3.5">
                <a
                  href="mailto:hello@funavry.com"
                  className="group inline-flex h-14 min-w-0 flex-1 items-center gap-3 rounded-xl border px-4 sm:flex-none sm:gap-3.5 sm:px-5 border-paper/15 bg-paper/[0.04] backdrop-blur-md transition-all duration-300 hover:border-azure/50 hover:bg-paper/[0.08] hover:shadow-[0_0_20px_rgba(68,158,216,0.2)]"
                >
                  <div className="hidden h-8 w-8 flex-none items-center justify-center rounded-lg bg-azure/15 min-[380px]:flex text-azure transition-colors group-hover:bg-azure group-hover:text-white">
                    <Mail size={16} />
                  </div>
                  <span className="truncate text-[17px] font-medium tracking-tight text-paper sm:text-[19px]">
                    hello@funavry.com
                  </span>
                  <ArrowRight
                    size={16}
                    className="ml-auto hidden flex-none text-paper/40 transition-transform sm:ml-2 sm:block duration-300 group-hover:translate-x-1 group-hover:text-azure"
                  />
                </a>

                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={copied ? "Email address copied" : "Copy email address"}
                  className="inline-flex h-14 w-14 flex-none items-center justify-center gap-2 rounded-xl border border-paper/15 bg-paper/[0.04] font-mono sm:w-auto sm:px-4 text-[11px] uppercase tracking-wider text-paper/70 backdrop-blur-md transition-all hover:border-azure/40 hover:bg-paper/[0.08] hover:text-paper active:scale-95"
                  title="Copy email to clipboard"
                >
                  {copied ? (
                    <>
                      <CheckCheck size={15} className="text-azure" />
                      <span className="hidden text-azure sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Global Presence Footprint */}
              {/* <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-paper/40">
                <span>Hubs:</span>
                <span className="rounded border border-paper/10 bg-paper/[0.03] px-2 py-0.5 text-paper/70">
                  New York (US)
                </span>
                <span>•</span>
                <span className="rounded border border-paper/10 bg-paper/[0.03] px-2 py-0.5 text-paper/70">
                  Riyadh (KSA)
                </span>
                <span>•</span>
                <span className="rounded border border-paper/10 bg-paper/[0.03] px-2 py-0.5 text-paper/70">
                  Islamabad (PK)
                </span>
              </div> */}
            </Wipe>

            {/* Enterprise Security & Compliance Badges */}
            {/* <Wipe delay={0.36}>
              <div className="mt-10">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40 mb-3">
                  <ShieldCheck size={13} className="text-azure" />
                  <span>Enterprise Compliance &amp; Standards</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CREDENTIALS.map((cred) => (
                    <div
                      key={cred}
                      className="flex items-center gap-2 rounded-lg border border-paper/10 bg-paper/[0.03] px-3 py-2.5 backdrop-blur-sm transition-all hover:border-azure/30 hover:bg-paper/[0.06]"
                    >
                      <Check
                        size={13}
                        strokeWidth={2.5}
                        className="text-azure flex-none"
                      />
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-paper/80">
                        {cred}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Wipe> */}
          </div>

          {/* Right Column — The Glassmorphic Engineering Console */}
          <Wipe delay={0.18}>
            {/* No backdrop blur: at this opacity it was all but invisible, and
                a panel this large re-blurred its backdrop on every scrolled frame.
                A deeper shade of the section's own navy, so the panel and its
                fields read as one with the ground. */}
            <div className="relative overflow-hidden rounded-2xl border border-paper/15 bg-[#0B2342]/90 p-6 shadow-[0_40px_80px_-30px_rgba(4,14,30,0.85)] sm:p-8 lg:p-9">
              {/* Glowing Top Accent Rim */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-azure/0 via-azure to-amber/40"
              />

              {submitted ? (
                /* Success State */
                <div className="flex min-h-[380px] flex-col items-center justify-center text-center py-10 px-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-azure/40 bg-azure/10 text-azure shadow-[0_0_30px_rgba(68,158,216,0.3)]">
                    <Check size={28} strokeWidth={2.5} />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-azure opacity-75" />
                      <span className="relative inline-flex h-4 w-4 rounded-full bg-azure" />
                    </span>
                  </div>

                  <h3 className="mt-7 text-[24px] font-medium tracking-tight text-paper sm:text-[26px]">
                    Inquiry Dispatched
                  </h3>
                  <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-paper/60">
                    Your brief has been routed directly to our engineering
                    leadership. We will review it and reply within one business
                    day.
                  </p>

                  <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-paper/10 bg-paper/[0.04] px-4 py-2 font-mono text-[11px] text-paper/50">
                    <Sparkles size={13} className="text-azure" />
                    <span>Point of view, not a sales script</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-8 font-mono text-[11px] uppercase tracking-wider text-paper/40 underline hover:text-azure transition-colors"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                /* The Engineering Form */
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Name & Work Email in a 2-Column Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="block font-mono text-[10.5px] uppercase tracking-[0.16em] text-paper/60 mb-2"
                      >
                        Full Name <span className="text-azure">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="e.g. Elena Rostova"
                        className="w-full rounded-lg border border-paper/15 bg-[#081C36]/80 px-3.5 py-3 text-[16px] text-paper sm:text-[14.5px] placeholder:text-paper/35 outline-none transition-all duration-200 hover:border-paper/30 focus:border-azure focus:bg-[#0A2546] focus:ring-1 focus:ring-azure/40"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block font-mono text-[10.5px] uppercase tracking-[0.16em] text-paper/60 mb-2"
                      >
                        Work Email <span className="text-azure">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="name@company.com"
                        className="w-full rounded-lg border border-paper/15 bg-[#081C36]/80 px-3.5 py-3 text-[16px] text-paper sm:text-[14.5px] placeholder:text-paper/35 outline-none transition-all duration-200 hover:border-paper/30 focus:border-azure focus:bg-[#0A2546] focus:ring-1 focus:ring-azure/40"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block font-mono text-[10.5px] uppercase tracking-[0.16em] text-paper/60 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Share current challenges, architecture, or scaling objectives..."
                      className="w-full resize-none rounded-lg border border-paper/15 bg-[#081C36]/80 px-3.5 py-3 text-[16px] text-paper sm:text-[14.5px] placeholder:text-paper/35 outline-none transition-all duration-200 hover:border-paper/30 focus:border-azure focus:bg-[#0A2546] focus:ring-1 focus:ring-azure/40"
                    />
                  </div>

                  {/* High-Impact Submit Button */}
                  <button
                    type="submit"
                    className="group relative flex min-h-[46px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-azure px-5 py-2.5 font-medium text-ink-900 shadow-[0_0_24px_rgba(68,158,216,0.35)] transition-all duration-300 hover:bg-azure-300 sm:ms-auto sm:w-auto hover:shadow-[0_0_36px_rgba(68,158,216,0.55)] active:scale-[0.99]"
                  >
                    <span className="text-[14px] font-semibold tracking-[-0.01em]">
                      Send Query
                    </span>
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 ease-expo group-hover:translate-x-1.5"
                    />
                  </button>
                </form>
              )}
            </div>
          </Wipe>
        </div>
      </Container>
    </section>
  );
}

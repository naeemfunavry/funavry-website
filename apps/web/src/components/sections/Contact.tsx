"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Mail,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCheck,
  Copy,
  Sparkles,
  Lock,
  Layers,
  Cpu,
  Server,
  Compass,
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

const PHASE_OPTIONS = [
  {
    id: INTERESTS[0],
    phase: "Build",
    label: "Platform & Engineering",
    icon: Layers,
    color: "azure",
    activeClass: "border-azure bg-azure/10 text-paper ring-1 ring-azure/40",
    dotClass: "bg-azure shadow-[0_0_8px_rgba(68,158,216,0.8)]",
  },
  {
    id: INTERESTS[1],
    phase: "Automate",
    label: "AI & Process Automation",
    icon: Cpu,
    color: "amber",
    activeClass: "border-amber bg-amber/10 text-paper ring-1 ring-amber/40",
    dotClass: "bg-amber shadow-[0_0_8px_rgba(245,159,19,0.8)]",
  },
  {
    id: INTERESTS[2],
    phase: "Operate",
    label: "Managed Services & Teams",
    icon: Server,
    color: "steel",
    activeClass: "border-steel-300 bg-steel/20 text-paper ring-1 ring-steel-300/40",
    dotClass: "bg-steel-300 shadow-[0_0_8px_rgba(143,202,235,0.8)]",
  },
  {
    id: INTERESTS[3],
    phase: "Explore",
    label: "Advisory / Not Sure Yet",
    icon: Compass,
    color: "paper",
    activeClass: "border-paper/60 bg-paper/10 text-paper ring-1 ring-paper/30",
    dotClass: "bg-paper/70 shadow-[0_0_8px_rgba(245,246,244,0.6)]",
  },
];

const PROCESS_STEPS = [
  {
    n: "01",
    title: "Submit Brief",
    desc: "Share your platform, AI, or scaling goals.",
  },
  {
    n: "02",
    title: "Architect Review",
    desc: "Direct evaluation by technical leadership under NDA.",
  },
  {
    n: "03",
    title: "Point of View in 24h",
    desc: "Actionable roadmap and high-level architecture view.",
  },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [interest, setInterest] = useState<string>(INTERESTS[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onInterest = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (INTERESTS.includes(detail)) setInterest(detail);
    };
    window.addEventListener(INTEREST_EVENT, onInterest);
    return () => window.removeEventListener(INTEREST_EVENT, onInterest);
  }, []);

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
      className="relative overflow-hidden border-t border-paper/10 bg-ink-900 text-paper"
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
      <div
        aria-hidden
        className="pointer-events-none absolute top-8 left-8 hidden font-mono text-[11px] text-paper/20 lg:block"
      >
        + 00.1
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-8 right-8 hidden font-mono text-[11px] text-paper/20 lg:block"
      >
        + 00.2
      </div>

      <Container wide className="relative z-10 py-20 sm:py-24 lg:py-32">
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
                START A CONVERSATION
              </span>
              <span aria-hidden className="h-3 w-px bg-paper/20" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-azure/30 bg-azure/10 px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-azure-300">
                <Clock size={11} />
                Reply in &lt; 24h
              </span>
            </div>

            {/* Display Headline */}
            <h2 className="mt-7 text-h2 text-paper">
              <KineticWords text="Let's build what" />
              <br />
              <KineticWords
                text="runs your future"
                delay={0.12}
                wordClassName={() =>
                  "text-azure drop-shadow-[0_0_30px_rgba(68,158,216,0.35)]"
                }
              />
            </h2>

            {/* Context Paragraph */}
            <Wipe delay={0.18}>
              <p className="mt-8 max-w-[48ch] text-[17px] leading-[1.75] text-paper/65 lg:text-[18px]">
                Tell us where you are — an idea, a platform under pressure, or an
                operation ready to scale. We come back within one business day
                with an engineering point of view, not a sales script.
              </p>
            </Wipe>

            {/* Direct Email Card with Interactive Copy */}
            <Wipe delay={0.24}>
              <div className="mt-9 flex flex-wrap items-center gap-3.5">
                <a
                  href="mailto:hello@funavry.com"
                  className="group inline-flex items-center gap-3.5 rounded-xl border border-paper/15 bg-paper/[0.04] px-5 py-3.5 backdrop-blur-md transition-all duration-300 hover:border-azure/50 hover:bg-paper/[0.08] hover:shadow-[0_0_20px_rgba(68,158,216,0.2)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-azure/15 text-azure transition-colors group-hover:bg-azure group-hover:text-white">
                    <Mail size={16} />
                  </div>
                  <div className="text-left">
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-paper/40">
                      Direct Channel
                    </div>
                    <span className="text-[17px] font-medium tracking-tight text-paper sm:text-[19px]">
                      hello@funavry.com
                    </span>
                  </div>
                  <ArrowRight
                    size={16}
                    className="ml-2 text-paper/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-azure"
                  />
                </a>

                <button
                  type="button"
                  onClick={copyEmail}
                  className="inline-flex h-[58px] items-center gap-2 rounded-xl border border-paper/15 bg-paper/[0.04] px-4 font-mono text-[11px] uppercase tracking-wider text-paper/70 backdrop-blur-md transition-all hover:border-azure/40 hover:bg-paper/[0.08] hover:text-paper active:scale-95"
                  title="Copy email to clipboard"
                >
                  {copied ? (
                    <>
                      <CheckCheck size={15} className="text-azure" />
                      <span className="text-azure">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Global Presence Footprint */}
              <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-paper/40">
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
              </div>
            </Wipe>

            {/* Engagement Process Strip */}
            <Wipe delay={0.3}>
              <div className="mt-12 border-t border-paper/15 pt-8">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40 mb-4">
                  What Happens Next
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {PROCESS_STEPS.map((step) => (
                    <div
                      key={step.n}
                      className="group relative rounded-lg border border-paper/10 bg-paper/[0.02] p-3.5 transition-colors hover:border-paper/20"
                    >
                      <div className="font-mono text-[11px] font-bold text-azure">
                        {step.n}
                      </div>
                      <div className="mt-1 text-[13.5px] font-medium text-paper">
                        {step.title}
                      </div>
                      <div className="mt-1 text-[11.5px] leading-relaxed text-paper/50">
                        {step.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Wipe>

            {/* Enterprise Security & Compliance Badges */}
            <Wipe delay={0.36}>
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
            </Wipe>
          </div>

          {/* Right Column — The Glassmorphic Engineering Console */}
          <Wipe delay={0.18}>
            <div className="relative rounded-2xl border border-paper/15 bg-ink-900/85 p-6 sm:p-8 lg:p-9 shadow-2xl shadow-black/60 backdrop-blur-xl">
              {/* Glowing Top Accent Rim */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-azure/0 via-azure to-amber/40"
              />

              {/* Console Header Bar */}
              <div className="flex items-center justify-between border-b border-paper/10 pb-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2 w-2 rounded-full bg-azure shadow-[0_0_8px_rgba(68,158,216,0.8)]" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-paper/70">
                    INQUIRY CONSOLE // V2.6
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-paper/40">
                  <Lock size={11} className="text-paper/40" />
                  <span>SECURE CHANNEL</span>
                </div>
              </div>

              {submitted ? (
                /* Success State */
                <div className="flex min-h-[460px] flex-col items-center justify-center text-center py-10 px-4">
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
                    Your brief has been routed directly to our engineering leadership.
                    We will review it and reply within one business day.
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
                <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
                  {/* Phase Selector Segment */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-paper/60">
                        Select Focus Area
                      </label>
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-paper/40">
                        {interest.split(" — ")[0] || "Phase"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {PHASE_OPTIONS.map((opt) => {
                        const isSelected = interest === opt.id;
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setInterest(opt.id)}
                            className={cn(
                              "group relative flex flex-col items-start rounded-lg border p-3 text-left transition-all duration-200",
                              isSelected
                                ? opt.activeClass
                                : "border-paper/10 bg-paper/[0.02] text-paper/70 hover:border-paper/20 hover:bg-paper/[0.05]"
                            )}
                          >
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-all",
                                    isSelected ? opt.dotClass : "bg-paper/30"
                                  )}
                                />
                                <span
                                  className={cn(
                                    "font-mono text-[10px] uppercase font-semibold tracking-wider",
                                    isSelected ? "text-paper" : "text-paper/70"
                                  )}
                                >
                                  {opt.phase}
                                </span>
                              </div>
                              <Icon
                                size={14}
                                className={cn(
                                  "transition-colors",
                                  isSelected ? "text-paper" : "text-paper/40"
                                )}
                              />
                            </div>
                            <span className="mt-1 text-[11.5px] leading-tight text-paper/50 line-clamp-1 group-hover:text-paper/70">
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

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
                        className="w-full rounded-lg border border-paper/15 bg-paper/[0.03] px-3.5 py-3 text-[14.5px] text-paper placeholder:text-paper/25 outline-none transition-all duration-200 hover:border-paper/25 focus:border-azure focus:bg-paper/[0.06] focus:ring-1 focus:ring-azure/40"
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
                        className="w-full rounded-lg border border-paper/15 bg-paper/[0.03] px-3.5 py-3 text-[14.5px] text-paper placeholder:text-paper/25 outline-none transition-all duration-200 hover:border-paper/25 focus:border-azure focus:bg-paper/[0.06] focus:ring-1 focus:ring-azure/40"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label
                      htmlFor="company"
                      className="block font-mono text-[10.5px] uppercase tracking-[0.16em] text-paper/60 mb-2"
                    >
                      Company / Organization
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      placeholder="e.g. Acme Health Corp"
                      className="w-full rounded-lg border border-paper/15 bg-paper/[0.03] px-3.5 py-3 text-[14.5px] text-paper placeholder:text-paper/25 outline-none transition-all duration-200 hover:border-paper/25 focus:border-azure focus:bg-paper/[0.06] focus:ring-1 focus:ring-azure/40"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="message"
                        className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-paper/60"
                      >
                        Tell Us About The Project
                      </label>
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-paper/30">
                        Architecture / Scope
                      </span>
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      placeholder="Share current challenges, architecture, or scaling objectives..."
                      className="w-full resize-none rounded-lg border border-paper/15 bg-paper/[0.03] px-3.5 py-3 text-[14.5px] text-paper placeholder:text-paper/25 outline-none transition-all duration-200 hover:border-paper/25 focus:border-azure focus:bg-paper/[0.06] focus:ring-1 focus:ring-azure/40"
                    />
                  </div>

                  {/* High-Impact Submit Button */}
                  <button
                    type="submit"
                    className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-azure px-6 py-4 text-left font-medium text-white shadow-[0_0_24px_rgba(68,158,216,0.35)] transition-all duration-300 hover:bg-azure-600 hover:shadow-[0_0_36px_rgba(68,158,216,0.55)] active:scale-[0.99]"
                  >
                    <span className="text-[15.5px] font-semibold tracking-[-0.01em]">
                      Send Inquiry
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10.5px] uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
                        DISPATCH
                      </span>
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 ease-expo group-hover:translate-x-1.5"
                      />
                    </div>
                  </button>

                  {/* Assurance & Privacy Footnote */}
                  <div className="flex flex-wrap items-center justify-between gap-y-2 border-t border-paper/10 pt-4 font-mono text-[10px] text-paper/40">
                    <span className="flex items-center gap-1.5">
                      <Lock size={10} className="text-azure" />
                      Mutual NDA Ready
                    </span>
                    <span>Direct to Technical Leads</span>
                    <span>No Sales Scripts</span>
                  </div>
                </form>
              )}
            </div>
          </Wipe>
        </div>
      </Container>
    </section>
  );
}

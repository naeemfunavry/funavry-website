"use client";

import { useState, type FormEvent } from "react";
import { Mail, Check, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";

const INTERESTS = [
  "Build — engineering a platform",
  "Automate — AI inside our processes",
  "Operate — managed services & global teams",
  "Not sure yet",
];

/** Real certifications from the company profile — nothing invented. */
const CREDENTIALS = [
  "SOC 2 Type II",
  "ISO 27001",
  "HIPAA Compliant",
  "DEA Certified",
];

/* Fields sit on the ink panel, so type is paper and the rule is a light hairline. */
const fieldClass =
  "peer w-full border-0 border-b border-paper/20 bg-transparent px-0 py-3.5 text-[16px] text-paper outline-none transition-colors duration-300 placeholder:text-transparent focus:border-azure focus-visible:shadow-none";

const labelClass =
  "pointer-events-none absolute left-0 top-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-paper/40 transition-all duration-300 ease-expo peer-focus:-top-3 peer-focus:text-[9.5px] peer-focus:text-azure peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-[9.5px]";

/* Kept out of the JSX attribute: an escaped quote inside a JSX string literal
   is taken verbatim, which breaks the arbitrary-value url(). */
const chevron =
  "bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23868C8E%22 stroke-width=%222%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')]";

const selectClass = `mt-2 w-full appearance-none border-0 border-b border-paper/20 bg-transparent ${chevron} bg-right bg-no-repeat px-0 py-3.5 text-[16px] text-paper outline-none transition-colors focus:border-azure focus-visible:shadow-none [&>option]:bg-ink [&>option]:text-paper`;

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-line bg-ink text-paper"
    >
      {/* The one dark surface on the site — the page closes on ink. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 grid-paper-dark"
      />
      <div
        aria-hidden
        className="absolute -left-[200px] -top-[200px] h-[560px] w-[560px] rounded-full bg-azure/[0.14] blur-[140px]"
      />
      <div
        aria-hidden
        className="absolute -bottom-[220px] right-[5%] h-[480px] w-[480px] rounded-full bg-amber/[0.08] blur-[140px]"
      />

      <Container wide className="relative z-10 py-16 sm:py-24 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-24">
          {/* Left — the closing statement. */}
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/50">
                04 / Start
              </span>
            </div>

            <h2 className="mt-6 text-h1 text-paper">
              <KineticWords text="Let's build what" />
              <br />
              <KineticWords
                text="runs your future."
                delay={0.12}
                wordClassName={() => "text-azure"}
              />
            </h2>

            <Wipe delay={0.2}>
              <p className="mt-8 max-w-[44ch] text-[17px] leading-[1.75] text-paper/60">
                Tell us where you are — an idea, a platform under pressure, or
                an operation ready to scale. We come back within one business
                day with a point of view, not a sales script.
              </p>
            </Wipe>

            <Wipe delay={0.28}>
              <a
                href="mailto:hello@funavry.com"
                className="group mt-10 inline-flex items-center gap-4 border-b border-paper/20 pb-2 transition-colors hover:border-azure"
              >
                <Mail size={18} className="text-azure" />
                <span className="text-[20px] font-medium tracking-[-0.02em] text-paper lg:text-[24px]">
                  hello@funavry.com
                </span>
                <ArrowRight
                  size={17}
                  className="text-paper/40 transition-transform duration-500 ease-expo group-hover:translate-x-1.5 group-hover:text-azure"
                />
              </a>
            </Wipe>

            {/* Compliance, set as a drafted list rather than badges. */}
            <Wipe delay={0.34}>
              {/* A list of compliance items, not term/definition pairs — a
                  <ul>, not a <dl>. The old <dl> held <dt>s with no <dd>, which
                  is invalid definition-list markup (axe: definition-list). */}
              <ul className="mt-16 grid max-w-[480px] grid-cols-2 gap-px bg-paper/10">
                {CREDENTIALS.map((cred) => (
                  <li
                    key={cred}
                    className="flex items-center gap-3 bg-ink px-4 py-4"
                  >
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      className="flex-none text-azure"
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/70">
                      {cred}
                    </span>
                  </li>
                ))}
              </ul>
            </Wipe>
          </div>

          {/* Right — the form, drawn as underlined fields. */}
          <Wipe delay={0.15}>
            {submitted ? (
              <div className="flex min-h-[480px] flex-col items-center justify-center border border-paper/15 text-center">
                <span className="flex h-14 w-14 items-center justify-center border border-azure text-azure">
                  <Check size={24} strokeWidth={2} />
                </span>
                <h3 className="mt-7 text-[24px] font-medium tracking-[-0.02em] text-paper">
                  Message received.
                </h3>
                <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-paper/50">
                  We&apos;ll come back to you within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-9" noValidate>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder=" "
                    required
                    className={fieldClass}
                  />
                  <label htmlFor="name" className={labelClass}>
                    Full name
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder=" "
                    required
                    className={fieldClass}
                  />
                  <label htmlFor="email" className={labelClass}>
                    Work email
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    placeholder=" "
                    className={fieldClass}
                  />
                  <label htmlFor="company" className={labelClass}>
                    Company
                  </label>
                </div>

                <div className="relative">
                  <label
                    htmlFor="interest"
                    className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-paper/40"
                  >
                    What do you need?
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    defaultValue=""
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select a phase
                    </option>
                    {INTERESTS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder=" "
                    className={`${fieldClass} resize-none`}
                  />
                  <label htmlFor="message" className={labelClass}>
                    Tell us about the project
                  </label>
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-between border border-paper/20 px-7 py-5 text-left transition-colors duration-400 hover:border-azure hover:bg-azure"
                >
                  <span className="text-[15px] font-medium tracking-[-0.01em] text-paper">
                    Send message
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-paper/50 transition-transform duration-500 ease-expo group-hover:translate-x-1 group-hover:text-white"
                  />
                </button>

                <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-paper/30">
                  A person reads this
                </p>
              </form>
            )}
          </Wipe>
        </div>
      </Container>
    </section>
  );
}

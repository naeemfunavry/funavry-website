import { ArrowRight, Mail } from "lucide-react";
import Container from "@/components/ui/Container";
import { Eyebrow, TextLink } from "@/components/ui/SectionLabel";

const EMAIL = "hello@funavry.com";

/* Contour lines behind the email — a static field of offset curves, drawn once
   as SVG rather than animated, so a page runs one canvas, not two. */
const CONTOURS = Array.from({ length: 22 }, (_, i) => {
  const y = 40 + i * 9;
  return `M0 ${y + 60} C 160 ${y - 40 - i * 3}, 300 ${y + 120}, 460 ${y - 10 - i * 2} S 640 ${y - 60}, 720 ${y + 10}`;
});

/**
 * The direct-line band: a short prompt on the left, the email on the right.
 * Shared by the About and Contact pages; the prompt changes, the promise
 * (a person reads it, a reply within one business day) does not.
 */
export default function DirectLine({
  eyebrow = "Let's discuss",
  title = "Have something specific in mind?",
  body = "Tell us about the project in a few lines. We come back within one business day with a point of view, not a sales script.",
  cta = { label: "Start a conversation", href: "#contact" },
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="bg-paper">
      <Container wide className="py-16 lg:py-20">
        <div className="relative overflow-hidden border border-line bg-paper-white">
          <svg
            aria-hidden
            viewBox="0 0 720 300"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[58%] md:block"
          >
            <defs>
              <linearGradient id="contour-fade" x1="0" x2="1">
                <stop offset="0" stopColor="#449ED8" stopOpacity="0" />
                <stop offset="0.45" stopColor="#449ED8" stopOpacity="0.35" />
                <stop offset="1" stopColor="#449ED8" stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <g fill="none" stroke="url(#contour-fade)" strokeWidth="0.8">
              {CONTOURS.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            <rect x="640" y="92" width="8" height="8" fill="#F59F13" />
          </svg>

          <div className="relative grid gap-10 p-7 sm:p-10 md:grid-cols-2 lg:p-14">
            <div>
              <Eyebrow label={eyebrow} />
              <h2 className="mt-5 max-w-[16ch] text-h3 text-ink">{title}</h2>
              <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.8] text-ink-500">
                {body}
              </p>
              <div className="mt-7">
                <TextLink href={cta.href}>{cta.label}</TextLink>
              </div>
            </div>

            <div className="md:border-l md:border-line md:pl-10 lg:pl-14">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                Prefer email?
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="group mt-4 inline-flex items-center gap-3 text-[22px] font-medium tracking-[-0.02em] text-ink transition-colors hover:text-azure-ink lg:text-[28px]"
              >
                <Mail size={20} className="flex-none text-azure" />
                {EMAIL}
                <ArrowRight
                  size={18}
                  className="text-ink-400 transition-transform duration-500 ease-expo group-hover:translate-x-1.5 group-hover:text-azure"
                />
              </a>
              <p className="mt-4 text-[14px] text-ink-500">
                We reply within one business day. A person reads this.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

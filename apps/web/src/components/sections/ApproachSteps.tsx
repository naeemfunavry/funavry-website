import { ArrowRight, type LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";

export type ApproachStep = {
  title: string;
  desc: string;
  icon: LucideIcon;
};

/**
 * A practice page's process, drawn as a left-to-right run of numbered cards —
 * an azure glyph, the step number, its name and a line of what happens there,
 * with a quiet arrow carrying the eye to the next. The head sits above: eyebrow
 * and title on the left, a short statement on the right.
 */
export default function ApproachSteps({
  id,
  label = "Our approach",
  title,
  subtitle,
  body,
  steps,
}: {
  id: string;
  label?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  body?: React.ReactNode;
  steps: ApproachStep[];
}) {
  if (steps.length === 0) return null;

  return (
    <section
      aria-labelledby={id}
      className="relative overflow-hidden border-b border-line bg-paper-deep"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />
      <Container wide className="relative z-10 py-8 sm:py-12 lg:py-14">
        {/* ---- Head ---- */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                {label}
              </span>
            </div>
            <h2 id={id} className="mt-6 text-h3 text-ink">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-[16px] leading-[1.6] text-ink-500 lg:text-[17px]">
                {subtitle}
              </p>
            )}
          </div>
          {body && (
            <p className="max-w-[42ch] text-[14px] leading-[1.7] text-ink-500">
              {body}
            </p>
          )}
        </div>

        {/* ---- Steps ---- */}
        <ol className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:mt-10 lg:grid-cols-7">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const last = i === steps.length - 1;
            return (
              <li key={step.title}>
                <Wipe delay={(i % 7) * 0.05} className="h-full">
                  <div className="flex h-full flex-col rounded-xl border border-line bg-paper p-5 transition-colors duration-500 hover:border-azure/40">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-azure-50 text-azure ring-1 ring-azure-100">
                        <Icon size={19} strokeWidth={1.7} />
                      </span>
                      {!last && (
                        <ArrowRight
                          aria-hidden
                          size={16}
                          className="text-ink-400/70"
                        />
                      )}
                    </div>
                    <span className="mt-4 font-mono text-[12px] font-semibold tracking-[0.04em] text-ink-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-1 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-[1.6] text-ink-500">
                      {step.desc}
                    </p>
                  </div>
                </Wipe>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

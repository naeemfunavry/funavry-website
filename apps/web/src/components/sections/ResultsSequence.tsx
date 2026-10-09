import { type LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";

export type SequenceStep = {
  label: string;
  icon: LucideIcon;
  /** A short line under the label, shown beside the plate. */
  desc?: string;
};

/**
 * A practice page's outcomes, drawn as a stack of glass plates: the statement
 * on the left, then one translucent isometric tile per outcome climbing the
 * tower on the right — amber-tinted and clear by turns, each carrying its glyph
 * and wired out to a label. One accent throughout, a single build-up of value.
 */
export default function ResultsSequence({
  id,
  label = "Outcomes",
  title,
  body,
  steps,
}: {
  id: string;
  label?: string;
  title?: React.ReactNode;
  body?: React.ReactNode;
  steps: SequenceStep[];
}) {
  if (steps.length === 0) return null;

  return (
    <section
      aria-labelledby={id}
      className="relative overflow-hidden border-b border-line bg-paper-deep"
    >
      <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
      {/* A warm wash behind the tower, as in the reference. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(60%_60%_at_70%_40%,rgba(245,159,19,0.10),transparent_70%)]"
      />
      <Container wide className="relative z-10 py-8 sm:py-12 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16">
          {/* ---- Statement ---- */}
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
            {body && (
              <div className="mt-6 space-y-5 text-[16px] leading-[1.9] text-ink-500 lg:text-[17px]">
                {body}
              </div>
            )}
          </div>

          {/* ---- Tower ---- */}
          <ol className="relative mx-auto w-full max-w-[460px] [perspective:1100px]">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const amber = i % 2 !== 0; // alternate amber-tinted / clear glass
              return (
                <li key={step.label} className={i > 0 ? "mt-2.5" : ""}>
                  <Wipe delay={i * 0.06}>
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Glass plate with the upright glyph over it. */}
                      <div className="relative h-[40px] w-[30px] flex-none sm:w-[50px]">
                        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-br from-amber to-amber-600 text-white shadow-[0_10px_18px_-10px_rgba(245,159,19,0.9)]">
                          <Icon size={20} strokeWidth={1.9} />
                        </span>
                      </div>

                      {/* Connector. */}
                      <span
                        aria-hidden
                        className="hidden h-px flex-none bg-gradient-to-r from-amber/50 to-transparent sm:block sm:w-6"
                      />
                      <span
                        aria-hidden
                        className="hidden h-1 w-1 flex-none rounded-full bg-amber sm:block"
                      />

                      {/* Label + description. */}
                      <div className="min-w-0 flex-1 rounded-lg border border-line/70 bg-paper/70 px-4 py-3 backdrop-blur-sm">
                        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                          {step.label}
                        </h3>
                        {/* {step.desc && (
                          <p className="mt-1 text-[12.5px] leading-[1.55] text-ink-500">
                            {step.desc}
                          </p>
                        )} */}
                      </div>
                    </div>
                  </Wipe>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}

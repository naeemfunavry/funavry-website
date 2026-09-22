import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type Tone = "paper" | "white" | "deep" | "dark";

const TONE: Record<Tone, string> = {
  paper: "bg-paper",
  white: "bg-paper-white",
  deep: "bg-paper-deep",
  dark: "bg-ink-900",
};

/**
 * One chapter of a case study. Every chapter shares the same frame — index,
 * hairline and label; a heading on the left; an optional lead on the right;
 * the chapter's own content full width beneath — so the page reads as one
 * document however many chapters a project has.
 */
export default function CaseStudySection({
  id,
  index,
  label,
  title,
  lead,
  tone = "paper",
  children,
}: {
  id: string;
  /** Chapter number, shown before the label. Optional — the case study page
      follows the site's unnumbered eyebrows. */
  index?: string;
  label: string;
  title: string;
  lead?: React.ReactNode;
  tone?: Tone;
  children?: React.ReactNode;
}) {
  const dark = tone === "dark";

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "relative overflow-hidden border-t",
        dark ? "border-ink-900" : "border-line",
        TONE[tone],
      )}
    >
      {dark && (
        <div aria-hidden className="absolute inset-0 grid-paper-dark opacity-40" />
      )}

      <Container wide className="relative py-16 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              {index && (
                <span
                  className={cn(
                    "font-mono text-[10.5px] tracking-[0.2em]",
                    dark ? "text-amber" : "text-azure-ink",
                  )}
                >
                  {index}
                </span>
              )}
              <span
                aria-hidden
                className={cn("h-px w-10 flex-none", dark ? "bg-amber" : "bg-azure")}
              />
              <span
                className={cn(
                  "font-mono text-[10.5px] uppercase tracking-[0.24em]",
                  dark ? "text-paper/70" : "text-ink-500",
                )}
              >
                {label}
              </span>
            </div>
            <h2
              id={`${id}-heading`}
              className={cn("mt-6 text-h3", dark ? "text-paper" : "text-ink")}
            >
              {title}
            </h2>
          </div>

          {lead && (
            <div
              className={cn(
                "max-w-[68ch] text-[15.5px] leading-[1.8] lg:pt-10",
                dark ? "text-paper/65" : "text-ink-500",
              )}
            >
              {lead}
            </div>
          )}
        </div>

        {children && <div className="mt-10 lg:mt-14">{children}</div>}
      </Container>
    </section>
  );
}

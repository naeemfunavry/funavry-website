import { cn } from "@/lib/utils";

/**
 * Every case study section's heading, drawn as the industry page draws its
 * own: an azure hairline and a mono label, the `text-h3` title under it, and —
 * on the right from lg up — a short lead line or a control.
 */
export default function DetailHeading({
  id,
  eyebrow,
  title,
  lead,
  aside,
  dark = false,
  className,
}: {
  /** The heading's id, for the section's `aria-labelledby`. */
  id: string;
  /** The small label over the title. */
  eyebrow: string;
  title: string;
  /** A sentence beside the title. */
  lead?: string;
  /** Anything else beside it — arrows, a link. */
  aside?: React.ReactNode;
  /** On the ink band. */
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16",
        className,
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 flex-none bg-azure" />
          <span
            className={`font-mono text-[10.5px] uppercase tracking-[0.24em] ${
              dark ? "text-paper/60" : "text-ink-500"
            }`}
          >
            {eyebrow}
          </span>
        </div>
        {/* Not `cn()`: tailwind-merge reads the custom `text-h3` size and the
            colour as one `text-*` group and drops the size. */}
        <h2 id={id} className={`mt-6 text-h3 ${dark ? "text-paper" : "text-ink"}`}>
          {title}
        </h2>
      </div>

      {(lead || aside) && (
        <div className="flex items-end gap-8 lg:justify-end">
          {lead && (
            <p
              className={cn(
                "max-w-[52ch] text-[15px] leading-[1.7]",
                dark ? "text-paper/65" : "text-ink-500",
              )}
            >
              {lead}
            </p>
          )}
          {aside}
        </div>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

/**
 * A signal travelling down a wire and arriving at a terminal prompt.
 *
 * No JS: the site already delegates `a[href^="#"]` to Lenis in
 * SmoothScrollProvider, so an anchor is all the scroll behaviour this needs.
 * The motion lives in globals.css, under `.scroll-cue-*`.
 */
export default function ScrollCue({
  href = "#capabilities",
  command = "Explore Capabilities",
  className,
}: {
  href?: string;
  command?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      /* The prompt may be written as a shell token; the label is the sentence. */
      aria-label={command.replace(/_/g, " ")}
      className={cn(
        "scroll-cue flex w-full items-center gap-3 md:flex-1",
        className,
      )}
    >
      <span aria-hidden className="scroll-cue-wire" />

      {/* Unlit until the signal lands. The colour is owned by the keyframes,
          not by classes here — see `.scroll-cue-*` in globals.css. */}
      <span
        aria-hidden
        className="scroll-cue-prompt flex flex-none items-center gap-[0.42em] font-mono text-[13px] leading-none tracking-[0.05em]"
      >
        <span className="scroll-cue-arrow">&gt;</span>
        <span className="scroll-cue-text">{command}</span>
        <span className="scroll-cue-caret" />
      </span>
    </a>
  );
}

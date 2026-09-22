import { ContentStatus } from "@funavry/types";

const LABELS: Record<ContentStatus, { text: string; className: string }> = {
  [ContentStatus.PUBLISHED]: { text: "Live", className: "badge-published" },
  [ContentStatus.DRAFT]: { text: "Draft", className: "badge-draft" },
  [ContentStatus.ARCHIVED]: { text: "Archived", className: "badge-archived" },
};

/**
 * "Live" rather than "Published": the word that matters to an editor is
 * whether the thing is on funavry.com right now, not which enum value the row
 * happens to hold.
 */
export function StatusBadge({ status }: { status: ContentStatus }) {
  const config = LABELS[status] ?? LABELS[ContentStatus.DRAFT];

  return (
    <span className={config.className}>
      <span
        aria-hidden
        className={
          status === ContentStatus.PUBLISHED
            ? "h-1.5 w-1.5 rounded-full bg-success"
            : status === ContentStatus.DRAFT
              ? "h-1.5 w-1.5 rounded-full bg-amber"
              : "h-1.5 w-1.5 rounded-full bg-ink-400"
        }
      />
      {config.text}
    </span>
  );
}

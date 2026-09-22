"use client";

import type { Leader } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function LeadershipPage() {
  return (
    <ResourceTable<Leader>
      resource="leaders"
      eyebrow="People"
      title="Leadership"
      description="The founder, co-founders and the C-suite. Each card carries an ordered set of bullet points."
      editHref={(row) => `/dashboard/leadership/${row.id}`}
      newHref="/dashboard/leadership/new"
      searchPlaceholder="Search by name or role…"
      columns={[
        {
          header: "Name",
          cell: (row) => (
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-paper-deep font-mono text-micro text-ink-500">
                {row.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{row.name}</p>
                <p className="truncate text-xs text-ink-400">{row.role}</p>
              </div>
            </div>
          ),
        },
        {
          header: "Standing",
          className: "w-36",
          cell: (row) =>
            row.isFounder ? (
              <span className="badge-neutral">Founder</span>
            ) : row.isCoFounder ? (
              <span className="badge-neutral">Co-founder</span>
            ) : (
              <span className="text-xs text-ink-400">—</span>
            ),
        },
        {
          header: "Points",
          className: "w-20",
          cell: (row) => <span className="text-xs text-ink-500">{row.points.length}</span>,
        },
        {
          header: "Portrait",
          className: "w-24",
          cell: (row) =>
            row.photo ? (
              <span className="badge-published">Yes</span>
            ) : (
              <span className="badge-draft">Monogram</span>
            ),
        },
      ]}
    />
  );
}

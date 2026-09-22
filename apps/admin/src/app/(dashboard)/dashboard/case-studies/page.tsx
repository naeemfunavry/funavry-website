"use client";

import type { CaseStudySummary } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function CaseStudiesPage() {
  return (
    <ResourceTable<CaseStudySummary>
      resource="case-studies"
      eyebrow="Work"
      title="Case Studies"
      description="The portfolio. Each one carries a brief, a capture set, and the capabilities the deck prints over it."
      newHref="/dashboard/case-studies/new"
      searchPlaceholder="Search by title, sector or summary…"
      columns={[
        {
          header: "Project",
          cell: (row) => (
            <div className="min-w-0">
              <p className="truncate font-medium">{row.title}</p>
              <p className="truncate text-xs text-ink-400">{row.tagline}</p>
            </div>
          ),
        },
        {
          header: "Sector",
          className: "w-44",
          cell: (row) => <span className="text-ink-500">{row.sector}</span>,
        },
        {
          header: "Phase",
          className: "w-28",
          cell: (row) => <span className="badge-neutral">{row.phase}</span>,
        },
        {
          header: "Deck",
          className: "w-20",
          cell: (row) =>
            row.featured ? (
              <span className="badge-neutral">Featured</span>
            ) : (
              <span className="text-xs text-ink-400">—</span>
            ),
        },
      ]}
    />
  );
}

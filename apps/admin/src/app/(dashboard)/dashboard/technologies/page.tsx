"use client";

import type { Technology } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function TechnologiesPage() {
  return (
    <ResourceTable<Technology>
      resource="technologies"
      eyebrow="Company"
      title="Technologies"
      description="The stack strip. An entry can carry a simple-icons slug instead of an uploaded logo."
      newHref="/dashboard/technologies/new"
      searchPlaceholder="Search technologies…"
      emptyDescription="Nothing here yet. The site's stack strip currently renders from its own icon set."
      columns={[
        {
          header: "Technology",
          cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
          header: "Category",
          className: "w-44",
          cell: (row) => <span className="badge-neutral">{row.category}</span>,
        },
        {
          header: "Icon",
          className: "w-44",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-400">
              {row.iconSlug ?? (row.logo ? "uploaded" : "—")}
            </span>
          ),
        },
      ]}
    />
  );
}

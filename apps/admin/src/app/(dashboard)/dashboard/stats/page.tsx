"use client";

import type { Stat } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function StatsPage() {
  return (
    <ResourceTable<Stat>
      resource="stats"
      eyebrow="Company"
      title="Stats"
      description="Approved company figures. These are shared by the About page, the home Proof section and the footer, so a change lands everywhere at once."
      newHref="/dashboard/stats/new"
      searchPlaceholder="Search figures…"
      columns={[
        {
          header: "Figure",
          cell: (row) => (
            <div className="flex min-w-0 items-baseline gap-3">
              <span className="text-lg font-semibold leading-none tracking-tight">
                {row.value}
              </span>
              <span className="truncate text-ink-500">{row.label}</span>
            </div>
          ),
        },
        {
          header: "Key",
          className: "w-52",
          cell: (row) => <span className="font-mono text-xs text-ink-400">{row.key}</span>,
        },
        {
          header: "Shown on",
          className: "w-28",
          cell: (row) => <span className="badge-neutral">{row.group}</span>,
        },
      ]}
    />
  );
}

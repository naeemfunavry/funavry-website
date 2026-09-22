"use client";

import type { Service } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function ServicesPage() {
  return (
    <ResourceTable<Service>
      resource="services"
      eyebrow="Work"
      title="Services"
      description="The practice lines from the Capability Statement, each with its sub-services and its curated proof."
      newHref="/dashboard/services/new"
      searchPlaceholder="Search practices…"
      columns={[
        {
          header: "Practice",
          cell: (row) => (
            <div className="flex min-w-0 items-baseline gap-2.5">
              <span className="font-mono text-micro text-ink-400">{row.number}</span>
              <div className="min-w-0">
                <p className="truncate font-medium">{row.title}</p>
                <p className="truncate text-xs text-ink-400">
                  {row.subs.length} sub-service{row.subs.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          ),
        },
        {
          header: "Group",
          className: "w-28",
          cell: (row) => (
            <span className="badge-neutral">
              {row.group === "tech" ? "Technology" : "GBS"}
            </span>
          ),
        },
        {
          header: "Phase",
          className: "w-28",
          cell: (row) => <span className="badge-neutral">{row.phase}</span>,
        },
      ]}
    />
  );
}

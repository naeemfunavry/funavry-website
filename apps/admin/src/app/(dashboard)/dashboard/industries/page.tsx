"use client";

import type { Industry } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function IndustriesPage() {
  return (
    <ResourceTable<Industry>
      resource="industries"
      eyebrow="Work"
      title="Industries"
      description="The sectors Funavry delivers into. Case studies file themselves under these from their own brief."
      newHref="/dashboard/industries/new"
      searchPlaceholder="Search industries…"
      columns={[
        {
          header: "Industry",
          cell: (row) => (
            <div className="min-w-0">
              <p className="truncate font-medium">{row.name}</p>
              <p className="truncate text-xs text-ink-400">{row.description}</p>
            </div>
          ),
        },
        {
          header: "Proof",
          className: "w-56",
          cell: (row) => (
            <span className="truncate text-xs text-ink-500">{row.proof || "—"}</span>
          ),
        },
      ]}
    />
  );
}

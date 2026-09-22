"use client";

import type { Office } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function OfficesPage() {
  return (
    <ResourceTable<Office>
      resource="offices"
      eyebrow="Company"
      title="Locations"
      description="The offices. Coordinates are the real city — the Capabilities globe turns to face each marker, so a country centroid would put the pin in the wrong place."
      newHref="/dashboard/offices/new"
      searchPlaceholder="Search by city or country…"
      columns={[
        {
          header: "Office",
          cell: (row) => (
            <div className="min-w-0">
              <p className="truncate font-medium">
                {row.city}
                {row.isHeadquarters && (
                  <span className="ml-2 badge-neutral align-middle">HQ</span>
                )}
              </p>
              <p className="truncate text-xs text-ink-400">
                {row.country} · {row.role}
              </p>
            </div>
          ),
        },
        {
          header: "Coordinates",
          className: "w-44",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-500">
              {row.location.lat.toFixed(3)}, {row.location.lon.toFixed(3)}
            </span>
          ),
        },
        {
          header: "Address",
          className: "w-24",
          cell: (row) => (
            <span className="text-xs text-ink-500">
              {row.addressLines.length} line{row.addressLines.length === 1 ? "" : "s"}
            </span>
          ),
        },
      ]}
    />
  );
}

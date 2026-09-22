"use client";

import type { TeamMember } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function TeamPage() {
  return (
    <ResourceTable<TeamMember>
      resource="team"
      eyebrow="People"
      title="Team"
      description="The wider directory — everyone who is not on a leadership card."
      newHref="/dashboard/team/new"
      searchPlaceholder="Search by name, role or department…"
      emptyDescription="No team members added yet. The site renders the leadership cards regardless."
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
          header: "Department",
          className: "w-44",
          cell: (row) => <span className="text-ink-500">{row.department ?? "—"}</span>,
        },
        {
          header: "Based in",
          className: "w-36",
          cell: (row) => (
            <span className="text-ink-500">{row.location ?? "Remote"}</span>
          ),
        },
      ]}
    />
  );
}

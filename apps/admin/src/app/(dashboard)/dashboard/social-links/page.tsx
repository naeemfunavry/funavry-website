"use client";

import type { SocialLink } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function SocialLinksPage() {
  return (
    <ResourceTable<SocialLink>
      resource="social-links"
      eyebrow="Company"
      title="Social Links"
      description="The footer's social presence. Icons are lucide-react names, resolved by the site."
      newHref="/dashboard/social-links/new"
      searchPlaceholder="Search links…"
      columns={[
        {
          header: "Channel",
          cell: (row) => <span className="font-medium">{row.label}</span>,
        },
        {
          header: "URL",
          cell: (row) => (
            <a
              href={row.url}
              target="_blank"
              rel="noreferrer noopener"
              className="truncate text-xs text-azure-ink underline-offset-2 hover:underline"
            >
              {row.url}
            </a>
          ),
        },
        {
          header: "Icon",
          className: "w-32",
          cell: (row) => <span className="font-mono text-xs text-ink-400">{row.icon}</span>,
        },
      ]}
    />
  );
}

"use client";

import type { Post } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function PostsPage() {
  return (
    <ResourceTable<Post>
      resource="posts"
      eyebrow="Editorial"
      title="Blog & News"
      description="Articles, news items and case notes. A post with no date renders as “Coming soon” on the site."
      newHref="/dashboard/posts/new"
      searchPlaceholder="Search posts…"
      columns={[
        {
          header: "Title",
          cell: (row) => (
            <div className="min-w-0">
              <p className="truncate font-medium">{row.title}</p>
              <p className="truncate text-xs text-ink-400">{row.excerpt}</p>
            </div>
          ),
        },
        {
          header: "Kind",
          className: "w-28",
          cell: (row) => <span className="badge-neutral">{row.kind}</span>,
        },
        {
          header: "Date",
          className: "w-32",
          cell: (row) => (
            <span className="text-xs text-ink-500">{row.date ?? "Coming soon"}</span>
          ),
        },
      ]}
    />
  );
}

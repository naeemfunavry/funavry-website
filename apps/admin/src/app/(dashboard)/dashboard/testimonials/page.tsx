"use client";

import type { Testimonial } from "@funavry/types";

import { ResourceTable } from "@/components/resource/resource-table";

export default function TestimonialsPage() {
  return (
    <ResourceTable<Testimonial>
      resource="testimonials"
      eyebrow="Editorial"
      title="Testimonials"
      description="Client quotes. A quote stays flagged Placeholder until it has written approval — the site prints that badge."
      newHref="/dashboard/testimonials/new"
      searchPlaceholder="Search by author or company…"
      columns={[
        {
          header: "Quote",
          cell: (row) => (
            <p className="line-clamp-2 max-w-xl text-ink-500">“{row.quote}”</p>
          ),
        },
        {
          header: "Attribution",
          className: "w-56",
          cell: (row) => (
            <div className="min-w-0">
              <p className="truncate font-medium">{row.author}</p>
              <p className="truncate text-xs text-ink-400">
                {row.role}, {row.company}
              </p>
            </div>
          ),
        },
        {
          header: "Approval",
          className: "w-32",
          cell: (row) =>
            row.pending ? (
              <span className="badge-draft">Placeholder</span>
            ) : (
              <span className="badge-published">Approved</span>
            ),
        },
      ]}
    />
  );
}

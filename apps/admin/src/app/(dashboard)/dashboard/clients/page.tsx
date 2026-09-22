"use client";

import type { Client } from "@funavry/types";
import Image from "next/image";

import { ResourceTable } from "@/components/resource/resource-table";

export default function ClientsPage() {
  return (
    <ResourceTable<Client>
      resource="clients"
      eyebrow="Company"
      title="Clients & Partners"
      description="The trusted-partner marks. Names are read off the artwork, never off the filename — several of the source filenames name the wrong organisation."
      newHref="/dashboard/clients/new"
      searchPlaceholder="Search marks…"
      columns={[
        {
          header: "Mark",
          cell: (row) => (
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-16 shrink-0 items-center justify-center border border-line-soft bg-paper-white">
                {row.logo ? (
                  <Image
                    src={row.logo.url}
                    alt=""
                    width={56}
                    height={24}
                    className="max-h-6 w-auto object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="font-mono text-micro text-ink-400">—</span>
                )}
              </span>
              <p className="truncate font-medium">{row.name}</p>
            </div>
          ),
        },
        {
          header: "Relationship",
          className: "w-32",
          cell: (row) => (
            <span className="badge-neutral">{row.isPartner ? "Partner" : "Client"}</span>
          ),
        },
        {
          header: "Order",
          className: "w-20",
          cell: (row) => (
            <span className="font-mono text-xs text-ink-400">{row.position}</span>
          ),
        },
      ]}
    />
  );
}

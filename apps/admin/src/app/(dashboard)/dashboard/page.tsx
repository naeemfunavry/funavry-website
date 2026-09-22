"use client";

import {
  type AuditLogEntry,
  type CaseStudySummary,
  ContentStatus,
  type Paginated,
  Permission,
} from "@funavry/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CircleDot, ScrollText } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-client";
import { NAVIGATION } from "@/lib/navigation";
import { relativeTime } from "@/lib/utils";

/** The counts worth seeing at a glance, and where each one lives. */
const COUNTED: { label: string; resource: string; href: string }[] = [
  { label: "Case studies", resource: "case-studies", href: "/dashboard/case-studies" },
  { label: "Services", resource: "services", href: "/dashboard/services" },
  { label: "Industries", resource: "industries", href: "/dashboard/industries" },
  { label: "Posts", resource: "posts", href: "/dashboard/posts" },
  { label: "Leadership", resource: "leaders", href: "/dashboard/leadership" },
  { label: "Clients", resource: "clients", href: "/dashboard/clients" },
];

function CountCard({ label, resource, href }: (typeof COUNTED)[number]) {
  /* Asks for a single row and reads the total off pageInfo — the count is the
     point, and pulling twenty rows to display one number would be waste. */
  const { data, isLoading } = useQuery({
    queryKey: [resource, "count"],
    queryFn: () => api.list<{ id: string }>(`/${resource}`, { limit: 1 }),
  });

  const { data: published } = useQuery({
    queryKey: [resource, "count", "published"],
    queryFn: () =>
      api.list<{ id: string }>(`/${resource}`, { limit: 1, status: ContentStatus.PUBLISHED }),
  });

  const total = data?.pageInfo.total ?? 0;
  const live = published?.pageInfo.total ?? 0;
  const drafts = Math.max(0, total - live);

  return (
    <Link
      href={href}
      className="panel group flex flex-col justify-between p-4 transition-colors hover:border-ink-400"
    >
      <p className="eyebrow">{label}</p>

      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl font-semibold leading-none tracking-tight">
          {isLoading ? <Spinner /> : total}
        </p>
        <ArrowUpRight className="h-4 w-4 text-ink-400 transition-colors group-hover:text-ink" />
      </div>

      <p className="mt-2 font-mono text-micro uppercase tracking-[0.08em] text-ink-400">
        {live} live{drafts > 0 && ` · ${drafts} draft`}
      </p>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, can } = useAuth();

  const { data: recent } = useQuery({
    queryKey: ["audit", "recent"],
    queryFn: () => api.list<AuditLogEntry>("/audit", { limit: 8 }),
    enabled: can(Permission.AUDIT_READ),
  });

  const { data: drafts } = useQuery({
    queryKey: ["case-studies", "drafts"],
    queryFn: () =>
      api.list<CaseStudySummary>("/case-studies", { limit: 5, status: ContentStatus.DRAFT }),
  });

  const firstName = user?.fullName?.split(" ")[0] ?? user?.username;

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}`}
        description="Everything the website publishes is managed here. Changes go live as soon as they are published."
      />

      <section aria-label="Content counts" className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COUNTED.map((item) => (
          <CountCard key={item.resource} {...item} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* ------------------------------------------------ recent activity */}
        {can(Permission.AUDIT_READ) && (
          <section className="panel" aria-labelledby="recent-activity">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 id="recent-activity" className="text-sm font-medium tracking-tight">
                Recent activity
              </h3>
              <Link
                href="/dashboard/audit"
                className="font-mono text-micro uppercase tracking-[0.08em] text-ink-400 transition-colors hover:text-ink"
              >
                Full log
              </Link>
            </div>

            {recent?.items.length ? (
              <ul className="divide-y divide-line-soft">
                {recent.items.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3 px-4 py-2.5">
                    <CircleDot
                      className={
                        entry.success
                          ? "mt-0.5 h-3.5 w-3.5 shrink-0 text-success"
                          : "mt-0.5 h-3.5 w-3.5 shrink-0 text-danger"
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="font-medium">{entry.actorUsername ?? "Someone"}</span>{" "}
                        <span className="text-ink-500">
                          {entry.action.toLowerCase().replace(/_/g, " ")}
                        </span>{" "}
                        {entry.resourceLabel && (
                          <span className="text-ink">{entry.resourceLabel}</span>
                        )}
                      </p>
                      <p className="mt-0.5 font-mono text-micro uppercase tracking-[0.06em] text-ink-400">
                        {relativeTime(entry.createdAt)}
                        {entry.ipAddress && ` · ${entry.ipAddress}`}
                        {!entry.success && entry.reason && ` · ${entry.reason}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 px-4 py-8 text-sm text-ink-400">
                <ScrollText className="h-4 w-4" />
                Nothing recorded yet.
              </p>
            )}
          </section>
        )}

        {/* ------------------------------------------------------- in draft */}
        <section className="panel" aria-labelledby="in-draft">
          <div className="border-b border-line px-4 py-3">
            <h3 id="in-draft" className="text-sm font-medium tracking-tight">
              Case studies in draft
            </h3>
            <p className="mt-0.5 text-xs text-ink-400">Not visible on funavry.com yet.</p>
          </div>

          {drafts?.items.length ? (
            <ul className="divide-y divide-line-soft">
              {drafts.items.map((study) => (
                <li key={study.id}>
                  <Link
                    href={`/dashboard/case-studies/${study.id}`}
                    className="block px-4 py-2.5 transition-colors hover:bg-paper-deep/50"
                  >
                    <p className="truncate text-sm font-medium">{study.title}</p>
                    <p className="mt-0.5 truncate font-mono text-micro uppercase tracking-[0.06em] text-ink-400">
                      {study.sector} · {study.phase}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-sm text-ink-400">
              Everything is published. Nothing waiting in draft.
            </p>
          )}
        </section>
      </div>

      {/* ------------------------------------------------------ section map */}
      <section className="mt-8" aria-labelledby="all-sections">
        <h3 id="all-sections" className="eyebrow mb-3">
          All sections
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NAVIGATION.filter((section) => section.title !== "Overview").flatMap((section) =>
            section.items
              .filter((item) => !item.permissions || can(...item.permissions))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="panel group flex items-start gap-3 p-3.5 transition-colors hover:border-ink-400"
                >
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-azure-ink" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              )),
          )}
        </div>
      </section>
    </>
  );
}

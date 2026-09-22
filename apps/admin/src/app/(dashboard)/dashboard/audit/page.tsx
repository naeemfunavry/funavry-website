"use client";

import {
  AuditAction,
  AuditResource,
  type AuditLogEntry,
} from "@funavry/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ChevronDown, Filter } from "lucide-react";
import { Fragment, useState } from "react";

import { describe } from "@/components/resource/resource-table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingPanel } from "@/components/ui/spinner";
import { api } from "@/lib/api-client";
import { cn, formatDateTime } from "@/lib/utils";

/** Reads "LOGIN_FAILED" as "Login failed". */
const humanise = (value: string): string => {
  const text = value.toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<string>("");
  const [resource, setResource] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["audit", { page, action, resource, success }],
    queryFn: () =>
      api.list<AuditLogEntry>("/audit", {
        page,
        limit: 25,
        action: action || undefined,
        resource: resource || undefined,
        success: success || undefined,
      }),
  });

  const resetTo = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Audit Log"
        description="Every sign-in and every write, with the acting account, the originating IP address and what changed. Append-only — nothing here can be edited or deleted from the panel."
      />

      <div className="panel mb-4 flex flex-wrap items-end gap-3 p-3">
        <Filter className="mb-2 h-3.5 w-3.5 text-ink-400" />

        <div>
          <label htmlFor="filter-action" className="field-label">
            Action
          </label>
          <select
            id="filter-action"
            value={action}
            onChange={(e) => resetTo(setAction)(e.target.value)}
            className="select w-48"
          >
            <option value="">All actions</option>
            {Object.values(AuditAction).map((value) => (
              <option key={value} value={value}>
                {humanise(value)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-resource" className="field-label">
            Resource
          </label>
          <select
            id="filter-resource"
            value={resource}
            onChange={(e) => resetTo(setResource)(e.target.value)}
            className="select w-48"
          >
            <option value="">All resources</option>
            {Object.values(AuditResource).map((value) => (
              <option key={value} value={value}>
                {humanise(value)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-outcome" className="field-label">
            Outcome
          </label>
          <select
            id="filter-outcome"
            value={success}
            onChange={(e) => resetTo(setSuccess)(e.target.value)}
            className="select w-36"
          >
            <option value="">All</option>
            <option value="true">Succeeded</option>
            <option value="false">Failed</option>
          </select>
        </div>

        {(action || resource || success) && (
          <button
            type="button"
            onClick={() => {
              setAction("");
              setResource("");
              setSuccess("");
              setPage(1);
            }}
            className="btn-ghost btn-sm mb-0.5"
          >
            Clear
          </button>
        )}

        {data && (
          <p className="mb-2 ml-auto font-mono text-micro uppercase tracking-[0.08em] text-ink-400">
            {data.pageInfo.total} entries
          </p>
        )}
      </div>

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <div className="panel border-danger/30 bg-danger-50 px-4 py-6 text-sm text-danger-ink">
          {describe(error)}
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] border-collapse">
              <thead>
                <tr>
                  <th className="table-head w-44">When</th>
                  <th className="table-head w-36">Action</th>
                  <th className="table-head">What</th>
                  <th className="table-head w-32">Who</th>
                  <th className="table-head w-56">From</th>
                  <th className="table-head w-10" />
                </tr>
              </thead>

              <tbody>
                {data?.items.map((entry) => {
                  const isOpen = expanded === entry.id;
                  const hasDetail = Boolean(entry.changes || entry.reason || entry.path);

                  /* Keyed on the Fragment, not on the rows inside it. Each entry
                     renders two <tr>s, and a table cannot take a wrapper element
                     between <tbody> and its rows — so the Fragment is the list
                     child React is reconciling and the one that needs the key. */
                  return (
                    <Fragment key={entry.id}>
                      <tr
                        className={cn("table-row", !entry.success && "bg-danger-50/40")}
                      >
                        <td className="table-cell whitespace-nowrap text-xs text-ink-500">
                          {formatDateTime(entry.createdAt)}
                        </td>

                        <td className="table-cell">
                          <span
                            className={
                              entry.success ? "badge-neutral" : "badge border-danger/30 bg-danger-100 text-danger-ink"
                            }
                          >
                            {humanise(entry.action)}
                          </span>
                        </td>

                        <td className="table-cell">
                          <p className="truncate">
                            <span className="text-ink-400">{humanise(entry.resource)}</span>
                            {entry.resourceLabel && (
                              <>
                                {" · "}
                                <span className="font-medium">{entry.resourceLabel}</span>
                              </>
                            )}
                          </p>
                        </td>

                        <td className="table-cell text-ink-500">
                          {entry.actorUsername ?? <span className="text-ink-400">—</span>}
                        </td>

                        <td className="table-cell">
                          <p className="font-mono text-xs text-ink-500">{entry.ipAddress ?? "—"}</p>
                          {entry.device && (
                            <p className="truncate text-xs text-ink-400">{entry.device}</p>
                          )}
                        </td>

                        <td className="table-cell">
                          {hasDetail && (
                            <button
                              type="button"
                              onClick={() => setExpanded(isOpen ? null : entry.id)}
                              aria-expanded={isOpen}
                              aria-label="Show detail"
                              className="btn-ghost btn-sm"
                            >
                              <ChevronDown
                                className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                              />
                            </button>
                          )}
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td colSpan={6} className="border-b border-line-soft bg-paper-deep/40 px-4 py-3">
                            <dl className="grid gap-x-8 gap-y-1.5 text-xs sm:grid-cols-2">
                              {entry.path && (
                                <div className="flex gap-2">
                                  <dt className="text-ink-400">Request</dt>
                                  <dd className="font-mono text-ink-500">
                                    {entry.method} {entry.path}
                                    {entry.statusCode ? ` → ${entry.statusCode}` : ""}
                                    {entry.durationMs !== null ? ` (${entry.durationMs}ms)` : ""}
                                  </dd>
                                </div>
                              )}

                              {entry.requestId && (
                                <div className="flex gap-2">
                                  <dt className="text-ink-400">Request id</dt>
                                  <dd className="font-mono text-ink-500">{entry.requestId}</dd>
                                </div>
                              )}

                              {entry.reason && (
                                <div className="flex gap-2 sm:col-span-2">
                                  <dt className="text-ink-400">Reason</dt>
                                  <dd className="text-danger-ink">{entry.reason}</dd>
                                </div>
                              )}
                            </dl>

                            {entry.changes && (
                              <div className="mt-3">
                                <p className="eyebrow mb-1.5">Changed fields</p>
                                <ul className="space-y-1">
                                  {Object.entries(entry.changes).map(([field, change]) => (
                                    <li key={field} className="flex flex-wrap items-baseline gap-2 text-xs">
                                      <span className="font-mono text-ink-500">{field}</span>
                                      <span className="max-w-xs truncate text-ink-400 line-through">
                                        {format(change.from)}
                                      </span>
                                      <span className="text-ink-400">→</span>
                                      <span className="max-w-xs truncate text-ink">
                                        {format(change.to)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data && data.pageInfo.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
              <p className="font-mono text-micro uppercase tracking-[0.08em] text-ink-400">
                Page {data.pageInfo.page} of {data.pageInfo.totalPages}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data.pageInfo.hasPrev}
                  className="btn-secondary btn-sm"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.pageInfo.hasNext}
                  className="btn-secondary btn-sm"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/** Renders a diff value compactly, without dumping a whole object into a cell. */
function format(value: unknown): string {
  if (value === null || value === undefined) return "empty";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (typeof value === "object") return JSON.stringify(value).slice(0, 80);
  const text = String(value);
  return text.length > 80 ? `${text.slice(0, 80)}…` : text || "empty";
}

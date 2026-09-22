"use client";

import {
  type ContentStatus,
  type Paginated,
  Permission,
} from "@funavry/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { LoadingPanel, Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { api, ApiError } from "@/lib/api-client";
import { cn, relativeTime } from "@/lib/utils";

export interface ResourceColumn<T> {
  header: string;
  /** Rendered cell content. */
  cell: (row: T) => ReactNode;
  className?: string;
}

export interface ResourceTableProps<T extends { id: string }> {
  /** API path segment, e.g. "case-studies". */
  resource: string;
  title: string;
  eyebrow?: string;
  description?: string;
  columns: ResourceColumn<T>[];
  /** Where the edit form lives. Defaults to /dashboard/<resource>/<id>. */
  editHref?: (row: T) => string;
  newHref?: string;
  /** Resources with no publish state — settings, delivery countries. */
  hasStatus?: boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

interface StatusRow {
  id: string;
  status?: ContentStatus;
  updatedAt?: string;
  deletedAt?: string | null;
}

/**
 * The list view every content type shares.
 *
 * One component rather than fifteen hand-written tables, for the same reason
 * the API has one CRUD controller factory: the parts that are easy to get
 * wrong — pagination, the publish toggle, confirming a delete, invalidating the
 * cache afterwards — are identical everywhere, and the fifteenth copy is the
 * one that silently forgets to refetch.
 */
export function ResourceTable<T extends { id: string } & StatusRow>({
  resource,
  title,
  eyebrow,
  description,
  columns,
  editHref,
  newHref,
  hasStatus = true,
  searchPlaceholder = "Search…",
  emptyTitle,
  emptyDescription,
}: ResourceTableProps<T>) {
  const { can } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  /* Debounced so typing does not fire a request per keystroke. */
  useDebouncedEffect(
    () => {
      setDebounced(search);
      setPage(1);
    },
    [search],
    300,
  );

  const listKey = [resource, { page, q: debounced }] as const;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: listKey,
    queryFn: () => api.list<T>(`/${resource}`, { page, limit: 20, q: debounced || undefined }),
  });

  /* Every mutation invalidates the whole resource, not just this page — a
     publish changes what the public site serves, and a stale neighbouring page
     is exactly the sort of thing that has someone "publishing twice". */
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [resource] });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      api.patch(`/${resource}/${id}/${publish ? "publish" : "unpublish"}`),
    onSuccess: (_result, variables) => {
      toast.success(variables.publish ? "Published to the live site" : "Removed from the live site");
      void invalidate();
    },
    onError: (err: unknown) => toast.error(describe(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/${resource}/${id}`),
    onSuccess: () => {
      toast.success("Deleted — it can be restored from the audit trail");
      setConfirmingDelete(null);
      void invalidate();
    },
    onError: (err: unknown) => {
      toast.error(describe(err));
      setConfirmingDelete(null);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.post(`/${resource}/${id}/restore`),
    onSuccess: () => {
      toast.success("Restored");
      void invalidate();
    },
    onError: (err: unknown) => toast.error(describe(err)),
  });

  const rows = data?.items ?? [];
  const pageInfo = data?.pageInfo;

  const canCreate = can(Permission.CONTENT_CREATE);
  const canUpdate = can(Permission.CONTENT_UPDATE);
  const canPublish = can(Permission.CONTENT_PUBLISH);
  const canDelete = can(Permission.CONTENT_DELETE);

  const resolveEditHref = editHref ?? ((row: T) => `/dashboard/${resource}/${row.id}`);

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          canCreate && newHref ? (
            <Link href={newHref} className="btn-primary">
              <Plus className="h-3.5 w-3.5" />
              New
            </Link>
          ) : null
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="input pl-9"
            aria-label={searchPlaceholder}
          />
        </div>

        {pageInfo && (
          <p className="ml-auto font-mono text-micro uppercase tracking-[0.08em] text-ink-400">
            {pageInfo.total} {pageInfo.total === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      {isLoading ? (
        <LoadingPanel />
      ) : isError ? (
        <div className="panel border-danger/30 bg-danger-50 px-4 py-6 text-sm text-danger-ink">
          {describe(error)}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title={emptyTitle ?? (debounced ? "No matches" : `No ${title.toLowerCase()} yet`)}
          description={
            debounced
              ? "Nothing matches that search. Try a different term."
              : (emptyDescription ?? "Create the first one to see it here.")
          }
          action={canCreate && newHref && !debounced ? { label: "Create one", href: newHref } : undefined}
        />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.header} scope="col" className={cn("table-head", column.className)}>
                      {column.header}
                    </th>
                  ))}
                  {hasStatus && <th className="table-head w-24">Status</th>}
                  <th className="table-head w-28">Updated</th>
                  <th className="table-head w-[7.5rem] text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => {
                  const isDeleted = Boolean(row.deletedAt);
                  const isPublished = row.status === "PUBLISHED";

                  return (
                    <tr key={row.id} className={cn("table-row", isDeleted && "opacity-50")}>
                      {columns.map((column) => (
                        <td key={column.header} className={cn("table-cell", column.className)}>
                          {column.cell(row)}
                        </td>
                      ))}

                      {hasStatus && (
                        <td className="table-cell">
                          {row.status ? <StatusBadge status={row.status} /> : null}
                        </td>
                      )}

                      <td className="table-cell whitespace-nowrap text-xs text-ink-400">
                        {relativeTime(row.updatedAt)}
                      </td>

                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-0.5">
                          {isDeleted ? (
                            canDelete && (
                              <button
                                type="button"
                                onClick={() => restoreMutation.mutate(row.id)}
                                disabled={restoreMutation.isPending}
                                title="Restore"
                                className="btn-ghost btn-sm"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            )
                          ) : (
                            <>
                              {hasStatus && canPublish && row.status && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    publishMutation.mutate({ id: row.id, publish: !isPublished })
                                  }
                                  disabled={publishMutation.isPending}
                                  title={isPublished ? "Take off the live site" : "Publish"}
                                  className="btn-ghost btn-sm"
                                >
                                  {isPublished ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                  ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}

                              {canUpdate && (
                                <Link
                                  href={resolveEditHref(row)}
                                  title="Edit"
                                  className="btn-ghost btn-sm"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Link>
                              )}

                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    confirmingDelete === row.id
                                      ? deleteMutation.mutate(row.id)
                                      : setConfirmingDelete(row.id)
                                  }
                                  onBlur={() => setConfirmingDelete(null)}
                                  disabled={deleteMutation.isPending}
                                  title="Delete"
                                  className={cn(
                                    "btn-sm",
                                    confirmingDelete === row.id
                                      ? "btn-danger"
                                      : "btn-ghost hover:text-danger",
                                  )}
                                >
                                  {deleteMutation.isPending && confirmingDelete === row.id ? (
                                    <Spinner className="h-3.5 w-3.5" />
                                  ) : confirmingDelete === row.id ? (
                                    /* Click-to-confirm in place, rather than a
                                       modal: the row stays visible, so you can
                                       still see what you are about to remove. */
                                    "Sure?"
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pageInfo && pageInfo.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
              <p className="font-mono text-micro uppercase tracking-[0.08em] text-ink-400">
                Page {pageInfo.page} of {pageInfo.totalPages}
              </p>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pageInfo.hasPrev}
                  className="btn-secondary btn-sm"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pageInfo.hasNext}
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

/** Turns any thrown value into something worth showing a person. */
export function describe(error: unknown): string {
  if (error instanceof ApiError) {
    const fields = error.fields?.map((f) => f.message).join(" · ");
    return fields ? `${error.message} ${fields}` : error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

/* A local debounce, rather than a dependency for eight lines. */
import { useEffect } from "react";

function useDebouncedEffect(effect: () => void, deps: unknown[], delay: number): void {
  useEffect(() => {
    const timer = setTimeout(effect, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}

"use client";

import { type MediaAsset, MediaPurpose, Permission } from "@funavry/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { describe } from "@/components/resource/resource-table";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
import { LoadingPanel, Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-client";
import { cn, formatBytes, formatDateTime } from "@/lib/utils";

const PURPOSE_LABELS: Record<MediaPurpose, string> = {
  [MediaPurpose.CASE_STUDY_CAPTURE]: "Case study capture",
  [MediaPurpose.CASE_STUDY_MOBILE]: "Case study mobile",
  [MediaPurpose.TEAM_PORTRAIT]: "Portrait",
  [MediaPurpose.CLIENT_LOGO]: "Client logo",
  [MediaPurpose.PARTNER_LOGO]: "Partner logo",
  [MediaPurpose.INDUSTRY_COVER]: "Industry cover",
  [MediaPurpose.POST_HERO]: "Post hero",
  [MediaPurpose.TESTIMONIAL_AVATAR]: "Testimonial avatar",
  [MediaPurpose.OFFICE_FLAG]: "Office flag",
  [MediaPurpose.TECH_LOGO]: "Technology logo",
  [MediaPurpose.GENERAL]: "General",
};

export default function MediaPage() {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [purpose, setPurpose] = useState<MediaPurpose>(MediaPurpose.GENERAL);
  const [filter, setFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["media", { page, filter }],
    queryFn: () =>
      api.list<MediaAsset>("/media", { page, limit: 24, purpose: filter || undefined }),
  });

  const uploadMutation = useMutation({
    mutationFn: (form: FormData) => api.upload<MediaAsset>("/media/upload", form),
    onSuccess: (asset) => {
      toast.success(`Uploaded ${asset.originalName}`);
      setPendingFile(null);
      setAlt("");
      if (fileRef.current) fileRef.current.value = "";
      void queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    onError: (err: unknown) => toast.error(describe(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    /* The API refuses while content still references the asset, and that
       message names how many — worth surfacing verbatim. */
    onError: (err: unknown) => toast.error(describe(err)),
  });

  function handleUpload() {
    if (!pendingFile || !alt.trim()) return;

    const form = new FormData();
    form.append("file", pendingFile);
    form.append("purpose", purpose);
    form.append("alt", alt.trim());

    uploadMutation.mutate(form);
  }

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Media"
        description="Every uploaded image. Raster files are re-encoded to WebP on upload, which strips EXIF and generates the blur placeholder the site renders while an image loads."
      />

      {can(Permission.MEDIA_UPLOAD) && (
        <div className="panel mb-5 p-4">
          <p className="eyebrow mb-3">Upload</p>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
            <div>
              <label htmlFor="media-file" className="field-label">
                File
              </label>
              <input
                id="media-file"
                ref={fileRef}
                type="file"
                accept="image/webp,image/png,image/jpeg,image/avif,image/svg+xml"
                onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
                className="input file:mr-3 file:border-0 file:bg-paper-deep file:px-3 file:py-1 file:font-mono file:text-micro file:uppercase file:tracking-[0.08em] file:text-ink-500"
              />
            </div>

            <div>
              <label htmlFor="media-purpose" className="field-label">
                Used for
              </label>
              <select
                id="media-purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as MediaPurpose)}
                className="select"
              >
                {Object.values(MediaPurpose).map((value) => (
                  <option key={value} value={value}>
                    {PURPOSE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor="media-alt" className="field-label">
              Alt text — required
            </label>
            <input
              id="media-alt"
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="What the image shows, for anyone who cannot see it"
              className="input"
              maxLength={320}
            />
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!pendingFile || !alt.trim() || uploadMutation.isPending}
            className="btn-primary mt-3"
          >
            {uploadMutation.isPending ? (
              <>
                <Spinner className="border-paper-white/40 border-t-paper-white" />
                Uploading
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                Upload
              </>
            )}
          </button>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by purpose"
          className="select w-56"
        >
          <option value="">All purposes</option>
          {Object.values(MediaPurpose).map((value) => (
            <option key={value} value={value}>
              {PURPOSE_LABELS[value]}
            </option>
          ))}
        </select>

        {data && (
          <p className="ml-auto font-mono text-micro uppercase tracking-[0.08em] text-ink-400">
            {data.pageInfo.total} assets
          </p>
        )}
      </div>

      {isLoading ? (
        <LoadingPanel />
      ) : !data?.items.length ? (
        <EmptyState
          title="No media yet"
          description="Upload an image above, and it becomes available to every content type."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {data.items.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelected(asset)}
                className={cn(
                  "panel group overflow-hidden text-left transition-colors hover:border-ink-400",
                  selected?.id === asset.id && "border-azure ring-1 ring-azure",
                )}
              >
                <span className="flex h-28 w-full items-center justify-center overflow-hidden bg-paper-deep">
                  <Image
                    src={asset.url}
                    alt={asset.alt}
                    width={asset.width ?? 240}
                    height={asset.height ?? 160}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                </span>

                <span className="block border-t border-line px-2 py-1.5">
                  <span className="block truncate text-xs font-medium">{asset.originalName}</span>
                  <span className="block truncate font-mono text-micro uppercase tracking-[0.06em] text-ink-400">
                    {asset.width && asset.height ? `${asset.width}×${asset.height}` : asset.mimeType}
                    {" · "}
                    {formatBytes(asset.size)}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {data.pageInfo.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.pageInfo.hasPrev}
                className="btn-secondary btn-sm"
              >
                Prev
              </button>
              <span className="font-mono text-micro uppercase tracking-[0.08em] text-ink-400">
                {data.pageInfo.page} / {data.pageInfo.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pageInfo.hasNext}
                className="btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------------- detail pane */}
      {selected && (
        <aside className="panel fixed bottom-4 right-4 z-30 w-[22rem] shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <p className="truncate text-sm font-medium">{selected.originalName}</p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="btn-ghost btn-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex h-36 items-center justify-center bg-paper-deep">
            <Image
              src={selected.url}
              alt={selected.alt}
              width={selected.width ?? 320}
              height={selected.height ?? 200}
              className="h-full w-full object-contain"
              unoptimized
            />
          </div>

          <dl className="space-y-1.5 px-3 py-3 text-xs">
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-ink-400">Alt</dt>
              <dd className="text-ink-500">{selected.alt || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-ink-400">Type</dt>
              <dd className="font-mono text-ink-500">{selected.mimeType}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-ink-400">Size</dt>
              <dd className="text-ink-500">
                {formatBytes(selected.size)}
                {selected.width && ` · ${selected.width}×${selected.height}`}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-ink-400">Blur</dt>
              <dd className="text-ink-500">
                {selected.blurDataUrl ? (
                  <span className="inline-flex items-center gap-1 text-success-ink">
                    <Check className="h-3 w-3" /> generated
                  </span>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-ink-400">Added</dt>
              <dd className="text-ink-500">{formatDateTime(selected.createdAt)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-ink-400">URL</dt>
              <dd className="min-w-0">
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block truncate font-mono text-azure-ink underline-offset-2 hover:underline"
                >
                  {selected.url}
                </a>
              </dd>
            </div>
          </dl>

          {can(Permission.MEDIA_DELETE) && (
            <div className="border-t border-line p-3">
              <button
                type="button"
                onClick={() => deleteMutation.mutate(selected.id)}
                disabled={deleteMutation.isPending}
                className="btn-danger btn-sm w-full"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
              <p className="mt-1.5 text-center text-micro text-ink-400">
                Refused while any content still uses it.
              </p>
            </div>
          )}
        </aside>
      )}
    </>
  );
}

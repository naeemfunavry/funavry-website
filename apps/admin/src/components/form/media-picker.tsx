"use client";

import { type MediaAsset, MediaPurpose } from "@funavry/types";
import { useQuery } from "@tanstack/react-query";
import { ImageOff, Search, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/**
 * Picks an image from the library.
 *
 * Filtered to a purpose by default, because the per-purpose upload rules mean a
 * 2MB logo and a 10MB dashboard capture are genuinely different kinds of thing
 * — offering all 95 assets for a flag slot is not a shortcut, it is a way to
 * put a screenshot where a flag belongs.
 */
export function MediaPicker({
  value,
  onChange,
  purpose,
  label,
  hint,
}: {
  value: MediaAsset | { id: string; url: string; alt: string } | null;
  onChange: (asset: MediaAsset | null) => void;
  purpose: MediaPurpose;
  label: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["media", "picker", purpose, search],
    queryFn: () =>
      api.list<MediaAsset>("/media", { limit: 36, purpose, q: search || undefined }),
    enabled: open,
  });

  return (
    <div>
      <p className="field-label">{label}</p>

      <div className="flex items-start gap-3">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center border border-line bg-paper-deep">
          {value ? (
            <Image
              src={value.url}
              alt={value.alt}
              width={128}
              height={80}
              className="h-full w-full object-contain"
              unoptimized
            />
          ) : (
            <ImageOff className="h-5 w-5 text-ink-400" aria-hidden />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={() => setOpen((v) => !v)} className="btn-secondary btn-sm">
            {value ? "Replace" : "Choose image"}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="btn-ghost btn-sm hover:text-danger"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {hint && <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{hint}</p>}

      {open && (
        <div className="panel mt-3 p-3">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename or alt text…"
              aria-label="Search media"
              className="input pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !data?.items.length ? (
            <p className="py-8 text-center text-xs text-ink-400">
              No images filed under this purpose yet. Upload one from the Media section.
            </p>
          ) : (
            <div className="scrollbar-thin grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 lg:grid-cols-6">
              {data.items.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    onChange(asset);
                    setOpen(false);
                  }}
                  title={asset.alt || asset.originalName}
                  className={cn(
                    "border bg-paper-deep p-1 transition-colors hover:border-ink-400",
                    value?.id === asset.id ? "border-azure ring-1 ring-azure" : "border-line",
                  )}
                >
                  <Image
                    src={asset.url}
                    alt=""
                    width={120}
                    height={80}
                    className="h-16 w-full object-contain"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

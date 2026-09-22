import type { ContentStatus } from "../enums";

/**
 * Fields every content resource returns. Split out so the read models stay
 * declarative and a change to the lifecycle shape lands in one place.
 */
export interface ContentTimestamps {
  /** ISO-8601. */
  createdAt: string;
  updatedAt: string;
  /** Set the first time the row reached PUBLISHED; never cleared afterwards. */
  publishedAt: string | null;
}

export interface ContentLifecycle extends ContentTimestamps {
  status: ContentStatus;
  /**
   * Row version, incremented on every save.
   *
   * The admin sends this back as `expectedVersion` when it updates, and the
   * server refuses a mismatch. That is what turns two editors on one case study
   * into a visible conflict rather than a silent last-write-wins — so it has to
   * be on the read model, not just in the database.
   */
  version: number;
}

/** An image as the front-ends consume it: a URL plus what layout needs. */
export interface MediaRef {
  id: string;
  /** Absolute or origin-relative URL, ready for `next/image`. */
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  /** Base64 LQIP, so a DB-driven image keeps the blur placeholder the
      statically-imported one had. Null until the derivative is generated. */
  blurDataUrl: string | null;
  mimeType: string;
}

/** Per-page SEO overrides. Null fields fall back to the site defaults. */
export interface SeoMeta {
  title: string | null;
  description: string | null;
  ogImage: MediaRef | null;
  canonicalUrl: string | null;
  noIndex: boolean;
}

/** Query shape accepted by every list endpoint. */
export interface ListQuery {
  page?: number;
  limit?: number;
  /** Free-text search across the resource's designated searchable columns. */
  q?: string;
  status?: ContentStatus;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
  /** Admin-only: include soft-deleted rows. */
  includeDeleted?: boolean;
}

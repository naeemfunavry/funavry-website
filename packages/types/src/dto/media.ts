import type { MediaPurpose, StorageDriver } from "../enums";

/** A stored file, as the admin media library lists it. */
export interface MediaAsset {
  id: string;
  /** Storage key. Random — never the client's filename. */
  storageKey: string;
  /** Public URL, resolved for whichever driver holds the file. */
  url: string;
  /** The original upload name, kept for display only. */
  originalName: string;
  mimeType: string;
  /** Bytes. */
  size: number;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  alt: string;
  caption: string | null;
  purpose: MediaPurpose;
  driver: StorageDriver;
  /** SHA-256 of the stored bytes — dedupes re-uploads of the same file. */
  checksum: string;
  uploadedById: string | null;
  createdAt: string;
}

/** Per-purpose upload limits, enforced server-side and mirrored in the UI. */
export interface UploadConstraints {
  maxBytes: number;
  allowedMimeTypes: string[];
  maxWidth: number | null;
  maxHeight: number | null;
}

/**
 * The storage contract.
 *
 * Every consumer depends on this rather than on a driver, which is what makes
 * the move to S3 a change of one provider binding instead of a sweep through
 * the media service. The signatures are deliberately object-storage-shaped —
 * a key, bytes in, a URL out — so the local driver cannot accidentally expose
 * filesystem semantics (directories, renames, paths) that S3 has no equivalent
 * for and that would then have to be unwound later.
 */
export interface StoredFile {
  key: string;
  url: string;
  size: number;
}

export const STORAGE_DRIVER = Symbol("STORAGE_DRIVER");

export interface StorageDriverPort {
  save(key: string, data: Buffer, contentType: string): Promise<StoredFile>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  /** The public URL for a key. Sync — callers use it while composing a DTO. */
  urlFor(key: string): string;
}

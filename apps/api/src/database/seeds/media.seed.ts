import { MediaPurpose, StorageDriver } from "@funavry/types";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import sharp from "sharp";
import type { DataSource, EntityManager } from "typeorm";

import { MediaAssetEntity } from "../entities";

/**
 * Imports an image that currently lives in the web app's /public into the
 * media library.
 *
 * The file is copied rather than referenced. Once content is database-driven,
 * an image referenced by a path into another package's source tree is a
 * dependency nobody can see: move or rename it and the site breaks with no
 * compile error. Copying makes the media library the actual source of truth
 * and lets /public shrink to the handful of files the app still ships itself.
 *
 * Dimensions and the blur placeholder are derived here, so DB-driven images
 * keep the layout stability and the LQIP that `next/image`'s static imports
 * gave them for free.
 */
export interface SeedMediaOptions {
  /** Absolute path to the source file. */
  sourcePath: string;
  /** The public path it was referenced by, e.g. "/clients/webp/aws.webp". */
  publicPath: string;
  purpose: MediaPurpose;
  alt: string;
  uploadDir: string;
}

const EXTENSION_MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export class MediaSeeder {
  /** publicPath → media id, so a shared image is imported once. */
  private readonly cache = new Map<string, string>();

  constructor(
    private readonly dataSource: DataSource,
    private readonly uploadDir: string,
    private readonly webPublicDir: string,
  ) {}

  /**
   * Binds the seeder to a transaction's EntityManager.
   *
   * This is not optional plumbing. The content seed runs inside one
   * transaction, which holds locks on media_assets through its foreign keys;
   * a repository taken from the DataSource would check out a *different*
   * pooled connection, and its insert would block on those locks until MySQL
   * gave up with "Lock wait timeout exceeded". Every write has to go through
   * the same manager to be part of the same transaction.
   */
  withManager(manager: EntityManager): BoundMediaSeeder {
    return new BoundMediaSeeder(this, manager);
  }

  /**
   * Imports the file a public path points at, returning its media id.
   *
   * Returns null when the file is missing rather than throwing: the content
   * files reference a few images that were never supplied, and the site already
   * renders a placeholder for those. Failing the whole seed over a missing
   * decorative image would be the wrong trade.
   */
  async importByPublicPath(
    manager: EntityManager,
    publicPath: string,
    purpose: MediaPurpose,
    alt: string,
  ): Promise<string | null> {
    if (!publicPath) return null;

    const cached = this.cache.get(publicPath);
    if (cached) return cached;

    const relative = publicPath.replace(/^\//, "");
    const sourcePath = path.join(this.webPublicDir, relative);

    try {
      await fs.access(sourcePath);
    } catch {
      return null;
    }

    const id = await this.importFile(manager, {
      sourcePath,
      publicPath,
      purpose,
      alt,
      uploadDir: this.uploadDir,
    });

    this.cache.set(publicPath, id);

    return id;
  }

  private async importFile(
    manager: EntityManager,
    options: SeedMediaOptions,
  ): Promise<string> {
    const repo = manager.getRepository(MediaAssetEntity);

    const bytes = await fs.readFile(options.sourcePath);
    const checksum = createHash("sha256").update(bytes).digest("hex");

    /* Same bytes for the same purpose means this ran before — re-running the
       seed should be idempotent, not duplicate the whole library. */
    const existing = await repo.findOne({
      where: { checksum, purpose: options.purpose },
    });

    if (existing) return existing.id;

    const extension = path.extname(options.sourcePath).toLowerCase();
    const mimeType = EXTENSION_MIME[extension] ?? "application/octet-stream";

    let width: number | null = null;
    let height: number | null = null;
    let blurDataUrl: string | null = null;

    if (mimeType !== "image/svg+xml") {
      try {
        const metadata = await sharp(bytes).metadata();
        width = metadata.width ?? null;
        height = metadata.height ?? null;

        const blur = await sharp(bytes).resize(16).webp({ quality: 40 }).toBuffer();
        blurDataUrl = `data:image/webp;base64,${blur.toString("base64")}`;
      } catch {
        /* A file sharp cannot read still gets a row — it is referenced by
           content that exists, and the admin can replace it. */
      }
    }

    /* The storage key mirrors the original public path under a purpose folder,
       which keeps the uploads directory browsable and makes it obvious where a
       seeded asset came from. Uploads from the panel get random keys instead. */
    const key = `${options.purpose.toLowerCase()}/${options.publicPath
      .replace(/^\//, "")
      .replace(/[^\w./-]/g, "_")}`;

    const target = path.join(this.uploadDir, key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes, { mode: 0o640 });

    const saved = await repo.save(
      repo.create({
        storageKey: key,
        originalName: path.basename(options.sourcePath),
        mimeType,
        size: String(bytes.length),
        width,
        height,
        blurDataUrl,
        alt: options.alt.slice(0, 320),
        purpose: options.purpose,
        driver: StorageDriver.LOCAL,
        checksum,
        uploadedById: null,
      }),
    );

    return saved.id;
  }

  get importedCount(): number {
    return this.cache.size;
  }
}

/**
 * A MediaSeeder already bound to a transaction, so the content seed does not
 * have to thread the EntityManager through every call.
 */
export class BoundMediaSeeder {
  constructor(
    private readonly seeder: MediaSeeder,
    private readonly manager: EntityManager,
  ) {}

  importByPublicPath(
    publicPath: string,
    purpose: MediaPurpose,
    alt: string,
  ): Promise<string | null> {
    return this.seeder.importByPublicPath(this.manager, publicPath, purpose, alt);
  }

  get importedCount(): number {
    return this.seeder.importedCount;
  }
}

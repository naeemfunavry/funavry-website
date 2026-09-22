import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import {
  AuditAction,
  AuditResource,
  type MediaAsset,
  MediaPurpose,
  type Paginated,
  StorageDriver as StorageDriverEnum,
} from "@funavry/types";
import { PinoLogger } from "nestjs-pino";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { Repository } from "typeorm";

import { storageConfig } from "src/config/configuration";
import { MediaAssetEntity } from "src/database/entities";
import {
  PayloadTooLargeException,
  ResourceNotFoundException,
  UnsupportedMediaException,
  ConflictException,
} from "src/common/exceptions/app.exception";
import { AuditService } from "src/modules/audit/audit.service";

import { MediaQueryDto, UpdateMediaDto } from "./dto/media.dto";
import { STORAGE_DRIVER, type StorageDriverPort } from "./storage/storage.interface";

/**
 * What each kind of image is allowed to be.
 *
 * Per-purpose rather than one global rule: a client logo has no business being
 * a 10MB file, and a case-study capture legitimately is one. A single permissive
 * limit would have to be the loosest of these.
 */
const CONSTRAINTS: Record<MediaPurpose, { maxBytes: number; mimeTypes: string[] }> = {
  [MediaPurpose.CASE_STUDY_CAPTURE]: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ["image/webp", "image/png", "image/jpeg", "image/avif"],
  },
  [MediaPurpose.CASE_STUDY_MOBILE]: {
    maxBytes: 8 * 1024 * 1024,
    mimeTypes: ["image/webp", "image/png", "image/jpeg", "image/avif"],
  },
  [MediaPurpose.TEAM_PORTRAIT]: {
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/webp", "image/png", "image/jpeg"],
  },
  [MediaPurpose.CLIENT_LOGO]: {
    maxBytes: 2 * 1024 * 1024,
    mimeTypes: ["image/webp", "image/png", "image/svg+xml"],
  },
  [MediaPurpose.PARTNER_LOGO]: {
    maxBytes: 2 * 1024 * 1024,
    mimeTypes: ["image/webp", "image/png", "image/svg+xml"],
  },
  [MediaPurpose.INDUSTRY_COVER]: {
    maxBytes: 6 * 1024 * 1024,
    mimeTypes: ["image/webp", "image/png", "image/jpeg"],
  },
  [MediaPurpose.POST_HERO]: {
    maxBytes: 6 * 1024 * 1024,
    mimeTypes: ["image/webp", "image/png", "image/jpeg"],
  },
  [MediaPurpose.TESTIMONIAL_AVATAR]: {
    maxBytes: 2 * 1024 * 1024,
    mimeTypes: ["image/webp", "image/png", "image/jpeg"],
  },
  [MediaPurpose.OFFICE_FLAG]: {
    maxBytes: 512 * 1024,
    mimeTypes: ["image/svg+xml", "image/webp", "image/png"],
  },
  [MediaPurpose.TECH_LOGO]: {
    maxBytes: 1024 * 1024,
    mimeTypes: ["image/svg+xml", "image/webp", "image/png"],
  },
  [MediaPurpose.GENERAL]: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ["image/webp", "image/png", "image/jpeg", "image/avif"],
  },
};

/** Raster formats are re-encoded; SVG is handled separately. */
const RASTER_MIME = new Set(["image/webp", "image/png", "image/jpeg", "image/avif"]);

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaAssetEntity)
    private readonly repo: Repository<MediaAssetEntity>,
    @Inject(STORAGE_DRIVER)
    private readonly storage: StorageDriverPort,
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
    private readonly audit: AuditService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(MediaService.name);
  }

  /**
   * Accepts an upload.
   *
   * The order of the checks matters. Size is rejected first because it is free.
   * The declared MIME type is then thrown away and the real one is read from the
   * file's magic bytes — `Content-Type` is supplied by the client and a
   * `.png`-named PHP script will happily claim `image/png`. Only once the bytes
   * say what they are does anything get written.
   *
   * Raster images are then re-encoded rather than stored as received. That is
   * the step that neutralises a polyglot file — one that is a valid PNG *and* a
   * valid script — because re-encoding keeps the pixels and discards everything
   * else, including EXIF, which routinely carries the GPS coordinates of
   * wherever a photo was taken.
   */
  async upload(
    file: Express.Multer.File,
    purpose: MediaPurpose,
    alt: string,
    uploadedById: string | null,
  ): Promise<MediaAsset> {
    const rules = CONSTRAINTS[purpose] ?? CONSTRAINTS[MediaPurpose.GENERAL];

    if (file.size > rules.maxBytes) throw new PayloadTooLargeException(rules.maxBytes);
    if (file.size === 0) throw new UnsupportedMediaException("The file is empty.");

    const detected = await this.detectMimeType(file.buffer);

    if (!detected) {
      throw new UnsupportedMediaException(
        "The file type could not be determined from its contents.",
      );
    }

    if (!rules.mimeTypes.includes(detected)) {
      throw new UnsupportedMediaException(
        `${detected} is not allowed for ${purpose}. Allowed: ${rules.mimeTypes.join(", ")}.`,
      );
    }

    let bytes = file.buffer;
    let width: number | null = null;
    let height: number | null = null;
    let blurDataUrl: string | null = null;
    let finalMime = detected;
    let extension = this.extensionFor(detected);

    if (RASTER_MIME.has(detected)) {
      const processed = await this.processRaster(bytes, purpose);
      bytes = processed.buffer;
      width = processed.width;
      height = processed.height;
      blurDataUrl = processed.blurDataUrl;
      finalMime = "image/webp";
      extension = "webp";
    } else if (detected === "image/svg+xml") {
      bytes = this.sanitizeSvg(bytes);
    }

    const checksum = createHash("sha256").update(bytes).digest("hex");

    /* Same bytes, same purpose: hand back the existing row rather than growing
       a second copy of a logo that was re-uploaded. */
    const duplicate = await this.repo.findOne({ where: { checksum, purpose } });
    if (duplicate) {
      this.logger.debug({ id: duplicate.id, checksum }, "Upload matched an existing asset");
      return this.toDto(duplicate);
    }

    /* Server-generated key. The client's filename never touches the
       filesystem — it is kept in originalName for display only. */
    const key = `${purpose.toLowerCase()}/${randomUUID()}.${extension}`;

    const stored = await this.storage.save(key, bytes, finalMime);

    const entity = this.repo.create({
      storageKey: stored.key,
      originalName: this.safeName(file.originalname),
      mimeType: finalMime,
      size: String(stored.size),
      width,
      height,
      blurDataUrl,
      alt: alt.slice(0, 320),
      purpose,
      driver:
        this.config.driver === "S3" ? StorageDriverEnum.S3 : StorageDriverEnum.LOCAL,
      checksum,
      uploadedById,
    });

    const saved = await this.repo.save(entity);

    await this.audit.record({
      action: AuditAction.MEDIA_UPLOAD,
      resource: AuditResource.MEDIA,
      resourceId: saved.id,
      resourceLabel: saved.originalName,
      success: true,
    });

    return this.toDto(saved);
  }

  /**
   * Reads the format from the file's own bytes.
   *
   * `file-type` inspects magic numbers, so the answer comes from the content
   * rather than from a header the uploader chose. SVG has no magic number — it
   * is XML — so it is matched by a conservative sniff of the opening bytes.
   */
  private async detectMimeType(buffer: Buffer): Promise<string | null> {
    /* file-type v16 is CommonJS and exposes `fromBuffer`; v17+ is ESM-only and
       renamed it to `fileTypeFromBuffer`. Pinned to v16 so this stays a plain
       require from a CommonJS Nest build. */
    const { fromBuffer } = await import("file-type");

    const detected = await fromBuffer(buffer);
    if (detected) return detected.mime;

    const head = buffer.subarray(0, 1024).toString("utf8").trimStart();
    if (head.startsWith("<?xml") || head.startsWith("<svg")) {
      if (/<svg[\s>]/i.test(head)) return "image/svg+xml";
    }

    return null;
  }

  /**
   * Re-encodes a raster image to WebP and derives the blur placeholder.
   *
   * `failOn: "error"` makes sharp reject a malformed file rather than doing its
   * best with it — a decoder coaxed into a bad state is where image-library CVEs
   * live, and there is no reason to be lenient with an upload.
   *
   * `limitInputPixels` caps the decoded dimensions. A "decompression bomb" is a
   * small file that expands to a 50,000 × 50,000 image, and without a cap
   * decoding it exhausts the heap — a denial of service from a 2KB upload.
   */
  private async processRaster(
    buffer: Buffer,
    purpose: MediaPurpose,
  ): Promise<{ buffer: Buffer; width: number; height: number; blurDataUrl: string }> {
    const pipeline = sharp(buffer, {
      failOn: "error",
      limitInputPixels: 50_000_000,
      sequentialRead: true,
    });

    const metadata = await pipeline.metadata();

    if (!metadata.width || !metadata.height) {
      throw new UnsupportedMediaException("The image dimensions could not be read.");
    }

    const maxWidth = purpose === MediaPurpose.CASE_STUDY_CAPTURE ? 2400 : 1600;

    const output = await sharp(buffer, { failOn: "error", limitInputPixels: 50_000_000 })
      .rotate() // applies the EXIF orientation before that metadata is dropped
      .resize({ width: maxWidth, withoutEnlargement: true })
      /* q90, not the default 80: the case-study captures are dashboards, and
         what a lower quality spends its bit budget on first is exactly the
         small table type those screenshots exist to show. */
      .webp({ quality: 90, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    /* A 16px-wide WebP, inlined as a data URL — the same blur placeholder
       next/image derives from a static import, which a URL-sourced image
       otherwise loses. */
    const blur = await sharp(buffer, { failOn: "error", limitInputPixels: 50_000_000 })
      .resize(16)
      .webp({ quality: 40 })
      .toBuffer();

    return {
      buffer: output.data,
      width: output.info.width,
      height: output.info.height,
      blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
    };
  }

  /**
   * Strips the executable surface out of an SVG.
   *
   * An SVG is a document, not a picture: it can carry <script>, event handlers,
   * <foreignObject> with arbitrary HTML, and external references. Served from
   * the same origin as the admin panel, a hostile one is stored XSS with a
   * session token in reach. Logos are the reason SVG is accepted at all, and a
   * logo needs none of the constructs removed below.
   */
  private sanitizeSvg(buffer: Buffer): Buffer {
    let svg = buffer.toString("utf8");

    svg = svg
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
      .replace(/<!ENTITY[\s\S]*?>/gi, "")
      .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
      /* Every on* handler, quoted either way. */
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
      /* javascript: and data: URLs in href/xlink:href. */
      .replace(/(href|xlink:href)\s*=\s*"(?:javascript|data):[^"]*"/gi, "")
      .replace(/(href|xlink:href)\s*=\s*'(?:javascript|data):[^']*'/gi, "");

    if (/<script|javascript:|<foreignObject/i.test(svg)) {
      throw new UnsupportedMediaException(
        "This SVG contains active content that could not be removed safely.",
      );
    }

    return Buffer.from(svg, "utf8");
  }

  /** Display-only, so it is stripped of anything that could be a path. */
  private safeName(name: string): string {
    return name
      .replace(/[/\\]/g, "_")
      .replace(/[^\w.\- ]/g, "")
      .slice(0, 255) || "upload";
  }

  private extensionFor(mime: string): string {
    const map: Record<string, string> = {
      "image/webp": "webp",
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/avif": "avif",
      "image/svg+xml": "svg",
    };
    return map[mime] ?? "bin";
  }

  /* ------------------------------------------------------------- queries - */

  async findAll(query: MediaQueryDto): Promise<Paginated<MediaAsset>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;

    const qb = this.repo.createQueryBuilder("m");

    if (query.purpose) qb.andWhere("m.purpose = :purpose", { purpose: query.purpose });

    if (query.q) {
      qb.andWhere("(m.originalName LIKE :q OR m.alt LIKE :q)", {
        q: `%${query.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`,
      });
    }

    const [items, total] = await qb
      .orderBy("m.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items: items.map((i) => this.toDto(i)),
      pageInfo: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<MediaAsset> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new ResourceNotFoundException("Media asset", id);
    return this.toDto(found);
  }

  async update(id: string, dto: UpdateMediaDto): Promise<MediaAsset> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new ResourceNotFoundException("Media asset", id);

    if (dto.alt !== undefined) found.alt = dto.alt;
    if (dto.caption !== undefined) found.caption = dto.caption;
    if (dto.purpose !== undefined) found.purpose = dto.purpose;

    const saved = await this.repo.save(found);
    return this.toDto(saved);
  }

  /**
   * Deletes an asset and its bytes.
   *
   * Refuses while anything still points at it. The alternative — a cascade, or
   * a nulled foreign key — would silently blank an image on a live page, and
   * the editor would find out from the site rather than from the panel.
   */
  async remove(id: string): Promise<{ id: string; deleted: true }> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new ResourceNotFoundException("Media asset", id);

    const references = await this.countReferences(id);

    if (references > 0) {
      throw new ConflictException(
        `This image is used by ${references} item${references === 1 ? "" : "s"}. Remove those references first.`,
      );
    }

    await this.repo.softRemove(found);

    /* The row is soft-deleted, the bytes are removed. Keeping the file would
       leave an unreferenced object nothing will ever clean up, and the row
       retains everything needed to audit what was deleted. */
    await this.storage.delete(found.storageKey);

    await this.audit.record({
      action: AuditAction.MEDIA_DELETE,
      resource: AuditResource.MEDIA,
      resourceId: id,
      resourceLabel: found.originalName,
      success: true,
    });

    return { id, deleted: true };
  }

  /** Counts inbound references across every table that can hold a media id. */
  private async countReferences(mediaId: string): Promise<number> {
    const checks: [string, string][] = [
      ["case_studies", "imageId"],
      ["case_studies", "mobileImageId"],
      ["case_study_screenshots", "mediaId"],
      ["industries", "imageId"],
      ["posts", "imageId"],
      ["leaders", "photoId"],
      ["team_members", "photoId"],
      ["testimonials", "avatarId"],
      ["offices", "flagId"],
      ["clients", "logoId"],
      ["technologies", "logoId"],
      ["users", "avatarId"],
    ];

    let total = 0;

    for (const [table, column] of checks) {
      /* Table and column names come from the literal list above, never from a
         request — the only safe way to interpolate an identifier. */
      const rows: { count: string }[] = await this.repo.manager.query(
        `SELECT COUNT(*) AS count FROM \`${table}\` WHERE \`${column}\` = ?`,
        [mediaId],
      );
      total += Number(rows[0]?.count ?? 0);
    }

    return total;
  }

  toDto(entity: MediaAssetEntity): MediaAsset {
    return {
      id: entity.id,
      storageKey: entity.storageKey,
      url: this.storage.urlFor(entity.storageKey),
      originalName: entity.originalName,
      mimeType: entity.mimeType,
      size: Number(entity.size),
      width: entity.width,
      height: entity.height,
      blurDataUrl: entity.blurDataUrl,
      alt: entity.alt,
      caption: entity.caption,
      purpose: entity.purpose,
      driver: entity.driver,
      checksum: entity.checksum,
      uploadedById: entity.uploadedById,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}

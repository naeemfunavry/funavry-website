import { MediaPurpose, StorageDriver } from "@funavry/types";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";

/**
 * A stored file.
 *
 * `storageKey` is server-generated and random — the client's filename is kept
 * in `originalName` for display only and never touches the filesystem. That is
 * the whole defence against path traversal and against a file called
 * `avatar.php` landing somewhere that will execute it.
 *
 * `checksum` is a SHA-256 of the stored bytes, uniquely indexed per purpose so
 * re-uploading the same logo returns the existing row instead of growing a
 * second copy.
 */
@Entity("media_assets")
@Index("idx_media_purpose", ["purpose"])
@Index("idx_media_checksum_purpose", ["checksum", "purpose"], { unique: true })
export class MediaAssetEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 512 })
  storageKey: string;

  @Column({ type: "varchar", length: 255 })
  originalName: string;

  /** Determined by sniffing the magic bytes, never from the upload's header. */
  @Column({ type: "varchar", length: 128 })
  mimeType: string;

  @Column({ type: "bigint", unsigned: true })
  size: string;

  @Column({ type: "int", unsigned: true, nullable: true })
  width: number | null;

  @Column({ type: "int", unsigned: true, nullable: true })
  height: number | null;

  /**
   * Base64 LQIP. Keeps the blur placeholder that `next/image` gave the
   * statically-imported images, which a URL-sourced image otherwise loses.
   */
  @Column({ type: "text", nullable: true })
  blurDataUrl: string | null;

  /** Required, not optional — an image with no alt text fails accessibility. */
  @Column({ type: "varchar", length: 320, default: "" })
  alt: string;

  @Column({ type: "varchar", length: 512, nullable: true })
  caption: string | null;

  @Column({ type: "enum", enum: MediaPurpose, default: MediaPurpose.GENERAL })
  purpose: MediaPurpose;

  @Column({ type: "enum", enum: StorageDriver, default: StorageDriver.LOCAL })
  driver: StorageDriver;

  @Column({ type: "char", length: 64 })
  checksum: string;

  @Column({ type: "char", length: 36, nullable: true })
  uploadedById: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "uploadedById" })
  uploadedBy: UserEntity | null;
}

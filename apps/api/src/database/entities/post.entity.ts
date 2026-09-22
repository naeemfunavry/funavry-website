import { PostKind } from "@funavry/types";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { ContentEntity } from "./base.entity";
import { MediaAssetEntity } from "./media-asset.entity";
import { SeoEmbedded } from "./seo.embedded";

/**
 * A blog post, news item or case note.
 *
 * `displayDate` is nullable and the site renders "Coming soon" when it is null,
 * which is how the current article slots ship — the titles describe delivered
 * work, but no piece exists behind them yet and no date is invented.
 */
@Entity("posts")
@Index("idx_post_kind_position", ["kind", "position"])
@Index("idx_post_featured", ["featured"])
export class PostEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 160 })
  slug: string;

  @Column({ type: "enum", enum: PostKind, default: PostKind.BLOG })
  kind: PostKind;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" })
  excerpt: string;

  /** Rendered body. Null while the row is still only a slot. */
  @Column({ type: "longtext", nullable: true })
  body: string | null;

  @Column({ type: "date", nullable: true })
  displayDate: Date | null;

  @Column({ type: "char", length: 36, nullable: true })
  imageId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "imageId" })
  image: MediaAssetEntity | null;

  /** Set when the piece lives elsewhere; otherwise the post renders in-site. */
  @Column({ type: "varchar", length: 512, nullable: true })
  externalUrl: string | null;

  /** The one post the landing deck blows up into its 2×2 lead tile. */
  @Column({ type: "boolean", default: false })
  featured: boolean;

  @Column({ type: "int", unsigned: true, nullable: true })
  readingMinutes: number | null;

  @Column(() => SeoEmbedded, { prefix: "seo" })
  seo: SeoEmbedded;
}

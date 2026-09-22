import { Column } from "typeorm";

/**
 * Per-page SEO overrides, embedded rather than joined.
 *
 * These are 1:1 with their owner and never queried on their own, so a separate
 * table would buy nothing and cost a join on every page render. TypeORM inlines
 * them as `seo_title`, `seo_description` and so on.
 */
export class SeoEmbedded {
  @Column({ type: "varchar", length: 180, nullable: true })
  title: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  description: string | null;

  @Column({ type: "char", length: 36, nullable: true })
  ogImageId: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  canonicalUrl: string | null;

  @Column({ type: "boolean", default: false })
  noIndex: boolean;
}

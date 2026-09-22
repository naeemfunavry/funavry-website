import { ContentStatus } from "@funavry/types";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";

/**
 * Identity and timestamps, inherited by every table.
 *
 * The primary key is a UUID rather than an auto-increment integer. Sequential
 * ids in a URL are an enumeration surface — `/case-studies/41` tells you there
 * are at least 41, and lets a scraper walk the lot — and they leak how much
 * content exists and how fast it is being added. Stored as CHAR(36): BINARY(16)
 * packs better, but it makes every hand-written query and every row you read in
 * a MySQL client unreadable, which is the wrong trade at this size.
 *
 * `deletedAt` makes every delete a soft delete. TypeORM's repositories then
 * exclude those rows automatically, so nothing has to remember to filter — and
 * an accidental delete stays recoverable, with the audit row still pointing at
 * a live record.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({ type: "datetime", precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime", precision: 6 })
  updatedAt: Date;

  @Index()
  @DeleteDateColumn({ type: "datetime", precision: 6, nullable: true })
  deletedAt: Date | null;

  /**
   * Incremented on every save. The admin sends it back on update and the
   * service compares — two editors on one case study get a conflict they can
   * see rather than a silent last-write-wins that eats the other's work.
   */
  @VersionColumn()
  version: number;
}

/**
 * Adds the editorial lifecycle. Everything the public site reads extends this,
 * and the public repositories filter on `status = PUBLISHED` so a draft cannot
 * reach funavry.com by being fetched directly.
 */
export abstract class ContentEntity extends BaseEntity {
  @Index()
  @Column({
    type: "enum",
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;

  /** Set the first time the row reaches PUBLISHED, never cleared afterwards. */
  @Column({ type: "datetime", precision: 6, nullable: true })
  publishedAt: Date | null;

  /**
   * Manual display order. Sparse on purpose — the reorder endpoint rewrites the
   * whole affected set in one transaction, so gaps are harmless and there is no
   * renumbering cascade on an insert in the middle.
   */
  @Index()
  @Column({ type: "int", default: 0 })
  position: number;

  /** Who last touched the row. Null for seeded content. */
  @Column({ type: "char", length: 36, nullable: true })
  updatedById: string | null;
}

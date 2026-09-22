import { Column, Entity, Index, JoinColumn, ManyToOne, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

import { ContentEntity } from "./base.entity";
import { MediaAssetEntity } from "./media-asset.entity";

/**
 * A client or partner mark.
 *
 * One table discriminated by `isPartner`, not two: the fields are identical and
 * several organisations are genuinely both, which two tables would force into
 * duplicate rows that then drift.
 *
 * `name` is what the artwork says, not what the file is called. Several of the
 * source filenames lie — `mental.webp` is Metal World, `amd.webp` is AMD
 * Telecom and not the chip company — so naming a mark from its filename would
 * put a false claim on the page.
 */
@Entity("clients")
@Index("idx_client_partner_position", ["isPartner", "position"])
export class ClientEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 140 })
  slug: string;

  @Column({ type: "varchar", length: 200 })
  name: string;

  @Column({ type: "char", length: 36, nullable: true })
  logoId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "logoId" })
  logo: MediaAssetEntity | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  websiteUrl: string | null;

  @Column({ type: "boolean", default: false })
  isPartner: boolean;
}

/** A technology in the stack strip. */
@Entity("technologies")
@Index("idx_tech_category_position", ["category", "position"])
export class TechnologyEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 140 })
  slug: string;

  @Column({ type: "varchar", length: 120 })
  name: string;

  /** The strip's row label, e.g. "AI/ML", "Cloud". */
  @Column({ type: "varchar", length: 80 })
  category: string;

  /** simple-icons slug, when the mark comes from that set. */
  @Column({ type: "varchar", length: 80, nullable: true })
  iconSlug: string | null;

  @Column({ type: "char", length: 36, nullable: true })
  logoId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "logoId" })
  logo: MediaAssetEntity | null;
}

/**
 * An approved company figure — "500+ projects delivered", "2018 founded".
 *
 * Centralised because the same numbers appear on the About page, the home
 * Proof section and the footer. Three hardcoded copies is how a site ends up
 * claiming two different headcounts on two different pages.
 */
@Entity("stats")
@Index("idx_stat_group_position", ["group", "position"])
export class StatEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 80 })
  key: string;

  @Column({ type: "varchar", length: 40 })
  value: string;

  @Column({ type: "varchar", length: 160 })
  label: string;

  /** Which surface renders it — "about", "proof", "footer". */
  @Column({ type: "varchar", length: 40, default: "about" })
  group: string;
}

@Entity("social_links")
export class SocialLinkEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 80 })
  label: string;

  @Column({ type: "varchar", length: 512 })
  url: string;

  /** lucide-react icon name. */
  @Column({ type: "varchar", length: 64 })
  icon: string;
}

/**
 * A site setting.
 *
 * Not a ContentEntity — settings have no draft state and are never soft
 * deleted; a key either exists or it does not. `valueType` tells the admin
 * which input to render and the reader how to parse the string.
 */
@Entity("settings")
@Index("idx_setting_group", ["group"])
export class SettingEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 120 })
  key: string;

  @Column({ type: "text" })
  value: string;

  @Column({
    type: "enum",
    enum: ["string", "number", "boolean", "json"],
    default: "string",
  })
  valueType: "string" | "number" | "boolean" | "json";

  @Column({ type: "varchar", length: 60, default: "general" })
  group: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description: string | null;

  @Column({ type: "char", length: 36, nullable: true })
  updatedById: string | null;

  @UpdateDateColumn({ type: "datetime", precision: 6 })
  updatedAt: Date;
}

import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity, ContentEntity } from "./base.entity";
import { MediaAssetEntity } from "./media-asset.entity";

/**
 * An office.
 *
 * Lives in its own table because three surfaces draw it — the footer, the
 * Contact page and the About footprint map — and the Capabilities globe turns
 * to face it. Two copies of a location is a bug waiting to happen: the one
 * nobody is looking at goes stale.
 */
@Entity("offices")
export class OfficeEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 140 })
  slug: string;

  @Column({ type: "varchar", length: 120 })
  country: string;

  /** Heads each footer block and labels the globe marker, so it stays unique. */
  @Index({ unique: true })
  @Column({ type: "varchar", length: 120 })
  city: string;

  @Column({ type: "varchar", length: 160 })
  role: string;

  /** The company profile's own caption, drawn by the About map cards. */
  @Column({ type: "varchar", length: 320 })
  blurb: string;

  @Column({ type: "char", length: 36, nullable: true })
  flagId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "flagId" })
  flag: MediaAssetEntity | null;

  /**
   * Where the office is, in degrees. The globe projects this to place a marker
   * and picks it as a camera target, so it must be the office's real city —
   * a country centroid for the USA would land in Kansas rather than on the
   * coast the office is actually on.
   *
   * DECIMAL rather than FLOAT: coordinates are exact values, and binary
   * floating point would round them in ways that move a marker.
   */
  @Column({ type: "decimal", precision: 9, scale: 6 })
  longitude: string;

  @Column({ type: "decimal", precision: 8, scale: 6 })
  latitude: string;

  @Column({ type: "boolean", default: false })
  isHeadquarters: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  phone: string | null;

  @OneToMany(() => OfficeAddressLineEntity, (l) => l.office, { cascade: true })
  addressLines: OfficeAddressLineEntity[];
}

/** One printed line of a postal address, kept ordered. */
@Entity("office_address_lines")
@Index("idx_office_line_order", ["officeId", "position"])
export class OfficeAddressLineEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  officeId: string;

  @ManyToOne(() => OfficeEntity, (o) => o.addressLines, { onDelete: "CASCADE" })
  @JoinColumn({ name: "officeId" })
  office: OfficeEntity;

  @Column({ type: "varchar", length: 255 })
  text: string;

  @Column({ type: "int", default: 0 })
  position: number;
}

/**
 * A country delivery reaches. Separate from Office on purpose — reach is not
 * presence, and conflating them would put an office pin where there is none.
 */
@Entity("delivery_countries")
export class DeliveryCountryEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 120 })
  name: string;

  /** ISO 3166-1 alpha-2, for the flag and the map. */
  @Index({ unique: true })
  @Column({ type: "char", length: 2 })
  code: string;
}

import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import { BaseEntity, ContentEntity } from "./base.entity";
import { MediaAssetEntity } from "./media-asset.entity";
import { OfficeEntity } from "./office.entity";

/**
 * Leadership — the founder, co-founders and the C-suite.
 *
 * `isFounder` and `isCoFounder` are flags beside the free-text `role` rather
 * than being parsed out of it. The role line is presentation ("Founder & CEO",
 * "Chief GBS Officer"), and a page that needs to pick the founders out of the
 * set should not be string-matching prose that an editor is free to reword.
 */
@Entity("leaders")
@Index("idx_leader_founder", ["isFounder"])
export class LeaderEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 140 })
  slug: string;

  @Column({ type: "varchar", length: 160 })
  name: string;

  /** The title as printed. */
  @Column({ type: "varchar", length: 160 })
  role: string;

  /** Monogram shown until a portrait is supplied, so the card holds its space. */
  @Column({ type: "varchar", length: 4 })
  initials: string;

  @Column({ type: "char", length: 36, nullable: true })
  photoId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "photoId" })
  photo: MediaAssetEntity | null;

  @Column({ type: "text", nullable: true })
  bio: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  linkedinUrl: string | null;

  @Column({ type: "boolean", default: false })
  isFounder: boolean;

  @Column({ type: "boolean", default: false })
  isCoFounder: boolean;

  @OneToMany(() => LeaderPointEntity, (p) => p.leader, { cascade: true })
  points: LeaderPointEntity[];
}

/** A bullet on a leadership card. A row, so one can be reordered on its own. */
@Entity("leader_points")
@Index("idx_leader_point_order", ["leaderId", "position"])
export class LeaderPointEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  leaderId: string;

  @ManyToOne(() => LeaderEntity, (l) => l.points, { onDelete: "CASCADE" })
  @JoinColumn({ name: "leaderId" })
  leader: LeaderEntity;

  @Column({ type: "varchar", length: 255 })
  text: string;

  @Column({ type: "int", default: 0 })
  position: number;
}

/** The wider team directory — everyone not on a leadership card. */
@Entity("team_members")
@Index("idx_team_department", ["department"])
export class TeamMemberEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 140 })
  slug: string;

  @Column({ type: "varchar", length: 160 })
  name: string;

  @Column({ type: "varchar", length: 160 })
  role: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  department: string | null;

  @Column({ type: "varchar", length: 4 })
  initials: string;

  @Column({ type: "char", length: 36, nullable: true })
  photoId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "photoId" })
  photo: MediaAssetEntity | null;

  @Column({ type: "text", nullable: true })
  bio: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  linkedinUrl: string | null;

  /** The office they sit in. Null for fully remote. */
  @Column({ type: "char", length: 36, nullable: true })
  officeId: string | null;

  @ManyToOne(() => OfficeEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "officeId" })
  office: OfficeEntity | null;
}

/**
 * A client testimonial.
 *
 * `pending` is the approval state, and it defaults to true for a reason: an
 * unapproved quote renders with the "Placeholder" badge the design already
 * carries, so demo copy sitting in the database can never be mistaken for an
 * endorsement the client actually gave.
 */
@Entity("testimonials")
export class TestimonialEntity extends ContentEntity {
  @Column({ type: "text" })
  quote: string;

  @Column({ type: "varchar", length: 160 })
  author: string;

  @Column({ type: "varchar", length: 160 })
  role: string;

  @Column({ type: "varchar", length: 160 })
  company: string;

  @Column({ type: "char", length: 36, nullable: true })
  avatarId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "avatarId" })
  avatar: MediaAssetEntity | null;

  /** True until the wording is written-approved by the client. */
  @Column({ type: "boolean", default: true })
  pending: boolean;
}

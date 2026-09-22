import {
  CaseStudyFrame,
  CaseStudySurface,
  DeliveryPhase,
} from "@funavry/types";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";

import { BaseEntity, ContentEntity } from "./base.entity";
import { IndustryEntity } from "./industry.entity";
import { MediaAssetEntity } from "./media-asset.entity";
import { SeoEmbedded } from "./seo.embedded";
import { ServiceEntity } from "./service.entity";

/** Ordered prose blocks on a detail page. */
export enum CaseStudyParagraphKind {
  INTRO = "INTRO",
  RESULT = "RESULT",
}

@Entity("case_studies")
@Index("idx_case_study_featured", ["featured", "position"])
@Index("idx_case_study_phase", ["phase"])
export class CaseStudyEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 140 })
  slug: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  /**
   * The one-line "what it is". The home deck, the index card and the detail
   * hero all print this string, which is exactly why it is one column — three
   * copies of it is how those surfaces drift apart.
   */
  @Column({ type: "varchar", length: 320 })
  tagline: string;

  /** Stands in for the client name, which is not ours to publish. */
  @Column({ type: "varchar", length: 120 })
  sector: string;

  @Column({ type: "enum", enum: DeliveryPhase })
  phase: DeliveryPhase;

  /** Who the captured product was built for — drives the window chrome. */
  @Column({ type: "enum", enum: CaseStudySurface, default: CaseStudySurface.APP })
  surface: CaseStudySurface;

  /** What the capture sits in on the home deck. Purely rhythm. */
  @Column({ type: "enum", enum: CaseStudyFrame, default: CaseStudyFrame.WINDOW })
  frame: CaseStudyFrame;

  @Column({ type: "text" })
  summary: string;

  /** The delivery footprint printed beside each engagement. */
  @Column({ type: "varchar", length: 160, nullable: true })
  client: string | null;

  @Column({ type: "varchar", length: 120, nullable: true })
  team: string | null;

  /** On the home deck. The rest live on /case-studies. */
  @Index()
  @Column({ type: "boolean", default: false })
  featured: boolean;

  /* ------------------------------------------------------ detail page ---- */

  @Column({ type: "varchar", length: 255, default: "" })
  introHeading: string;

  @Column({ type: "text", nullable: true })
  challengesLead: string | null;

  @Column({ type: "text", nullable: true })
  resultsLead: string | null;

  /* ----------------------------------------------------------- imagery --- */

  @Column({ type: "char", length: 36, nullable: true })
  imageId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "imageId" })
  image: MediaAssetEntity | null;

  /**
   * A real portrait capture, never a crop of the desktop one. Its presence is
   * what earns the phone frame on the deck — a device on the page is a claim
   * about what was built, so a study without this gets no phone.
   */
  @Column({ type: "char", length: 36, nullable: true })
  mobileImageId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "mobileImageId" })
  mobileImage: MediaAssetEntity | null;

  @Column(() => SeoEmbedded, { prefix: "seo" })
  seo: SeoEmbedded;

  /* ------------------------------------------------------------ children - */

  @OneToMany(() => CaseStudyCapabilityEntity, (c) => c.caseStudy, { cascade: true })
  capabilities: CaseStudyCapabilityEntity[];

  @OneToMany(() => CaseStudyCalloutEntity, (c) => c.caseStudy, { cascade: true })
  callouts: CaseStudyCalloutEntity[];

  @OneToMany(() => CaseStudyHighlightEntity, (h) => h.caseStudy, { cascade: true })
  highlights: CaseStudyHighlightEntity[];

  @OneToMany(() => CaseStudyStatEntity, (s) => s.caseStudy, { cascade: true })
  stats: CaseStudyStatEntity[];

  @OneToMany(() => CaseStudyMetaRowEntity, (m) => m.caseStudy, { cascade: true })
  metaRows: CaseStudyMetaRowEntity[];

  @OneToMany(() => CaseStudyParagraphEntity, (p) => p.caseStudy, { cascade: true })
  paragraphs: CaseStudyParagraphEntity[];

  @OneToMany(() => CaseStudyChallengeEntity, (c) => c.caseStudy, { cascade: true })
  challenges: CaseStudyChallengeEntity[];

  @OneToMany(() => CaseStudyScreenshotEntity, (s) => s.caseStudy, { cascade: true })
  screenshots: CaseStudyScreenshotEntity[];

  /* -------------------------------------------------------- associations - */

  @ManyToMany(() => IndustryEntity, (i) => i.caseStudies)
  @JoinTable({
    name: "case_study_industries",
    joinColumn: { name: "case_study_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "industry_id", referencedColumnName: "id" },
  })
  industries: IndustryEntity[];

  @ManyToMany(() => ServiceEntity, (s) => s.caseStudies)
  services: ServiceEntity[];
}

/**
 * A capability the study claims.
 *
 * A row rather than a JSON array, and this one is load-bearing: the deck's
 * leader-line callouts must name a capability verbatim, and making the callout
 * point at this row with a foreign key is what enforces that in the database.
 * With a JSON array the rule would be a convention, and a callout could claim
 * "AI-Powered Claims Processing" over a claims system that has no AI in it.
 */
@Entity("case_study_capabilities")
@Index("idx_cs_capability_order", ["caseStudyId", "position"])
@Index("idx_cs_capability_unique", ["caseStudyId", "label"], { unique: true })
export class CaseStudyCapabilityEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  caseStudyId: string;

  @ManyToOne(() => CaseStudyEntity, (c) => c.capabilities, { onDelete: "CASCADE" })
  @JoinColumn({ name: "caseStudyId" })
  caseStudy: CaseStudyEntity;

  @Column({ type: "varchar", length: 160 })
  label: string;

  @Column({ type: "int", default: 0 })
  position: number;
}

/**
 * A leader-line callout drawn over the capture on the home deck.
 *
 * `x` and `y` are fractions of the capture, so the line lands on the thing it
 * names wherever the image is scaled. Keep `x` under ~0.3: the chip hangs to
 * the left of its anchor and past that it stops clearing the window.
 */
@Entity("case_study_callouts")
@Index("idx_cs_callout_order", ["caseStudyId", "position"])
export class CaseStudyCalloutEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  caseStudyId: string;

  @ManyToOne(() => CaseStudyEntity, (c) => c.callouts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "caseStudyId" })
  caseStudy: CaseStudyEntity;

  /** RESTRICT, not CASCADE: deleting a capability a callout names should fail
      loudly rather than quietly removing the callout from the deck. */
  @Column({ type: "char", length: 36 })
  capabilityId: string;

  @ManyToOne(() => CaseStudyCapabilityEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "capabilityId" })
  capability: CaseStudyCapabilityEntity;

  /** lucide-react icon name. */
  @Column({ type: "varchar", length: 64 })
  icon: string;

  @Column({ type: "decimal", precision: 5, scale: 4 })
  x: string;

  @Column({ type: "decimal", precision: 5, scale: 4 })
  y: string;

  @Column({ type: "int", default: 0 })
  position: number;
}

/**
 * An approved fact from the corporate deck — the one place a metric is allowed
 * on the home deck. These are not numbers invented for the site.
 */
@Entity("case_study_highlights")
@Index("idx_cs_highlight_order", ["caseStudyId", "position"])
export class CaseStudyHighlightEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  caseStudyId: string;

  @ManyToOne(() => CaseStudyEntity, (c) => c.highlights, { onDelete: "CASCADE" })
  @JoinColumn({ name: "caseStudyId" })
  caseStudy: CaseStudyEntity;

  @Column({ type: "varchar", length: 80 })
  value: string;

  @Column({ type: "varchar", length: 160 })
  detail: string;

  @Column({ type: "int", default: 0 })
  position: number;
}

/** A chip in the detail hero's three-stat strip. */
@Entity("case_study_stats")
@Index("idx_cs_stat_order", ["caseStudyId", "position"])
export class CaseStudyStatEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  caseStudyId: string;

  @ManyToOne(() => CaseStudyEntity, (c) => c.stats, { onDelete: "CASCADE" })
  @JoinColumn({ name: "caseStudyId" })
  caseStudy: CaseStudyEntity;

  @Column({ type: "varchar", length: 80 })
  value: string;

  @Column({ type: "varchar", length: 160 })
  label: string;

  @Column({ type: "int", default: 0 })
  position: number;
}

/** A row of the detail page's Project Meta table. Confirmed rows only. */
@Entity("case_study_meta_rows")
@Index("idx_cs_meta_order", ["caseStudyId", "position"])
export class CaseStudyMetaRowEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  caseStudyId: string;

  @ManyToOne(() => CaseStudyEntity, (c) => c.metaRows, { onDelete: "CASCADE" })
  @JoinColumn({ name: "caseStudyId" })
  caseStudy: CaseStudyEntity;

  @Column({ type: "varchar", length: 80 })
  label: string;

  @Column({ type: "text" })
  value: string;

  @Column({ type: "int", default: 0 })
  position: number;
}

/**
 * An ordered paragraph of the lede or the results list.
 *
 * One table with a `kind` discriminator rather than two identical ones: intro
 * paragraphs and result lines have exactly the same shape and the same ordering
 * behaviour, and splitting them would duplicate the structure, the indexes and
 * the reorder logic for no gain in normal form.
 */
@Entity("case_study_paragraphs")
@Index("idx_cs_paragraph_order", ["caseStudyId", "kind", "position"])
export class CaseStudyParagraphEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  caseStudyId: string;

  @ManyToOne(() => CaseStudyEntity, (c) => c.paragraphs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "caseStudyId" })
  caseStudy: CaseStudyEntity;

  @Column({ type: "enum", enum: CaseStudyParagraphKind })
  kind: CaseStudyParagraphKind;

  @Column({ type: "text" })
  text: string;

  @Column({ type: "int", default: 0 })
  position: number;
}

/** A challenge/solution pair from the content brief. */
@Entity("case_study_challenges")
@Index("idx_cs_challenge_order", ["caseStudyId", "position"])
export class CaseStudyChallengeEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  caseStudyId: string;

  @ManyToOne(() => CaseStudyEntity, (c) => c.challenges, { onDelete: "CASCADE" })
  @JoinColumn({ name: "caseStudyId" })
  caseStudy: CaseStudyEntity;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" })
  challenge: string;

  @Column({ type: "text" })
  solution: string;

  @Column({ type: "int", default: 0 })
  position: number;
}

@Entity("case_study_screenshots")
@Index("idx_cs_shot_order", ["caseStudyId", "position"])
export class CaseStudyScreenshotEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  caseStudyId: string;

  @ManyToOne(() => CaseStudyEntity, (c) => c.screenshots, { onDelete: "CASCADE" })
  @JoinColumn({ name: "caseStudyId" })
  caseStudy: CaseStudyEntity;

  @Column({ type: "char", length: 36 })
  mediaId: string;

  @ManyToOne(() => MediaAssetEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "mediaId" })
  media: MediaAssetEntity;

  /**
   * How a fixed 16:10 tile shows the capture. `cover` fills it from the top,
   * right for wide dashboards; `contain` shows a tall capture whole, which a
   * 16:10 crop would otherwise reduce to a sliver.
   */
  @Column({ type: "enum", enum: ["cover", "contain"], default: "cover" })
  fit: "cover" | "contain";

  /** Puts this capture on the laptop screen, overriding the widest-desktop rule. */
  @Column({ type: "boolean", default: false })
  lead: boolean;

  @Column({ type: "int", default: 0 })
  position: number;
}

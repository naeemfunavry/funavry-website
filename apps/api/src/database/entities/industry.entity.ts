import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne } from "typeorm";

import { ContentEntity } from "./base.entity";
import { CaseStudyEntity } from "./case-study.entity";
import { MediaAssetEntity } from "./media-asset.entity";
import { SeoEmbedded } from "./seo.embedded";

/** One of the industries Funavry delivers into. */
@Entity("industries")
export class IndustryEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 140 })
  slug: string;

  @Column({ type: "varchar", length: 160 })
  name: string;

  /** Two lines on the card — anything longer is clipped, so it's written to fit. */
  @Column({ type: "varchar", length: 320 })
  description: string;

  /** Client names shown as proof, e.g. "Mayo Clinic · CitiMed". */
  @Column({ type: "varchar", length: 255, default: "" })
  proof: string;

  @Column({ type: "char", length: 36, nullable: true })
  imageId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "imageId" })
  image: MediaAssetEntity | null;

  @Column(() => SeoEmbedded, { prefix: "seo" })
  seo: SeoEmbedded;

  @ManyToMany(() => CaseStudyEntity, (c) => c.industries)
  caseStudies: CaseStudyEntity[];
}

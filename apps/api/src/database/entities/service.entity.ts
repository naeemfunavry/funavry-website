import { DeliveryPhase, ServiceGroup } from "@funavry/types";
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
import { CaseStudyEntity } from "./case-study.entity";
import { SeoEmbedded } from "./seo.embedded";

/**
 * A service line, from the Capability Statement: ten Technology & Engineering
 * practices and six Global Business Services.
 */
@Entity("services")
@Index("idx_service_group_position", ["group", "position"])
export class ServiceEntity extends ContentEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 140 })
  slug: string;

  /** The display number "01".."16" — presentation, not the sort key. */
  @Column({ type: "char", length: 2 })
  number: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "enum", enum: ServiceGroup })
  group: ServiceGroup;

  @Column({ type: "enum", enum: DeliveryPhase })
  phase: DeliveryPhase;

  /** lucide-react icon name, resolved by the section that renders it. */
  @Column({ type: "varchar", length: 64 })
  icon: string;

  @Column({ type: "text" })
  summary: string;

  @Column(() => SeoEmbedded, { prefix: "seo" })
  seo: SeoEmbedded;

  @OneToMany(() => ServiceSubEntity, (s) => s.service, { cascade: true })
  subs: ServiceSubEntity[];

  /**
   * Curated proof, strongest example first.
   *
   * Explicitly curated rather than derived: the content briefs describe
   * deliverables ("Custom CMS Development"), not practice names, so there is no
   * honest way to infer which practice a study belongs to. The ordering lives
   * on the join table.
   */
  @ManyToMany(() => CaseStudyEntity, (c) => c.services)
  @JoinTable({
    name: "service_case_studies",
    joinColumn: { name: "service_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "case_study_id", referencedColumnName: "id" },
  })
  caseStudies: CaseStudyEntity[];
}

@Entity("service_subs")
@Index("idx_service_sub_order", ["serviceId", "position"])
export class ServiceSubEntity extends BaseEntity {
  @Column({ type: "char", length: 36 })
  serviceId: string;

  @ManyToOne(() => ServiceEntity, (s) => s.subs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "serviceId" })
  service: ServiceEntity;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "int", default: 0 })
  position: number;
}

import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuditResource, ContentStatus, type Industry, type IndustryDetail } from "@funavry/types";
import { Repository } from "typeorm";

import { SimpleContentService } from "src/common/services/simple-content.service";
import { ResourceNotFoundException } from "src/common/exceptions/app.exception";
import { IndustryEntity } from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { toCaseStudySummary, toMediaRef } from "src/modules/case-studies/case-study.mapper";
import { CacheTag, RevalidationService } from "src/modules/revalidation/revalidation.service";
import { STORAGE_DRIVER, type StorageDriverPort } from "src/modules/media/storage/storage.interface";

@Injectable()
export class IndustriesService extends SimpleContentService<IndustryEntity, Industry> {
  constructor(
    @InjectRepository(IndustryEntity) repo: Repository<IndustryEntity>,
    @Inject(STORAGE_DRIVER) private readonly storage: StorageDriverPort,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(
      repo,
      audit,
      revalidation,
      {
        resourceName: "Industry",
        auditResource: AuditResource.INDUSTRY,
        cacheTags: [CacheTag.INDUSTRIES, CacheTag.CASE_STUDIES],
        sortable: ["position", "name", "createdAt", "updatedAt"],
        searchable: ["name", "description", "proof"],
        defaultSort: { field: "position", direction: "ASC" },
      },
      ["image"],
    );
  }

  protected override get alias(): string {
    return "industry";
  }

  protected toDto(e: IndustryEntity): Industry {
    return {
      id: e.id,
      slug: e.slug,
      name: e.name,
      description: e.description,
      proof: e.proof,
      image: toMediaRef(e.image, (k) => this.storage.urlFor(k)),
      position: e.position,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      publishedAt: e.publishedAt?.toISOString() ?? null,
      version: e.version,
      seo: {
        title: e.seo?.title ?? null,
        description: e.seo?.description ?? null,
        ogImage: null,
        canonicalUrl: e.seo?.canonicalUrl ?? null,
        noIndex: e.seo?.noIndex ?? false,
      },
    };
  }

  /**
   * An industry page with the work filed under it.
   *
   * The case studies are filtered to PUBLISHED separately from the industry
   * itself: a published industry can legitimately have a draft study attached,
   * and that draft must not surface just because its parent is live.
   */
  async getDetailBySlug(slug: string, publishedOnly: boolean): Promise<IndustryDetail> {
    /* Loaded per relation rather than as one joined SELECT — joining an
       industry to its case studies and each of those to three of their own
       collections multiplies out into tens of thousands of rows. See the note
       on CaseStudiesService.detailRelations. */
    const found = await this.repo.findOne({
      where: publishedOnly ? { slug, status: ContentStatus.PUBLISHED } : { slug },
      relations: {
        image: true,
        caseStudies: {
          image: true,
          mobileImage: true,
          capabilities: true,
          highlights: true,
        },
      },
      relationLoadStrategy: "query",
    });

    if (!found) throw new ResourceNotFoundException("Industry", slug);

    /* Drafts are filtered here rather than in the query. With a per-relation
       load the child condition cannot ride along on the parent's WHERE, and
       filtering in SQL would need a second bespoke query for what is a handful
       of rows. What matters is that it happens at all: a published industry can
       legitimately hold a draft study, and that draft must not surface. */
    const caseStudies = (found.caseStudies ?? [])
      .filter((cs) => !publishedOnly || cs.status === ContentStatus.PUBLISHED)
      .slice()
      .sort((a, b) => a.position - b.position);

    return {
      ...this.toDto(found),
      caseStudies: caseStudies.map((cs) =>
        toCaseStudySummary(cs, (k) => this.storage.urlFor(k)),
      ),
    };
  }

  protected override pathsFor(entity: IndustryEntity): string[] {
    return ["/industries", `/industries/${entity.slug}`];
  }
}

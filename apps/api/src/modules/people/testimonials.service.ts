import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuditResource, type Testimonial } from "@funavry/types";
import { Repository } from "typeorm";

import { SimpleContentService } from "src/common/services/simple-content.service";
import { TestimonialEntity } from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { toMediaRef } from "src/modules/case-studies/case-study.mapper";
import { CacheTag, RevalidationService } from "src/modules/revalidation/revalidation.service";
import { STORAGE_DRIVER, type StorageDriverPort } from "src/modules/media/storage/storage.interface";

@Injectable()
export class TestimonialsService extends SimpleContentService<TestimonialEntity, Testimonial> {
  constructor(
    @InjectRepository(TestimonialEntity) repo: Repository<TestimonialEntity>,
    @Inject(STORAGE_DRIVER) private readonly storage: StorageDriverPort,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(
      repo,
      audit,
      revalidation,
      {
        resourceName: "Testimonial",
        auditResource: AuditResource.TESTIMONIAL,
        cacheTags: [CacheTag.TESTIMONIALS],
        sortable: ["position", "author", "company", "createdAt"],
        searchable: ["author", "company", "quote"],
        defaultSort: { field: "position", direction: "ASC" },
      },
      ["avatar"],
    );
  }

  protected override get alias(): string {
    return "testimonial";
  }

  protected toDto(e: TestimonialEntity): Testimonial {
    return {
      id: e.id,
      quote: e.quote,
      author: e.author,
      role: e.role,
      company: e.company,
      avatar: toMediaRef(e.avatar, (k) => this.storage.urlFor(k)),
      pending: e.pending,
      position: e.position,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      publishedAt: e.publishedAt?.toISOString() ?? null,
      version: e.version,
    };
  }

  protected override pathsFor(): string[] {
    return ["/"];
  }
}

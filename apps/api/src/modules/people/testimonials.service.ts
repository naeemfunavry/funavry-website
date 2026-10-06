import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuditResource, type Testimonial } from "@funavry/types";
import { Repository } from "typeorm";

import { SimpleContentService } from "../../common/services/simple-content.service";
import { TestimonialEntity } from "../../database/entities";
import { AuditService } from "../audit/audit.service";
import { toMediaRef } from "../case-studies/case-study.mapper";
import { CacheTag, RevalidationService } from "../revalidation/revalidation.service";
import { STORAGE_DRIVER, type StorageDriverPort } from "../media/storage/storage.interface";

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

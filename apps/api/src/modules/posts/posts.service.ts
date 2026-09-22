import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuditResource, type Post } from "@funavry/types";
import { Repository } from "typeorm";

import { SimpleContentService } from "src/common/services/simple-content.service";
import { PostEntity } from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { toMediaRef } from "src/modules/case-studies/case-study.mapper";
import { CacheTag, RevalidationService } from "src/modules/revalidation/revalidation.service";
import { STORAGE_DRIVER, type StorageDriverPort } from "src/modules/media/storage/storage.interface";

@Injectable()
export class PostsService extends SimpleContentService<PostEntity, Post> {
  constructor(
    @InjectRepository(PostEntity) repo: Repository<PostEntity>,
    @Inject(STORAGE_DRIVER) private readonly storage: StorageDriverPort,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(
      repo,
      audit,
      revalidation,
      {
        resourceName: "Post",
        auditResource: AuditResource.POST,
        cacheTags: [CacheTag.POSTS],
        sortable: ["position", "title", "displayDate", "createdAt", "updatedAt", "publishedAt"],
        searchable: ["title", "excerpt"],
        defaultSort: { field: "position", direction: "ASC" },
      },
      ["image"],
    );
  }

  protected override get alias(): string {
    return "post";
  }

  protected toDto(e: PostEntity): Post {
    return {
      id: e.id,
      slug: e.slug,
      kind: e.kind,
      title: e.title,
      excerpt: e.excerpt,
      body: e.body,
      /* Serialised as a plain date string, not an ISO timestamp: the site
         prints it as a date and a timezone conversion could shift it a day. */
      date: e.displayDate ? new Date(e.displayDate).toISOString().slice(0, 10) : null,
      image: toMediaRef(e.image, (k) => this.storage.urlFor(k)),
      externalUrl: e.externalUrl,
      featured: e.featured,
      position: e.position,
      readingMinutes: e.readingMinutes,
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

  protected override pathsFor(entity: PostEntity): string[] {
    return ["/", "/blog", `/blog/${entity.slug}`];
  }
}

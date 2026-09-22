import { AuditResource, ContentStatus, type Paginated } from "@funavry/types";
import { DeepPartial, Repository, SelectQueryBuilder } from "typeorm";

import type { ContentEntity } from "src/database/entities";
import type { AuditService } from "src/modules/audit/audit.service";
import type {
  CacheTagValue,
  RevalidationService,
} from "src/modules/revalidation/revalidation.service";

import type { PaginationQueryDto } from "../dto/pagination.dto";
import { BaseContentService, type BaseContentServiceOptions } from "./base-content.service";

/**
 * A content service for resources with no child graph.
 *
 * The case studies need a bespoke service because their children have ordering
 * and referential rules; industries, posts, clients and the rest are flat rows
 * with a media reference, and repeating the same fifty lines fourteen times
 * would guarantee that one of them quietly forgets to revalidate or to filter
 * drafts. Subclasses supply configuration and a mapper, and get the behaviour.
 */
export abstract class SimpleContentService<
  T extends ContentEntity,
  TDto,
> extends BaseContentService<T> {
  protected constructor(
    repo: Repository<T>,
    audit: AuditService,
    revalidation: RevalidationService,
    options: BaseContentServiceOptions,
    /** Which relations to join on every read, e.g. `["image"]`. */
    protected readonly eagerRelations: string[] = [],
  ) {
    super(repo, audit, revalidation, options);
  }

  /** Entity → wire DTO. Implemented per resource so nothing leaks by default. */
  protected abstract toDto(entity: T): TDto;

  protected override applyRelations(qb: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
    for (const relation of this.eagerRelations) {
      qb.leftJoinAndSelect(`${this.alias}.${relation}`, relation);
    }
    return qb;
  }

  async listDto(query: PaginationQueryDto): Promise<Paginated<TDto>> {
    const result = await this.findAll(query);
    return { items: result.items.map((i) => this.toDto(i)), pageInfo: result.pageInfo };
  }

  /** The public read. Published rows only — the filter lives here, not in the caller. */
  async listPublicDto(limit?: number): Promise<TDto[]> {
    const rows = await this.findPublished(limit ? { limit } : undefined);
    return rows.map((r) => this.toDto(r));
  }

  async getDto(id: string): Promise<TDto> {
    return this.toDto(await this.findOne(id));
  }

  async getBySlugDto(slug: string, publishedOnly = false): Promise<TDto> {
    return this.toDto(await this.findBySlug(slug, publishedOnly));
  }

  async createDto(dto: DeepPartial<T>, actorId: string): Promise<TDto> {
    return this.toDto(await this.create(dto, actorId));
  }

  async updateDto(
    id: string,
    dto: DeepPartial<T>,
    actorId: string,
    expectedVersion?: number,
  ): Promise<TDto> {
    return this.toDto(await this.update(id, dto, actorId, expectedVersion));
  }

  async setStatusDto(id: string, status: ContentStatus, actorId: string): Promise<TDto> {
    return this.toDto(await this.setStatus(id, status, actorId));
  }

  async restoreDto(id: string): Promise<TDto> {
    return this.toDto(await this.restore(id));
  }
}

/** Convenience re-export so modules import one symbol. */
export { AuditResource, ContentStatus };
export type { BaseContentServiceOptions, CacheTagValue };

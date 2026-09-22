import {
  AuditAction,
  type AuditResource,
  ContentStatus,
  type Paginated,
} from "@funavry/types";
import {
  DeepPartial,
  FindOptionsRelations,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from "typeorm";

import type { ContentEntity } from "src/database/entities";
import type { AuditService } from "src/modules/audit/audit.service";
import type {
  CacheTagValue,
  RevalidationService,
} from "src/modules/revalidation/revalidation.service";

import type { PaginationQueryDto } from "../dto/pagination.dto";
import type { ReorderDto } from "../dto/reorder.dto";
import { ResourceNotFoundException, ConflictException } from "../exceptions/app.exception";
import { buildDiff } from "../utils/redact";
import { getRequestContext } from "../utils/request-context";

export interface BaseContentServiceOptions {
  /** Human name used in error messages: "Case study 'qfs' was not found." */
  resourceName: string;
  auditResource: AuditResource;
  /** Tags invalidated on the public site after a write. */
  cacheTags: CacheTagValue[];
  /**
   * Columns `sortBy` may name.
   *
   * An allow-list, not a sanitiser. TypeORM interpolates the ORDER BY column
   * into the SQL rather than binding it as a parameter, so an unchecked value
   * from the query string is a direct injection point — this is the control
   * that closes it.
   */
  sortable: string[];
  /** Columns the free-text `q` searches, bound as parameters. */
  searchable: string[];
  defaultSort?: { field: string; direction: "ASC" | "DESC" };
  relations?: FindOptionsRelations<ObjectLiteral>;
}

/**
 * Shared CRUD behaviour for every content resource.
 *
 * The reason this exists rather than each module repeating it: the parts that
 * are easy to get subtly wrong — the sort allow-list, filtering drafts out of
 * public reads, writing the audit row *and* the revalidation on every mutation
 * — are exactly the parts that would be quietly omitted from whichever module
 * was written last. Centralising them means a new content type inherits the
 * correct behaviour instead of re-earning it.
 */
export abstract class BaseContentService<T extends ContentEntity> {
  protected constructor(
    protected readonly repo: Repository<T>,
    protected readonly audit: AuditService,
    protected readonly revalidation: RevalidationService,
    protected readonly options: BaseContentServiceOptions,
  ) {}

  protected get alias(): string {
    return "entity";
  }

  /** Hook for subclasses to join their children onto every query. */
  protected applyRelations(qb: SelectQueryBuilder<T>): SelectQueryBuilder<T> {
    return qb;
  }

  /* ------------------------------------------------------------- reading - */

  /**
   * Admin listing. Sees drafts, and can see soft-deleted rows on request.
   */
  async findAll(query: PaginationQueryDto): Promise<Paginated<T>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    let qb = this.repo.createQueryBuilder(this.alias);
    qb = this.applyRelations(qb);

    if (query.includeDeleted) qb.withDeleted();

    if (query.status) {
      qb.andWhere(`${this.alias}.status = :status`, { status: query.status });
    }

    if (query.q && this.options.searchable.length > 0) {
      const clauses = this.options.searchable
        .map((col, i) => `${this.alias}.${col} LIKE :q${i}`)
        .join(" OR ");

      /* Bound, and the wildcards are ours — a `%` typed by the user is escaped
         below so it cannot widen the match into a full scan. */
      const term = `%${this.escapeLike(query.q)}%`;
      const params = Object.fromEntries(
        this.options.searchable.map((_, i) => [`q${i}`, term]),
      );

      qb.andWhere(`(${clauses})`, params);
    }

    this.applySort(qb, query.sortBy, query.sortDir);

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return this.paginate(items, total, page, limit);
  }

  /** Public listing. Published rows only, in display order. */
  async findPublished(query?: { limit?: number }): Promise<T[]> {
    let qb = this.repo.createQueryBuilder(this.alias);
    qb = this.applyRelations(qb);

    qb.where(`${this.alias}.status = :status`, { status: ContentStatus.PUBLISHED })
      .orderBy(`${this.alias}.position`, "ASC")
      .addOrderBy(`${this.alias}.createdAt`, "DESC");

    if (query?.limit) qb.take(query.limit);

    return qb.getMany();
  }

  async findOne(id: string): Promise<T> {
    let qb = this.repo.createQueryBuilder(this.alias);
    qb = this.applyRelations(qb);

    const found = await qb.where(`${this.alias}.id = :id`, { id }).getOne();

    if (!found) throw new ResourceNotFoundException(this.options.resourceName, id);

    return found;
  }

  /** Resolves a slug. `publishedOnly` is what stops a draft leaking by URL. */
  async findBySlug(slug: string, publishedOnly = false): Promise<T> {
    let qb = this.repo.createQueryBuilder(this.alias);
    qb = this.applyRelations(qb);

    qb.where(`${this.alias}.slug = :slug`, { slug });

    if (publishedOnly) {
      qb.andWhere(`${this.alias}.status = :status`, { status: ContentStatus.PUBLISHED });
    }

    const found = await qb.getOne();

    if (!found) throw new ResourceNotFoundException(this.options.resourceName, slug);

    return found;
  }

  /* ------------------------------------------------------------- writing - */

  async create(dto: DeepPartial<T>, actorId?: string): Promise<T> {
    await this.assertSlugFree((dto as { slug?: string }).slug);

    const entity = this.repo.create({
      ...dto,
      updatedById: actorId ?? null,
    } as DeepPartial<T>);

    const saved = await this.repo.save(entity);

    await this.afterWrite(AuditAction.CREATE, saved, null);

    return this.findOne(saved.id);
  }

  /**
   * Updates a row.
   *
   * `expectedVersion` implements optimistic concurrency: the admin sends back
   * the version it loaded, and a mismatch means someone else saved in between.
   * Refusing is the only honest option — silently overwriting would discard the
   * other editor's work with no trace that it ever existed.
   */
  async update(
    id: string,
    dto: DeepPartial<T>,
    actorId?: string,
    expectedVersion?: number,
  ): Promise<T> {
    const existing = await this.findOne(id);

    if (expectedVersion !== undefined && existing.version !== expectedVersion) {
      throw new ConflictException(
        `This ${this.options.resourceName.toLowerCase()} was changed by someone else. Reload and try again.`,
      );
    }

    const nextSlug = (dto as { slug?: string }).slug;
    if (nextSlug && nextSlug !== (existing as unknown as { slug?: string }).slug) {
      await this.assertSlugFree(nextSlug, id);
    }

    const before = { ...existing } as Record<string, unknown>;

    Object.assign(existing, dto, { updatedById: actorId ?? null });

    /* Reaching PUBLISHED for the first time stamps publishedAt; it is never
       cleared afterwards, so unpublishing and republishing does not rewrite
       when the piece originally went live. */
    if (
      (dto as { status?: ContentStatus }).status === ContentStatus.PUBLISHED &&
      !existing.publishedAt
    ) {
      existing.publishedAt = new Date();
    }

    const saved = await this.repo.save(existing);

    await this.afterWrite(AuditAction.UPDATE, saved, before);

    return this.findOne(saved.id);
  }

  /** Soft delete — the row stays, `deletedAt` is stamped, and it can be restored. */
  async remove(id: string): Promise<{ id: string; deleted: true }> {
    const existing = await this.findOne(id);

    await this.repo.softRemove(existing);

    await this.afterWrite(AuditAction.DELETE, existing, null);

    return { id, deleted: true };
  }

  async restore(id: string): Promise<T> {
    const result = await this.repo.restore(id);

    if (!result.affected) {
      throw new ResourceNotFoundException(this.options.resourceName, id);
    }

    const restored = await this.findOne(id);

    await this.afterWrite(AuditAction.RESTORE, restored, null);

    return restored;
  }

  async setStatus(id: string, status: ContentStatus, actorId?: string): Promise<T> {
    const existing = await this.findOne(id);

    /* A full snapshot, not `{ status }`. buildDiff compares the union of both
       objects' keys, so a partial `before` makes every field the entity has
       look like it changed from nothing — burying the one field that actually
       did under thirty lines of noise. */
    const before = { ...existing } as Record<string, unknown>;

    existing.status = status;
    existing.updatedById = actorId ?? null;

    if (status === ContentStatus.PUBLISHED && !existing.publishedAt) {
      existing.publishedAt = new Date();
    }

    const saved = await this.repo.save(existing);

    await this.afterWrite(
      status === ContentStatus.PUBLISHED ? AuditAction.PUBLISH : AuditAction.UNPUBLISH,
      saved,
      before,
    );

    return saved;
  }

  /**
   * Rewrites display order in one transaction.
   *
   * All-or-nothing on purpose: a reorder applied halfway leaves the list in an
   * order nobody chose, which is worse than the reorder simply failing.
   */
  async reorder(dto: ReorderDto): Promise<{ updated: number }> {
    await this.repo.manager.transaction(async (manager) => {
      for (const item of dto.items) {
        await manager.update(this.repo.target, item.id, {
          position: item.position,
        } as never);
      }
    });

    await this.audit.record({
      action: AuditAction.REORDER,
      resource: this.options.auditResource,
      resourceLabel: `${dto.items.length} items`,
      success: true,
    });

    await this.revalidation.revalidate(this.options.cacheTags);

    return { updated: dto.items.length };
  }

  /* ------------------------------------------------------------- helpers - */

  /**
   * One place where the audit row and the site revalidation both happen, so a
   * write cannot be committed and then silently fail to do either.
   */
  protected async afterWrite(
    action: AuditAction,
    entity: T,
    before: Record<string, unknown> | null,
  ): Promise<void> {
    const ctx = getRequestContext();

    await this.audit.record({
      action,
      resource: this.options.auditResource,
      resourceId: entity.id,
      resourceLabel: this.labelOf(entity),
      changes: before ? buildDiff(before, entity as unknown as Record<string, unknown>) : null,
      actorId: ctx?.userId ?? null,
      actorUsername: ctx?.username ?? null,
      success: true,
    });

    await this.revalidation.revalidate(this.options.cacheTags, this.pathsFor(entity));
  }

  /** Extra paths to purge — override where a slug maps to its own URL. */
  protected pathsFor(_entity: T): string[] {
    return [];
  }

  protected labelOf(entity: T): string | null {
    const record = entity as unknown as Record<string, unknown>;
    for (const key of ["title", "name", "label", "city", "slug", "key"]) {
      if (typeof record[key] === "string") return record[key] as string;
    }
    return null;
  }

  protected async assertSlugFree(slug?: string, exceptId?: string): Promise<void> {
    if (!slug) return;

    const qb = this.repo
      .createQueryBuilder(this.alias)
      .withDeleted()
      .where(`${this.alias}.slug = :slug`, { slug });

    if (exceptId) qb.andWhere(`${this.alias}.id != :exceptId`, { exceptId });

    const existing = await qb.getCount();

    if (existing > 0) {
      const { SlugTakenException } = await import("../exceptions/app.exception");
      throw new SlugTakenException(slug);
    }
  }

  private applySort(
    qb: SelectQueryBuilder<T>,
    sortBy: string | undefined,
    sortDir: "ASC" | "DESC" | undefined,
  ): void {
    const fallback = this.options.defaultSort ?? { field: "position", direction: "ASC" };

    /* An unrecognised column falls back rather than erroring: a stale bookmark
       with an old sort parameter should still load the page. */
    const field =
      sortBy && this.options.sortable.includes(sortBy) ? sortBy : fallback.field;

    const direction = sortDir === "ASC" || sortDir === "DESC" ? sortDir : fallback.direction;

    qb.orderBy(`${this.alias}.${field}`, direction);

    if (field !== "createdAt") qb.addOrderBy(`${this.alias}.createdAt`, "DESC");
  }

  /**
   * Escapes the LIKE metacharacters. A user typing `%` should match a literal
   * percent sign, not turn their search into a table scan.
   */
  protected escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, (c) => `\\${c}`);
  }

  protected paginate<R>(items: R[], total: number, page: number, limit: number): Paginated<R> {
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      pageInfo: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

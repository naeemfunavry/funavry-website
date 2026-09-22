import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  AuditAction,
  AuditResource,
  type CaseStudyDetail,
  type CaseStudySummary,
  ContentStatus,
  type Paginated,
} from "@funavry/types";
import { DataSource, EntityManager, In, Repository, SelectQueryBuilder } from "typeorm";

import { BaseContentService } from "src/common/services/base-content.service";
import {
  ConflictException,
  ResourceNotFoundException,
  ValidationException,
} from "src/common/exceptions/app.exception";
import {
  CaseStudyCalloutEntity,
  CaseStudyCapabilityEntity,
  CaseStudyChallengeEntity,
  CaseStudyEntity,
  CaseStudyHighlightEntity,
  CaseStudyMetaRowEntity,
  CaseStudyParagraphEntity,
  CaseStudyParagraphKind,
  CaseStudyScreenshotEntity,
  CaseStudyStatEntity,
  IndustryEntity,
} from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { CacheTag, RevalidationService } from "src/modules/revalidation/revalidation.service";
import { STORAGE_DRIVER, type StorageDriverPort } from "src/modules/media/storage/storage.interface";

import {
  CaseStudyQueryDto,
  CreateCaseStudyDto,
  UpdateCaseStudyDto,
} from "./dto/case-study.dto";
import { toCaseStudyDetail, toCaseStudySummary } from "./case-study.mapper";

@Injectable()
export class CaseStudiesService extends BaseContentService<CaseStudyEntity> {
  constructor(
    @InjectRepository(CaseStudyEntity)
    repo: Repository<CaseStudyEntity>,
    @InjectRepository(IndustryEntity)
    private readonly industries: Repository<IndustryEntity>,
    private readonly dataSource: DataSource,
    @Inject(STORAGE_DRIVER)
    private readonly storage: StorageDriverPort,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(repo, audit, revalidation, {
      resourceName: "Case study",
      auditResource: AuditResource.CASE_STUDY,
      /* A case study appears on the home deck, the index, its own page, and on
         every industry and service page that lists it — so an edit invalidates
         all four rather than trying to work out which ones changed. */
      cacheTags: [
        CacheTag.CASE_STUDIES,
        CacheTag.INDUSTRIES,
        CacheTag.SERVICES,
      ],
      sortable: ["position", "title", "createdAt", "updatedAt", "publishedAt", "sector"],
      searchable: ["title", "tagline", "sector", "summary"],
      defaultSort: { field: "position", direction: "ASC" },
    });
  }

  protected override get alias(): string {
    return "cs";
  }

  private urlFor = (key: string): string => this.storage.urlFor(key);

  /**
   * Everything a card needs, nothing a detail page does.
   *
   * Set through find options rather than as explicit joins so the same
   * per-relation load strategy applies here: three collections joined together
   * is only 45 rows per study rather than a million, but multiplied by a page
   * of twenty it is still work for no benefit.
   */
  private cardRelations() {
    return {
      image: true,
      mobileImage: true,
      capabilities: true,
      callouts: { capability: true },
      highlights: true,
    } as const;
  }

  protected override applyRelations(
    qb: SelectQueryBuilder<CaseStudyEntity>,
  ): SelectQueryBuilder<CaseStudyEntity> {
    return qb.setFindOptions({
      relations: this.cardRelations(),
      relationLoadStrategy: "query",
    });
  }

  /**
   * The full graph for a detail page, loaded one relation at a time.
   *
   * Joining all ten collections into a single SELECT is the obvious way to
   * write this and it is catastrophically wrong: SQL returns their cartesian
   * product, so a study with 5 capabilities, 3 callouts, 3 highlights, 3 stats,
   * 4 meta rows, 7 paragraphs, 5 challenges, 5 screenshots and 2 industries
   * produces on the order of a million rows for the ORM to deduplicate in
   * memory. Measured at ~14s for one case study before this change, ~40ms
   * after.
   *
   * `relationLoadStrategy: "query"` makes TypeORM issue a separate, indexed
   * query per collection instead — more round trips, none of them quadratic.
   */
  private detailRelations() {
    return {
      image: true,
      mobileImage: true,
      capabilities: true,
      callouts: { capability: true },
      highlights: true,
      stats: true,
      metaRows: true,
      paragraphs: true,
      challenges: true,
      screenshots: { media: true },
      industries: true,
      services: true,
    } as const;
  }

  /* ------------------------------------------------------------ reading -- */

  async list(query: CaseStudyQueryDto): Promise<Paginated<CaseStudySummary>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.applyRelations(this.repo.createQueryBuilder("cs"));

    if (query.includeDeleted) qb.withDeleted();
    if (query.status) qb.andWhere("cs.status = :status", { status: query.status });
    if (query.phase) qb.andWhere("cs.phase = :phase", { phase: query.phase });
    if (query.featured !== undefined) {
      qb.andWhere("cs.featured = :featured", { featured: query.featured });
    }

    if (query.industrySlug) {
      qb.innerJoin("cs.industries", "filterIndustry", "filterIndustry.slug = :industrySlug", {
        industrySlug: query.industrySlug,
      });
    }

    if (query.q) {
      const term = `%${this.escapeLike(query.q)}%`;
      qb.andWhere(
        "(cs.title LIKE :term OR cs.tagline LIKE :term OR cs.sector LIKE :term OR cs.summary LIKE :term)",
        { term },
      );
    }

    const sortBy = this.options.sortable.includes(query.sortBy ?? "")
      ? (query.sortBy as string)
      : "position";

    /* Paginating a query with joined collections needs the distinct-id pass —
       `take` on a joined row set would otherwise cut a case study's children
       in half and return the wrong number of studies. */
    const [items, total] = await qb
      .orderBy(`cs.${sortBy}`, query.sortDir ?? "ASC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return this.paginate(
      items.map((i) => toCaseStudySummary(i, this.urlFor)),
      total,
      page,
      limit,
    );
  }

  /** The public deck and index. Published only, in display order. */
  async listPublic(opts?: { featured?: boolean; limit?: number }): Promise<CaseStudySummary[]> {
    const qb = this.applyRelations(this.repo.createQueryBuilder("cs")).where(
      "cs.status = :status",
      { status: ContentStatus.PUBLISHED },
    );

    if (opts?.featured !== undefined) {
      qb.andWhere("cs.featured = :featured", { featured: opts.featured });
    }

    qb.orderBy("cs.position", "ASC").addOrderBy("cs.createdAt", "DESC");

    if (opts?.limit) qb.take(opts.limit);

    const rows = await qb.getMany();

    return rows.map((r) => toCaseStudySummary(r, this.urlFor));
  }

  /**
   * Every published brief, in one response.
   *
   * The site's build needs all of them — for the work index, the sitemap and
   * the prev/next links — and fetching them one slug at a time turned a build
   * into several hundred requests. That is slow, and worse, it is fragile: any
   * single failure among them becomes a page that renders wrong.
   */
  async listPublicDetails(): Promise<CaseStudyDetail[]> {
    const rows = await this.repo.find({
      where: { status: ContentStatus.PUBLISHED },
      relations: this.detailRelations(),
      relationLoadStrategy: "query",
      order: { position: "ASC", createdAt: "DESC" },
    });

    return rows.map((r) => toCaseStudyDetail(r, this.urlFor));
  }

  async getDetail(slug: string, publishedOnly: boolean): Promise<CaseStudyDetail> {
    const found = await this.repo.findOne({
      where: publishedOnly ? { slug, status: ContentStatus.PUBLISHED } : { slug },
      relations: this.detailRelations(),
      relationLoadStrategy: "query",
    });

    if (!found) throw new ResourceNotFoundException("Case study", slug);

    return toCaseStudyDetail(found, this.urlFor);
  }

  async getById(id: string): Promise<CaseStudyDetail> {
    const found = await this.repo.findOne({
      where: { id },
      relations: this.detailRelations(),
      relationLoadStrategy: "query",
    });

    if (!found) throw new ResourceNotFoundException("Case study", id);

    return toCaseStudyDetail(found, this.urlFor);
  }

  /* ------------------------------------------------------------ writing -- */

  /**
   * Creates a case study and its whole child graph in one transaction.
   *
   * Transactional because the children are not decoration: a study saved with
   * its capabilities but without the callouts that reference them is a broken
   * record, and the editor would have no way to tell from the response that
   * half of it landed.
   */
  async createFull(dto: CreateCaseStudyDto, actorId: string): Promise<CaseStudyDetail> {
    await this.assertSlugFree(dto.slug);

    const id = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(CaseStudyEntity);

      const entity = repo.create({
        slug: dto.slug,
        title: dto.title,
        tagline: dto.tagline,
        sector: dto.sector,
        phase: dto.phase,
        surface: dto.surface,
        frame: dto.frame,
        summary: dto.summary,
        client: dto.client ?? null,
        team: dto.team ?? null,
        featured: dto.featured ?? false,
        status: dto.status ?? ContentStatus.DRAFT,
        position: dto.position ?? 0,
        introHeading: dto.introHeading ?? "",
        challengesLead: dto.challengesLead ?? null,
        resultsLead: dto.resultsLead ?? null,
        imageId: dto.imageId ?? null,
        mobileImageId: dto.mobileImageId ?? null,
        updatedById: actorId,
        publishedAt: dto.status === ContentStatus.PUBLISHED ? new Date() : null,
        seo: {
          title: dto.seo?.title ?? null,
          description: dto.seo?.description ?? null,
          ogImageId: dto.seo?.ogImageId ?? null,
          canonicalUrl: dto.seo?.canonicalUrl ?? null,
          noIndex: dto.seo?.noIndex ?? false,
        },
      });

      const saved = await repo.save(entity);

      await this.writeChildren(manager, saved.id, dto, true);

      if (dto.industryIds?.length) {
        await this.linkIndustries(manager, saved.id, dto.industryIds);
      }

      return saved.id;
    });

    const created = await this.getById(id);

    await this.afterWrite(
      AuditAction.CREATE,
      await this.repo.findOneOrFail({ where: { id } }),
      null,
    );

    return created;
  }

  async updateFull(
    id: string,
    dto: UpdateCaseStudyDto,
    actorId: string,
  ): Promise<CaseStudyDetail> {
    const existing = await this.repo.findOne({ where: { id } });

    if (!existing) throw new ResourceNotFoundException("Case study", id);

    if (dto.expectedVersion !== undefined && existing.version !== dto.expectedVersion) {
      throw new ConflictException(
        "This case study was changed by someone else. Reload and try again.",
      );
    }

    if (dto.slug && dto.slug !== existing.slug) await this.assertSlugFree(dto.slug, id);

    const before = { ...existing } as Record<string, unknown>;
    const previousSlug = existing.slug;

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(CaseStudyEntity);

      const scalars: Partial<CaseStudyEntity> = {};

      /* Only fields actually present in the PATCH are applied — an absent key
         means "leave it", which is different from an explicit null. */
      const assign = <K extends keyof CaseStudyEntity>(
        key: K,
        value: CaseStudyEntity[K] | undefined,
      ): void => {
        if (value !== undefined) scalars[key] = value;
      };

      assign("slug", dto.slug);
      assign("title", dto.title);
      assign("tagline", dto.tagline);
      assign("sector", dto.sector);
      assign("phase", dto.phase);
      assign("surface", dto.surface);
      assign("frame", dto.frame);
      assign("summary", dto.summary);
      assign("client", dto.client ?? undefined);
      assign("team", dto.team ?? undefined);
      assign("featured", dto.featured);
      assign("status", dto.status);
      assign("position", dto.position);
      assign("introHeading", dto.introHeading);
      assign("challengesLead", dto.challengesLead ?? undefined);
      assign("resultsLead", dto.resultsLead ?? undefined);
      assign("imageId", dto.imageId ?? undefined);
      assign("mobileImageId", dto.mobileImageId ?? undefined);

      scalars.updatedById = actorId;

      if (dto.status === ContentStatus.PUBLISHED && !existing.publishedAt) {
        scalars.publishedAt = new Date();
      }

      if (dto.seo) {
        scalars.seo = {
          title: dto.seo.title ?? existing.seo?.title ?? null,
          description: dto.seo.description ?? existing.seo?.description ?? null,
          ogImageId: dto.seo.ogImageId ?? existing.seo?.ogImageId ?? null,
          canonicalUrl: dto.seo.canonicalUrl ?? existing.seo?.canonicalUrl ?? null,
          noIndex: dto.seo.noIndex ?? existing.seo?.noIndex ?? false,
        };
      }

      await repo.update(id, scalars);

      await this.writeChildren(manager, id, dto, false);

      if (dto.industryIds) await this.linkIndustries(manager, id, dto.industryIds);
    });

    const updated = await this.getById(id);
    const entity = await this.repo.findOneOrFail({ where: { id } });

    await this.afterWrite(AuditAction.UPDATE, entity, before);

    /* A slug change has to purge the old URL too — no tag on the new row knows
       the address the page used to live at. */
    if (dto.slug && dto.slug !== previousSlug) {
      await this.revalidation.revalidate(this.options.cacheTags, [
        `/case-studies/${previousSlug}`,
      ]);
    }

    return updated;
  }

  /**
   * Replaces a study's child collections.
   *
   * Delete-then-insert rather than a diff. The children are ordered, small and
   * always submitted as a complete set by the editor, so reconciling them
   * individually would be more code and more ways to get the ordering wrong for
   * no benefit the editor can perceive.
   *
   * The ordering within the method is not arbitrary: callouts are deleted before
   * capabilities and written after them, because a callout's foreign key is
   * RESTRICT and points at a capability row.
   */
  private async writeChildren(
    manager: EntityManager,
    caseStudyId: string,
    dto: CreateCaseStudyDto | UpdateCaseStudyDto,
    isCreate: boolean,
  ): Promise<void> {
    /* Callouts first — they reference capabilities. */
    if (dto.callouts !== undefined || dto.capabilities !== undefined) {
      if (!isCreate) await manager.delete(CaseStudyCalloutEntity, { caseStudyId });
    }

    if (dto.capabilities !== undefined) {
      if (!isCreate) await manager.delete(CaseStudyCapabilityEntity, { caseStudyId });

      if (dto.capabilities.length) {
        await manager.insert(
          CaseStudyCapabilityEntity,
          dto.capabilities.map((c) => ({
            caseStudyId,
            label: c.label,
            position: c.position,
          })),
        );
      }
    }

    if (dto.callouts !== undefined && dto.callouts.length) {
      /* Capability ids were just regenerated, so the dto's ids are stale. They
         are re-resolved by label — which is exactly the verbatim-match rule the
         design requires, enforced here rather than trusted. */
      const capabilities = await manager.find(CaseStudyCapabilityEntity, {
        where: { caseStudyId },
      });

      const byId = new Map(capabilities.map((c) => [c.id, c]));
      const byLabel = new Map(capabilities.map((c) => [c.label, c]));

      const rows = dto.callouts.map((callout) => {
        const submitted = dto.capabilities?.find((c) => c.id === callout.capabilityId);

        const resolved =
          byId.get(callout.capabilityId) ??
          (submitted ? byLabel.get(submitted.label) : undefined);

        if (!resolved) {
          throw new ValidationException([
            {
              field: "callouts",
              message:
                "Each callout must name one of this case study's own capabilities.",
              code: "unknownCapability",
            },
          ]);
        }

        return {
          caseStudyId,
          capabilityId: resolved.id,
          icon: callout.icon,
          x: String(callout.x),
          y: String(callout.y),
          position: callout.position,
        };
      });

      await manager.insert(CaseStudyCalloutEntity, rows);
    }

    if (dto.highlights !== undefined) {
      if (!isCreate) await manager.delete(CaseStudyHighlightEntity, { caseStudyId });
      if (dto.highlights.length) {
        await manager.insert(
          CaseStudyHighlightEntity,
          dto.highlights.map((h) => ({
            caseStudyId,
            value: h.value,
            detail: h.detail,
            position: h.position,
          })),
        );
      }
    }

    if (dto.stats !== undefined) {
      if (!isCreate) await manager.delete(CaseStudyStatEntity, { caseStudyId });
      if (dto.stats.length) {
        await manager.insert(
          CaseStudyStatEntity,
          dto.stats.map((s) => ({
            caseStudyId,
            value: s.value,
            label: s.label,
            position: s.position,
          })),
        );
      }
    }

    if (dto.meta !== undefined) {
      if (!isCreate) await manager.delete(CaseStudyMetaRowEntity, { caseStudyId });
      if (dto.meta.length) {
        await manager.insert(
          CaseStudyMetaRowEntity,
          dto.meta.map((m) => ({
            caseStudyId,
            label: m.label,
            value: m.value,
            position: m.position,
          })),
        );
      }
    }

    if (dto.challenges !== undefined) {
      if (!isCreate) await manager.delete(CaseStudyChallengeEntity, { caseStudyId });
      if (dto.challenges.length) {
        await manager.insert(
          CaseStudyChallengeEntity,
          dto.challenges.map((c) => ({
            caseStudyId,
            title: c.title,
            challenge: c.challenge,
            solution: c.solution,
            position: c.position,
          })),
        );
      }
    }

    if (dto.screenshots !== undefined) {
      if (!isCreate) await manager.delete(CaseStudyScreenshotEntity, { caseStudyId });
      if (dto.screenshots.length) {
        await manager.insert(
          CaseStudyScreenshotEntity,
          dto.screenshots.map((s) => ({
            caseStudyId,
            mediaId: s.mediaId,
            fit: s.fit,
            lead: s.lead,
            position: s.position,
          })),
        );
      }
    }

    /* Intro and results share one table, so both are rewritten together when
       either is submitted — deleting by kind keeps the other untouched. */
    if (dto.intro !== undefined) {
      if (!isCreate) {
        await manager.delete(CaseStudyParagraphEntity, {
          caseStudyId,
          kind: CaseStudyParagraphKind.INTRO,
        });
      }
      if (dto.intro.length) {
        await manager.insert(
          CaseStudyParagraphEntity,
          dto.intro.map((text, i) => ({
            caseStudyId,
            kind: CaseStudyParagraphKind.INTRO,
            text,
            position: i,
          })),
        );
      }
    }

    if (dto.results !== undefined) {
      if (!isCreate) {
        await manager.delete(CaseStudyParagraphEntity, {
          caseStudyId,
          kind: CaseStudyParagraphKind.RESULT,
        });
      }
      if (dto.results.length) {
        await manager.insert(
          CaseStudyParagraphEntity,
          dto.results.map((text, i) => ({
            caseStudyId,
            kind: CaseStudyParagraphKind.RESULT,
            text,
            position: i,
          })),
        );
      }
    }
  }

  private async linkIndustries(
    manager: EntityManager,
    caseStudyId: string,
    industryIds: string[],
  ): Promise<void> {
    const found = await manager.find(IndustryEntity, { where: { id: In(industryIds) } });

    if (found.length !== industryIds.length) {
      throw new ValidationException([
        { field: "industryIds", message: "One or more industries do not exist.", code: "exists" },
      ]);
    }

    await manager
      .createQueryBuilder()
      .relation(CaseStudyEntity, "industries")
      .of(caseStudyId)
      .addAndRemove(
        industryIds,
        (
          await manager
            .createQueryBuilder()
            .relation(CaseStudyEntity, "industries")
            .of(caseStudyId)
            .loadMany<IndustryEntity>()
        ).map((i) => i.id),
      );
  }

  protected override pathsFor(entity: CaseStudyEntity): string[] {
    return ["/", "/case-studies", `/case-studies/${entity.slug}`];
  }
}

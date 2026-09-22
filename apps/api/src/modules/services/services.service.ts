import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  AuditAction,
  AuditResource,
  ContentStatus,
  type Service,
  type ServiceDetail,
} from "@funavry/types";
import { DataSource, EntityManager, In, Repository, SelectQueryBuilder } from "typeorm";

import { SimpleContentService } from "src/common/services/simple-content.service";
import {
  ConflictException,
  ResourceNotFoundException,
  ValidationException,
} from "src/common/exceptions/app.exception";
import {
  CaseStudyEntity,
  ServiceEntity,
  ServiceSubEntity,
} from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { toCaseStudySummary } from "src/modules/case-studies/case-study.mapper";
import { CacheTag, RevalidationService } from "src/modules/revalidation/revalidation.service";
import { STORAGE_DRIVER, type StorageDriverPort } from "src/modules/media/storage/storage.interface";

import { CreateServiceDto, UpdateServiceDto } from "./dto/service.dto";

@Injectable()
export class ServicesService extends SimpleContentService<ServiceEntity, Service> {
  constructor(
    @InjectRepository(ServiceEntity) repo: Repository<ServiceEntity>,
    @InjectRepository(CaseStudyEntity)
    private readonly caseStudies: Repository<CaseStudyEntity>,
    private readonly dataSource: DataSource,
    @Inject(STORAGE_DRIVER) private readonly storage: StorageDriverPort,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(
      repo,
      audit,
      revalidation,
      {
        resourceName: "Service",
        auditResource: AuditResource.SERVICE,
        cacheTags: [CacheTag.SERVICES, CacheTag.CASE_STUDIES],
        sortable: ["position", "title", "number", "createdAt", "updatedAt"],
        searchable: ["title", "summary"],
        defaultSort: { field: "position", direction: "ASC" },
      },
      [],
    );
  }

  protected override get alias(): string {
    return "service";
  }

  protected override applyRelations(
    qb: SelectQueryBuilder<ServiceEntity>,
  ): SelectQueryBuilder<ServiceEntity> {
    return qb.leftJoinAndSelect("service.subs", "sub");
  }

  protected toDto(e: ServiceEntity): Service {
    return {
      id: e.id,
      slug: e.slug,
      number: e.number,
      title: e.title,
      group: e.group,
      phase: e.phase,
      icon: e.icon,
      summary: e.summary,
      position: e.position,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      publishedAt: e.publishedAt?.toISOString() ?? null,
      version: e.version,
      subs: (e.subs ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          position: s.position,
        })),
      seo: {
        title: e.seo?.title ?? null,
        description: e.seo?.description ?? null,
        ogImage: null,
        canonicalUrl: e.seo?.canonicalUrl ?? null,
        noIndex: e.seo?.noIndex ?? false,
      },
    };
  }

  /** A practice page, with its curated proof. */
  async getDetailBySlug(slug: string, publishedOnly: boolean): Promise<ServiceDetail> {
    /* Per-relation load, for the same reason as the case-study detail query:
       joining sub-services and case studies and their collections into one
       statement multiplies out. */
    const found = await this.repo.findOne({
      where: publishedOnly ? { slug, status: ContentStatus.PUBLISHED } : { slug },
      relations: {
        subs: true,
        caseStudies: {
          image: true,
          mobileImage: true,
          capabilities: true,
          highlights: true,
        },
      },
      relationLoadStrategy: "query",
    });

    if (!found) throw new ResourceNotFoundException("Service", slug);

    const caseStudies = (found.caseStudies ?? []).filter(
      (cs) => !publishedOnly || cs.status === ContentStatus.PUBLISHED,
    );

    return {
      ...this.toDto(found),
      caseStudies: caseStudies.map((cs) =>
        toCaseStudySummary(cs, (k) => this.storage.urlFor(k)),
      ),
    };
  }

  /** Creates a practice with its sub-services and curated proof, atomically. */
  async createFull(dto: CreateServiceDto, actorId: string): Promise<Service> {
    await this.assertSlugFree(dto.slug);

    const id = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ServiceEntity);

      const saved = await repo.save(
        repo.create({
          slug: dto.slug,
          number: dto.number,
          title: dto.title,
          group: dto.group,
          phase: dto.phase,
          icon: dto.icon,
          summary: dto.summary,
          status: dto.status ?? ContentStatus.DRAFT,
          position: dto.position ?? 0,
          updatedById: actorId,
          publishedAt: dto.status === ContentStatus.PUBLISHED ? new Date() : null,
          seo: {
            title: dto.seo?.title ?? null,
            description: dto.seo?.description ?? null,
            ogImageId: dto.seo?.ogImageId ?? null,
            canonicalUrl: dto.seo?.canonicalUrl ?? null,
            noIndex: dto.seo?.noIndex ?? false,
          },
        }),
      );

      await this.writeSubs(manager, saved.id, dto.subs, true);
      if (dto.caseStudyIds) await this.linkCaseStudies(manager, saved.id, dto.caseStudyIds);

      return saved.id;
    });

    const entity = await this.repo.findOneOrFail({ where: { id } });
    await this.afterWrite(AuditAction.CREATE, entity, null);

    return this.getDto(id);
  }

  async updateFull(id: string, dto: UpdateServiceDto, actorId: string): Promise<Service> {
    const existing = await this.repo.findOne({ where: { id } });

    if (!existing) throw new ResourceNotFoundException("Service", id);

    if (dto.expectedVersion !== undefined && existing.version !== dto.expectedVersion) {
      throw new ConflictException(
        "This service was changed by someone else. Reload and try again.",
      );
    }

    if (dto.slug && dto.slug !== existing.slug) await this.assertSlugFree(dto.slug, id);

    const before = { ...existing } as Record<string, unknown>;

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ServiceEntity);

      const scalars: Partial<ServiceEntity> = { updatedById: actorId };

      const assign = <K extends keyof ServiceEntity>(
        key: K,
        value: ServiceEntity[K] | undefined,
      ): void => {
        if (value !== undefined) scalars[key] = value;
      };

      assign("slug", dto.slug);
      assign("number", dto.number);
      assign("title", dto.title);
      assign("group", dto.group);
      assign("phase", dto.phase);
      assign("icon", dto.icon);
      assign("summary", dto.summary);
      assign("status", dto.status);
      assign("position", dto.position);

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

      if (dto.subs !== undefined) await this.writeSubs(manager, id, dto.subs, false);
      if (dto.caseStudyIds !== undefined) {
        await this.linkCaseStudies(manager, id, dto.caseStudyIds);
      }
    });

    const entity = await this.repo.findOneOrFail({ where: { id } });
    await this.afterWrite(AuditAction.UPDATE, entity, before);

    return this.getDto(id);
  }

  private async writeSubs(
    manager: EntityManager,
    serviceId: string,
    subs: CreateServiceDto["subs"],
    isCreate: boolean,
  ): Promise<void> {
    if (subs === undefined) return;

    if (!isCreate) await manager.delete(ServiceSubEntity, { serviceId });

    if (subs.length) {
      await manager.insert(
        ServiceSubEntity,
        subs.map((s) => ({
          serviceId,
          title: s.title,
          description: s.description,
          position: s.position,
        })),
      );
    }
  }

  private async linkCaseStudies(
    manager: EntityManager,
    serviceId: string,
    caseStudyIds: string[],
  ): Promise<void> {
    if (caseStudyIds.length) {
      const found = await manager.count(CaseStudyEntity, { where: { id: In(caseStudyIds) } });

      if (found !== caseStudyIds.length) {
        throw new ValidationException([
          {
            field: "caseStudyIds",
            message: "One or more case studies do not exist.",
            code: "exists",
          },
        ]);
      }
    }

    const current = await manager
      .createQueryBuilder()
      .relation(ServiceEntity, "caseStudies")
      .of(serviceId)
      .loadMany<CaseStudyEntity>();

    await manager
      .createQueryBuilder()
      .relation(ServiceEntity, "caseStudies")
      .of(serviceId)
      .addAndRemove(
        caseStudyIds,
        current.map((c) => c.id),
      );
  }

  protected override pathsFor(entity: ServiceEntity): string[] {
    return ["/services", `/services/${entity.slug}`];
  }
}

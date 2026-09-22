import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  AuditAction,
  AuditResource,
  ContentStatus,
  type Office,
} from "@funavry/types";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";

import { SimpleContentService } from "src/common/services/simple-content.service";
import {
  ConflictException,
  ResourceNotFoundException,
} from "src/common/exceptions/app.exception";
import { OfficeAddressLineEntity, OfficeEntity } from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { toMediaRef } from "src/modules/case-studies/case-study.mapper";
import { CacheTag, RevalidationService } from "src/modules/revalidation/revalidation.service";
import { STORAGE_DRIVER, type StorageDriverPort } from "src/modules/media/storage/storage.interface";

import { CreateOfficeDto, UpdateOfficeDto } from "./dto/org.dto";

@Injectable()
export class OfficesService extends SimpleContentService<OfficeEntity, Office> {
  constructor(
    @InjectRepository(OfficeEntity) repo: Repository<OfficeEntity>,
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
        resourceName: "Office",
        auditResource: AuditResource.OFFICE,
        cacheTags: [CacheTag.OFFICES],
        sortable: ["position", "city", "country", "createdAt"],
        searchable: ["city", "country", "role", "blurb"],
        defaultSort: { field: "position", direction: "ASC" },
      },
      [],
    );
  }

  protected override get alias(): string {
    return "office";
  }

  protected override applyRelations(
    qb: SelectQueryBuilder<OfficeEntity>,
  ): SelectQueryBuilder<OfficeEntity> {
    return qb
      .leftJoinAndSelect("office.flag", "flag")
      .leftJoinAndSelect("office.addressLines", "addressLine");
  }

  protected toDto(e: OfficeEntity): Office {
    return {
      id: e.id,
      slug: e.slug,
      country: e.country,
      city: e.city,
      role: e.role,
      blurb: e.blurb,
      addressLines: (e.addressLines ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((l) => l.text),
      flag: toMediaRef(e.flag, (k) => this.storage.urlFor(k)),
      /* Stored as DECIMAL and returned by the driver as a string, so it is
         converted once here — the globe needs numbers, and letting each caller
         do its own parseFloat is how one of them eventually forgets. */
      location: { lon: Number(e.longitude), lat: Number(e.latitude) },
      isHeadquarters: e.isHeadquarters,
      email: e.email,
      phone: e.phone,
      position: e.position,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      publishedAt: e.publishedAt?.toISOString() ?? null,
      version: e.version,
    };
  }

  async createFull(dto: CreateOfficeDto, actorId: string): Promise<Office> {
    await this.assertSlugFree(dto.slug);

    const id = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(OfficeEntity);

      const saved = await repo.save(
        repo.create({
          slug: dto.slug,
          country: dto.country,
          city: dto.city,
          role: dto.role,
          blurb: dto.blurb,
          flagId: dto.flagId ?? null,
          longitude: String(dto.longitude),
          latitude: String(dto.latitude),
          isHeadquarters: dto.isHeadquarters ?? false,
          email: dto.email ?? null,
          phone: dto.phone ?? null,
          status: dto.status ?? ContentStatus.DRAFT,
          position: dto.position ?? 0,
          updatedById: actorId,
          publishedAt: dto.status === ContentStatus.PUBLISHED ? new Date() : null,
        }),
      );

      if (dto.addressLines?.length) {
        await manager.insert(
          OfficeAddressLineEntity,
          dto.addressLines.map((text, i) => ({ officeId: saved.id, text, position: i })),
        );
      }

      return saved.id;
    });

    await this.afterWrite(
      AuditAction.CREATE,
      await this.repo.findOneOrFail({ where: { id } }),
      null,
    );

    return this.getDto(id);
  }

  async updateFull(id: string, dto: UpdateOfficeDto, actorId: string): Promise<Office> {
    const existing = await this.repo.findOne({ where: { id } });

    if (!existing) throw new ResourceNotFoundException("Office", id);

    if (dto.expectedVersion !== undefined && existing.version !== dto.expectedVersion) {
      throw new ConflictException(
        "This office was changed by someone else. Reload and try again.",
      );
    }

    if (dto.slug && dto.slug !== existing.slug) await this.assertSlugFree(dto.slug, id);

    const before = { ...existing } as Record<string, unknown>;

    await this.dataSource.transaction(async (manager) => {
      const scalars: Partial<OfficeEntity> = { updatedById: actorId };

      const assign = <K extends keyof OfficeEntity>(
        key: K,
        value: OfficeEntity[K] | undefined,
      ): void => {
        if (value !== undefined) scalars[key] = value;
      };

      assign("slug", dto.slug);
      assign("country", dto.country);
      assign("city", dto.city);
      assign("role", dto.role);
      assign("blurb", dto.blurb);
      assign("flagId", dto.flagId ?? undefined);
      assign("isHeadquarters", dto.isHeadquarters);
      assign("email", dto.email ?? undefined);
      assign("phone", dto.phone ?? undefined);
      assign("status", dto.status);
      assign("position", dto.position);

      if (dto.longitude !== undefined) scalars.longitude = String(dto.longitude);
      if (dto.latitude !== undefined) scalars.latitude = String(dto.latitude);

      if (dto.status === ContentStatus.PUBLISHED && !existing.publishedAt) {
        scalars.publishedAt = new Date();
      }

      await manager.update(OfficeEntity, id, scalars);

      if (dto.addressLines !== undefined) {
        await manager.delete(OfficeAddressLineEntity, { officeId: id });
        if (dto.addressLines.length) {
          await manager.insert(
            OfficeAddressLineEntity,
            dto.addressLines.map((text, i) => ({ officeId: id, text, position: i })),
          );
        }
      }
    });

    await this.afterWrite(
      AuditAction.UPDATE,
      await this.repo.findOneOrFail({ where: { id } }),
      before,
    );

    return this.getDto(id);
  }

  /* An office appears in the footer on every page, so a change purges the
     whole site rather than a list of routes that would go stale. */
  protected override pathsFor(): string[] {
    return ["/", "/about", "/contact"];
  }
}

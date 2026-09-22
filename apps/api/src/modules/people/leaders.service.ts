import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  AuditAction,
  AuditResource,
  ContentStatus,
  type Leader,
} from "@funavry/types";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";

import { SimpleContentService } from "src/common/services/simple-content.service";
import {
  ConflictException,
  ResourceNotFoundException,
} from "src/common/exceptions/app.exception";
import { LeaderEntity, LeaderPointEntity } from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { toMediaRef } from "src/modules/case-studies/case-study.mapper";
import { CacheTag, RevalidationService } from "src/modules/revalidation/revalidation.service";
import { STORAGE_DRIVER, type StorageDriverPort } from "src/modules/media/storage/storage.interface";

import { CreateLeaderDto, UpdateLeaderDto } from "./dto/people.dto";

@Injectable()
export class LeadersService extends SimpleContentService<LeaderEntity, Leader> {
  constructor(
    @InjectRepository(LeaderEntity) repo: Repository<LeaderEntity>,
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
        resourceName: "Leader",
        auditResource: AuditResource.LEADER,
        cacheTags: [CacheTag.LEADERS],
        sortable: ["position", "name", "role", "createdAt", "updatedAt"],
        searchable: ["name", "role", "bio"],
        defaultSort: { field: "position", direction: "ASC" },
      },
      [],
    );
  }

  protected override get alias(): string {
    return "leader";
  }

  protected override applyRelations(
    qb: SelectQueryBuilder<LeaderEntity>,
  ): SelectQueryBuilder<LeaderEntity> {
    return qb
      .leftJoinAndSelect("leader.photo", "photo")
      .leftJoinAndSelect("leader.points", "point");
  }

  protected toDto(e: LeaderEntity): Leader {
    return {
      id: e.id,
      slug: e.slug,
      name: e.name,
      role: e.role,
      initials: e.initials,
      photo: toMediaRef(e.photo, (k) => this.storage.urlFor(k)),
      bio: e.bio,
      email: e.email,
      linkedinUrl: e.linkedinUrl,
      isFounder: e.isFounder,
      isCoFounder: e.isCoFounder,
      position: e.position,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      publishedAt: e.publishedAt?.toISOString() ?? null,
      version: e.version,
      points: (e.points ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((p) => ({ id: p.id, text: p.text, position: p.position })),
    };
  }

  async createFull(dto: CreateLeaderDto, actorId: string): Promise<Leader> {
    await this.assertSlugFree(dto.slug);

    const id = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(LeaderEntity);

      const saved = await repo.save(
        repo.create({
          slug: dto.slug,
          name: dto.name,
          role: dto.role,
          initials: dto.initials,
          photoId: dto.photoId ?? null,
          bio: dto.bio ?? null,
          email: dto.email ?? null,
          linkedinUrl: dto.linkedinUrl ?? null,
          isFounder: dto.isFounder ?? false,
          isCoFounder: dto.isCoFounder ?? false,
          status: dto.status ?? ContentStatus.DRAFT,
          position: dto.position ?? 0,
          updatedById: actorId,
          publishedAt: dto.status === ContentStatus.PUBLISHED ? new Date() : null,
        }),
      );

      if (dto.points?.length) {
        await manager.insert(
          LeaderPointEntity,
          dto.points.map((text, i) => ({ leaderId: saved.id, text, position: i })),
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

  async updateFull(id: string, dto: UpdateLeaderDto, actorId: string): Promise<Leader> {
    const existing = await this.repo.findOne({ where: { id } });

    if (!existing) throw new ResourceNotFoundException("Leader", id);

    if (dto.expectedVersion !== undefined && existing.version !== dto.expectedVersion) {
      throw new ConflictException(
        "This profile was changed by someone else. Reload and try again.",
      );
    }

    if (dto.slug && dto.slug !== existing.slug) await this.assertSlugFree(dto.slug, id);

    const before = { ...existing } as Record<string, unknown>;

    await this.dataSource.transaction(async (manager) => {
      const scalars: Partial<LeaderEntity> = { updatedById: actorId };

      const assign = <K extends keyof LeaderEntity>(
        key: K,
        value: LeaderEntity[K] | undefined,
      ): void => {
        if (value !== undefined) scalars[key] = value;
      };

      assign("slug", dto.slug);
      assign("name", dto.name);
      assign("role", dto.role);
      assign("initials", dto.initials);
      assign("photoId", dto.photoId ?? undefined);
      assign("bio", dto.bio ?? undefined);
      assign("email", dto.email ?? undefined);
      assign("linkedinUrl", dto.linkedinUrl ?? undefined);
      assign("isFounder", dto.isFounder);
      assign("isCoFounder", dto.isCoFounder);
      assign("status", dto.status);
      assign("position", dto.position);

      if (dto.status === ContentStatus.PUBLISHED && !existing.publishedAt) {
        scalars.publishedAt = new Date();
      }

      await manager.update(LeaderEntity, id, scalars);

      if (dto.points !== undefined) {
        await manager.delete(LeaderPointEntity, { leaderId: id });
        if (dto.points.length) {
          await manager.insert(
            LeaderPointEntity,
            dto.points.map((text, i) => ({ leaderId: id, text, position: i })),
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

  protected override pathsFor(): string[] {
    return ["/about"];
  }
}

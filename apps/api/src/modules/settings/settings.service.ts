import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuditAction, AuditResource, type Setting } from "@funavry/types";
import { Repository } from "typeorm";

import {
  ResourceNotFoundException,
  ValidationException,
} from "src/common/exceptions/app.exception";
import { buildDiff } from "src/common/utils/redact";
import { SettingEntity } from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { CacheTag, RevalidationService } from "src/modules/revalidation/revalidation.service";

import { UpsertSettingDto } from "./dto/setting.dto";

/**
 * Site settings.
 *
 * Deliberately a key/value table rather than a single-row "site config" entity:
 * adding a setting should not be a migration, and the admin can render the right
 * input from `valueType` without the API knowing what any particular key means.
 */
@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly repo: Repository<SettingEntity>,
    private readonly audit: AuditService,
    private readonly revalidation: RevalidationService,
  ) {}

  async findAll(group?: string): Promise<Setting[]> {
    const rows = await this.repo.find({
      where: group ? { group } : {},
      order: { group: "ASC", key: "ASC" },
    });

    return rows.map((r) => this.toDto(r));
  }

  async findByKey(key: string): Promise<Setting> {
    const found = await this.repo.findOne({ where: { key } });
    if (!found) throw new ResourceNotFoundException("Setting", key);
    return this.toDto(found);
  }

  /**
   * Creates or updates a setting.
   *
   * The value is validated against its declared type before it is stored.
   * Storing everything as text and parsing on read would mean a typo in a
   * numeric setting surfaces as a NaN on the live site rather than as a
   * rejection in the form that produced it.
   */
  async upsert(dto: UpsertSettingDto, actorId: string): Promise<Setting> {
    const valueType = dto.valueType ?? "string";

    this.assertValueMatchesType(dto.value, valueType);

    const existing = await this.repo.findOne({ where: { key: dto.key } });

    const before = existing
      ? { value: existing.value, valueType: existing.valueType, group: existing.group }
      : null;

    const entity =
      existing ??
      this.repo.create({
        key: dto.key,
        group: dto.group ?? "general",
      });

    entity.value = dto.value;
    entity.valueType = valueType;
    if (dto.group !== undefined) entity.group = dto.group;
    if (dto.description !== undefined) entity.description = dto.description;
    entity.updatedById = actorId;

    const saved = await this.repo.save(entity);

    await this.audit.record({
      action: existing ? AuditAction.UPDATE : AuditAction.CREATE,
      resource: AuditResource.SETTING,
      resourceId: saved.id,
      resourceLabel: saved.key,
      changes: buildDiff(before, {
        value: saved.value,
        valueType: saved.valueType,
        group: saved.group,
      }),
      success: true,
    });

    /* A setting can feed anything, so the whole site is purged rather than a
       tag list that would be wrong the moment a new setting is consumed
       somewhere unexpected. */
    await this.revalidation.revalidate([CacheTag.SETTINGS], ["/"]);

    return this.toDto(saved);
  }

  async remove(key: string): Promise<{ key: string; deleted: true }> {
    const found = await this.repo.findOne({ where: { key } });
    if (!found) throw new ResourceNotFoundException("Setting", key);

    await this.repo.remove(found);

    await this.audit.record({
      action: AuditAction.DELETE,
      resource: AuditResource.SETTING,
      resourceLabel: key,
      success: true,
    });

    await this.revalidation.revalidate([CacheTag.SETTINGS], ["/"]);

    return { key, deleted: true };
  }

  private assertValueMatchesType(value: string, type: Setting["valueType"]): void {
    if (type === "number" && !Number.isFinite(Number(value))) {
      throw new ValidationException([
        { field: "value", message: "Value must be a number.", code: "type" },
      ]);
    }

    if (type === "boolean" && !["true", "false"].includes(value)) {
      throw new ValidationException([
        { field: "value", message: "Value must be 'true' or 'false'.", code: "type" },
      ]);
    }

    if (type === "json") {
      try {
        JSON.parse(value);
      } catch {
        throw new ValidationException([
          { field: "value", message: "Value must be valid JSON.", code: "type" },
        ]);
      }
    }
  }

  private toDto(e: SettingEntity): Setting {
    return {
      id: e.id,
      key: e.key,
      value: e.value,
      valueType: e.valueType,
      group: e.group,
      description: e.description,
      updatedAt: e.updatedAt.toISOString(),
    };
  }
}

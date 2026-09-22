import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  AuditResource,
  type Client,
  type DeliveryCountry,
  type SocialLink,
  type Stat,
  type Technology,
} from "@funavry/types";
import { Repository } from "typeorm";

import { SimpleContentService } from "src/common/services/simple-content.service";
import {
  ClientEntity,
  DeliveryCountryEntity,
  SocialLinkEntity,
  StatEntity,
  TechnologyEntity,
} from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { toMediaRef } from "src/modules/case-studies/case-study.mapper";
import { CacheTag, RevalidationService } from "src/modules/revalidation/revalidation.service";
import { STORAGE_DRIVER, type StorageDriverPort } from "src/modules/media/storage/storage.interface";

/**
 * Clients and partners, one service over one table.
 *
 * The two are the same shape and several organisations are genuinely both, so
 * they are discriminated by `isPartner` rather than split — two tables would
 * force those into duplicate rows that then drift apart.
 */
@Injectable()
export class ClientsService extends SimpleContentService<ClientEntity, Client> {
  constructor(
    @InjectRepository(ClientEntity) repo: Repository<ClientEntity>,
    @Inject(STORAGE_DRIVER) private readonly storage: StorageDriverPort,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(
      repo,
      audit,
      revalidation,
      {
        resourceName: "Client",
        auditResource: AuditResource.CLIENT,
        cacheTags: [CacheTag.CLIENTS],
        sortable: ["position", "name", "createdAt"],
        searchable: ["name"],
        defaultSort: { field: "position", direction: "ASC" },
      },
      ["logo"],
    );
  }

  protected override get alias(): string {
    return "client";
  }

  protected toDto(e: ClientEntity): Client {
    return {
      id: e.id,
      slug: e.slug,
      name: e.name,
      logo: toMediaRef(e.logo, (k) => this.storage.urlFor(k)),
      websiteUrl: e.websiteUrl,
      isPartner: e.isPartner,
      position: e.position,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      publishedAt: e.publishedAt?.toISOString() ?? null,
      version: e.version,
    };
  }

  /** Published marks, optionally narrowed to partners or to plain clients. */
  async listPublicFiltered(isPartner?: boolean, limit?: number): Promise<Client[]> {
    const all = await this.listPublicDto(limit);
    return isPartner === undefined ? all : all.filter((c) => c.isPartner === isPartner);
  }

  protected override pathsFor(): string[] {
    return ["/"];
  }
}

@Injectable()
export class TechnologiesService extends SimpleContentService<TechnologyEntity, Technology> {
  constructor(
    @InjectRepository(TechnologyEntity) repo: Repository<TechnologyEntity>,
    @Inject(STORAGE_DRIVER) private readonly storage: StorageDriverPort,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(
      repo,
      audit,
      revalidation,
      {
        resourceName: "Technology",
        auditResource: AuditResource.TECHNOLOGY,
        cacheTags: [CacheTag.TECHNOLOGIES],
        sortable: ["position", "name", "category", "createdAt"],
        searchable: ["name", "category"],
        defaultSort: { field: "position", direction: "ASC" },
      },
      ["logo"],
    );
  }

  protected override get alias(): string {
    return "technology";
  }

  protected toDto(e: TechnologyEntity): Technology {
    return {
      id: e.id,
      slug: e.slug,
      name: e.name,
      category: e.category,
      iconSlug: e.iconSlug,
      logo: toMediaRef(e.logo, (k) => this.storage.urlFor(k)),
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

/**
 * Company figures.
 *
 * Centralised because the same numbers appear on About, the home Proof section
 * and the footer — three hardcoded copies is how a site ends up claiming two
 * different headcounts on two different pages.
 */
@Injectable()
export class StatsService extends SimpleContentService<StatEntity, Stat> {
  constructor(
    @InjectRepository(StatEntity) repo: Repository<StatEntity>,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(repo, audit, revalidation, {
      resourceName: "Stat",
      auditResource: AuditResource.STAT,
      cacheTags: [CacheTag.STATS],
      sortable: ["position", "key", "group", "createdAt"],
      searchable: ["key", "label", "value"],
      defaultSort: { field: "position", direction: "ASC" },
    });
  }

  protected override get alias(): string {
    return "stat";
  }

  protected toDto(e: StatEntity): Stat {
    return {
      id: e.id,
      key: e.key,
      value: e.value,
      label: e.label,
      group: e.group,
      position: e.position,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      publishedAt: e.publishedAt?.toISOString() ?? null,
      version: e.version,
    };
  }

  protected override pathsFor(): string[] {
    return ["/", "/about"];
  }
}

@Injectable()
export class SocialLinksService extends SimpleContentService<SocialLinkEntity, SocialLink> {
  constructor(
    @InjectRepository(SocialLinkEntity) repo: Repository<SocialLinkEntity>,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(repo, audit, revalidation, {
      resourceName: "Social link",
      auditResource: AuditResource.SOCIAL_LINK,
      cacheTags: [CacheTag.SOCIALS],
      sortable: ["position", "label", "createdAt"],
      searchable: ["label", "url"],
      defaultSort: { field: "position", direction: "ASC" },
    });
  }

  protected override get alias(): string {
    return "social";
  }

  protected toDto(e: SocialLinkEntity): SocialLink {
    return {
      id: e.id,
      label: e.label,
      url: e.url,
      icon: e.icon,
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

/**
 * Countries delivery reaches. Separate from offices on purpose — reach is not
 * presence, and conflating them would put an office pin where there is none.
 */
@Injectable()
export class DeliveryCountriesService extends SimpleContentService<
  DeliveryCountryEntity,
  DeliveryCountry
> {
  constructor(
    @InjectRepository(DeliveryCountryEntity) repo: Repository<DeliveryCountryEntity>,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(repo, audit, revalidation, {
      resourceName: "Delivery country",
      auditResource: AuditResource.OFFICE,
      cacheTags: [CacheTag.OFFICES],
      sortable: ["position", "name", "code"],
      searchable: ["name", "code"],
      defaultSort: { field: "position", direction: "ASC" },
    });
  }

  protected override get alias(): string {
    return "country";
  }

  protected toDto(e: DeliveryCountryEntity): DeliveryCountry {
    return { id: e.id, name: e.name, code: e.code, position: e.position };
  }

  protected override pathsFor(): string[] {
    return ["/", "/about"];
  }
}

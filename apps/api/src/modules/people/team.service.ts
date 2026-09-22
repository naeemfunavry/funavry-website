import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuditResource, type TeamMember } from "@funavry/types";
import { Repository } from "typeorm";

import { SimpleContentService } from "src/common/services/simple-content.service";
import { TeamMemberEntity } from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { toMediaRef } from "src/modules/case-studies/case-study.mapper";
import { CacheTag, RevalidationService } from "src/modules/revalidation/revalidation.service";
import { STORAGE_DRIVER, type StorageDriverPort } from "src/modules/media/storage/storage.interface";

@Injectable()
export class TeamService extends SimpleContentService<TeamMemberEntity, TeamMember> {
  constructor(
    @InjectRepository(TeamMemberEntity) repo: Repository<TeamMemberEntity>,
    @Inject(STORAGE_DRIVER) private readonly storage: StorageDriverPort,
    audit: AuditService,
    revalidation: RevalidationService,
  ) {
    super(
      repo,
      audit,
      revalidation,
      {
        resourceName: "Team member",
        auditResource: AuditResource.TEAM_MEMBER,
        cacheTags: [CacheTag.TEAM],
        sortable: ["position", "name", "role", "department", "createdAt"],
        searchable: ["name", "role", "department"],
        defaultSort: { field: "position", direction: "ASC" },
      },
      ["photo", "office"],
    );
  }

  protected override get alias(): string {
    return "member";
  }

  protected toDto(e: TeamMemberEntity): TeamMember {
    return {
      id: e.id,
      slug: e.slug,
      name: e.name,
      role: e.role,
      department: e.department,
      location: e.office?.city ?? null,
      initials: e.initials,
      photo: toMediaRef(e.photo, (k) => this.storage.urlFor(k)),
      bio: e.bio,
      linkedinUrl: e.linkedinUrl,
      position: e.position,
      officeId: e.officeId,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      publishedAt: e.publishedAt?.toISOString() ?? null,
      version: e.version,
    };
  }

  protected override pathsFor(): string[] {
    return ["/about"];
  }
}

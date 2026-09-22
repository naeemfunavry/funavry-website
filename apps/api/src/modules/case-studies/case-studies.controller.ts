import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AuditAction,
  AuditResource,
  type AuthUser,
  type CaseStudyDetail,
  type CaseStudySummary,
  ContentStatus,
  type Paginated,
  Permission,
} from "@funavry/types";

import { Audit } from "src/common/decorators/audit.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { RequirePermissions } from "src/common/decorators/roles.decorator";
import { ReorderDto } from "src/common/dto/reorder.dto";

import {
  CaseStudyQueryDto,
  CreateCaseStudyDto,
  UpdateCaseStudyDto,
} from "./dto/case-study.dto";
import { CaseStudiesService } from "./case-studies.service";

/**
 * Two surfaces on one resource.
 *
 * `/public/*` is unauthenticated and only ever serves PUBLISHED rows — that
 * filter is applied in the service, not left to the caller. Everything else
 * requires a token and a permission. Keeping them in one controller rather than
 * two keeps the pairing visible: it is obvious at a glance which reads are open
 * and that they are the narrow ones.
 */
@ApiTags("Case Studies")
@Controller("case-studies")
export class CaseStudiesController {
  constructor(private readonly service: CaseStudiesService) {}

  /* --------------------------------------------------------- public ----- */

  @Public()
  @Get("public")
  @ApiOperation({ summary: "Published case studies, for the public site" })
  listPublic(
    @Query("featured") featured?: string,
    @Query("limit") limit?: string,
  ): Promise<CaseStudySummary[]> {
    const parsedLimit = limit ? Math.min(Number(limit) || 0, 100) : undefined;

    return this.service.listPublic({
      featured: featured === undefined ? undefined : featured === "true",
      limit: parsedLimit,
    });
  }

  /* Declared before `public/:slug` — Nest matches in declaration order, and the
     parameterised route would otherwise swallow the literal one. */
  @Public()
  @Get("public/details")
  @ApiOperation({ summary: "Every published case study with its full brief, in one response" })
  listPublicDetails(): Promise<CaseStudyDetail[]> {
    return this.service.listPublicDetails();
  }

  @Public()
  @Get("public/:slug")
  @ApiOperation({ summary: "One published case study, with its full detail" })
  getPublic(@Param("slug") slug: string): Promise<CaseStudyDetail> {
    return this.service.getDetail(slug, true);
  }

  /* ---------------------------------------------------------- admin ----- */

  @Get()
  @RequirePermissions(Permission.CONTENT_READ)
  @ApiOperation({ summary: "List case studies, including drafts" })
  list(@Query() query: CaseStudyQueryDto): Promise<Paginated<CaseStudySummary>> {
    return this.service.list(query);
  }

  @Get(":id")
  @RequirePermissions(Permission.CONTENT_READ)
  getOne(@Param("id", ParseUUIDPipe) id: string): Promise<CaseStudyDetail> {
    return this.service.getById(id);
  }

  @Post()
  @RequirePermissions(Permission.CONTENT_CREATE)
  @Audit({ action: AuditAction.CREATE, resource: AuditResource.CASE_STUDY, labelField: "title" })
  @ApiOperation({ summary: "Create a case study and its full content graph" })
  create(
    @Body() dto: CreateCaseStudyDto,
    @CurrentUser() user: AuthUser,
  ): Promise<CaseStudyDetail> {
    return this.service.createFull(dto, user.id);
  }

  @Patch("reorder")
  @RequirePermissions(Permission.CONTENT_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rewrite display order in one transaction" })
  reorder(@Body() dto: ReorderDto): Promise<{ updated: number }> {
    return this.service.reorder(dto);
  }

  @Patch(":id")
  @RequirePermissions(Permission.CONTENT_UPDATE)
  @Audit({ action: AuditAction.UPDATE, resource: AuditResource.CASE_STUDY, labelField: "title" })
  @ApiOperation({ summary: "Update a case study" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCaseStudyDto,
    @CurrentUser() user: AuthUser,
  ): Promise<CaseStudyDetail> {
    return this.service.updateFull(id, dto, user.id);
  }

  /** Publishing is its own permission — an EDITOR may write but not go live. */
  @Patch(":id/publish")
  @RequirePermissions(Permission.CONTENT_PUBLISH)
  @HttpCode(HttpStatus.OK)
  @Audit({ action: AuditAction.PUBLISH, resource: AuditResource.CASE_STUDY })
  publish(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ id: string; status: ContentStatus }> {
    return this.service
      .setStatus(id, ContentStatus.PUBLISHED, user.id)
      .then((e) => ({ id: e.id, status: e.status }));
  }

  @Patch(":id/unpublish")
  @RequirePermissions(Permission.CONTENT_PUBLISH)
  @HttpCode(HttpStatus.OK)
  @Audit({ action: AuditAction.UNPUBLISH, resource: AuditResource.CASE_STUDY })
  unpublish(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ id: string; status: ContentStatus }> {
    return this.service
      .setStatus(id, ContentStatus.DRAFT, user.id)
      .then((e) => ({ id: e.id, status: e.status }));
  }

  @Delete(":id")
  @RequirePermissions(Permission.CONTENT_DELETE)
  @Audit({ action: AuditAction.DELETE, resource: AuditResource.CASE_STUDY })
  @ApiOperation({ summary: "Soft delete — recoverable via restore" })
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<{ id: string; deleted: true }> {
    return this.service.remove(id);
  }

  @Post(":id/restore")
  @RequirePermissions(Permission.CONTENT_DELETE)
  @HttpCode(HttpStatus.OK)
  @Audit({ action: AuditAction.RESTORE, resource: AuditResource.CASE_STUDY })
  restore(@Param("id", ParseUUIDPipe) id: string): Promise<CaseStudyDetail> {
    return this.service.restore(id).then((e) => this.service.getById(e.id));
  }
}

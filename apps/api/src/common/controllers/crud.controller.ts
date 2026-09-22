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
  Type,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AuditAction,
  type AuditResource,
  type AuthUser,
  ContentStatus,
  type Paginated,
  Permission,
} from "@funavry/types";

import { Audit } from "../decorators/audit.decorator";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Public } from "../decorators/public.decorator";
import { RequirePermissions } from "../decorators/roles.decorator";
import { PaginationQueryDto } from "../dto/pagination.dto";
import { ReorderDto } from "../dto/reorder.dto";
import type { SimpleContentService } from "../services/simple-content.service";

/**
 * The shape the generated controller exposes, so a resource-specific subclass
 * can extend it and still be type-checked. Returning a bare `Type<unknown>`
 * would make `extends CrudBase` an error — TypeScript cannot extend a class
 * whose members it does not know.
 */
export interface CrudControllerBase<TEntityDto> {
  listPublic(limit?: string): Promise<TEntityDto[]>;
  list(query: PaginationQueryDto): Promise<Paginated<TEntityDto>>;
  getOne(id: string): Promise<TEntityDto>;
  create(dto: unknown, user: AuthUser): Promise<TEntityDto>;
  reorder(dto: ReorderDto): Promise<{ updated: number }>;
  update(id: string, dto: unknown, user: AuthUser): Promise<TEntityDto>;
  publish(id: string, user: AuthUser): Promise<TEntityDto>;
  unpublish(id: string, user: AuthUser): Promise<TEntityDto>;
  remove(id: string): Promise<{ id: string; deleted: true }>;
  restore(id: string): Promise<TEntityDto>;
}

export interface CrudControllerOptions<TCreate, TUpdate> {
  /** Swagger group and the noun used in generated summaries. */
  name: string;
  auditResource: AuditResource;
  createDto: Type<TCreate>;
  updateDto: Type<TUpdate>;
  /** Exposes `GET /public/:slug`. Off for resources with no slug. */
  hasSlug?: boolean;
  queryDto?: Type<PaginationQueryDto>;
}

/**
 * Builds a standard CRUD controller.
 *
 * A factory rather than fourteen hand-written files. The routes, the permission
 * on each one, the audit decoration and the draft/published split are identical
 * for every flat content type, and copying them is how one resource ends up
 * missing its publish permission or serving drafts publicly — a difference
 * nobody notices in review because the files all look the same.
 *
 * The DTO classes are passed in and applied with `@Body(...)` per route, so each
 * resource keeps its own validation rules; only the plumbing is shared.
 */
export function createCrudController<TEntityDto, TCreate extends object, TUpdate extends object>(
  options: CrudControllerOptions<TCreate, TUpdate>,
): Type<CrudControllerBase<TEntityDto>> {
  const QueryDto = options.queryDto ?? PaginationQueryDto;

  @ApiTags(options.name)
  @Controller()
  class CrudController {
    constructor(readonly service: SimpleContentService<never, TEntityDto>) {}

    /* ------------------------------------------------------- public ----- */

    @Public()
    @Get("public")
    @ApiOperation({ summary: `Published ${options.name.toLowerCase()}, for the public site` })
    listPublic(@Query("limit") limit?: string): Promise<TEntityDto[]> {
      const parsed = limit ? Math.min(Number(limit) || 0, 200) : undefined;
      return this.service.listPublicDto(parsed);
    }

    /* -------------------------------------------------------- admin ----- */

    @Get()
    @RequirePermissions(Permission.CONTENT_READ)
    @ApiOperation({ summary: `List ${options.name.toLowerCase()}, including drafts` })
    list(@Query() query: InstanceType<typeof QueryDto>): Promise<Paginated<TEntityDto>> {
      return this.service.listDto(query);
    }

    @Get(":id")
    @RequirePermissions(Permission.CONTENT_READ)
    getOne(@Param("id", ParseUUIDPipe) id: string): Promise<TEntityDto> {
      return this.service.getDto(id);
    }

    @Post()
    @RequirePermissions(Permission.CONTENT_CREATE)
    @Audit({ action: AuditAction.CREATE, resource: options.auditResource })
    create(
      @Body() dto: TCreate,
      @CurrentUser() user: AuthUser,
    ): Promise<TEntityDto> {
      return this.service.createDto(dto as never, user.id);
    }

    /* Declared before `:id` — Nest matches in declaration order, and a later
       literal route would otherwise be swallowed by the parameterised one. */
    @Patch("reorder")
    @RequirePermissions(Permission.CONTENT_UPDATE)
    @HttpCode(HttpStatus.OK)
    reorder(@Body() dto: ReorderDto): Promise<{ updated: number }> {
      return this.service.reorder(dto);
    }

    @Patch(":id")
    @RequirePermissions(Permission.CONTENT_UPDATE)
    @Audit({ action: AuditAction.UPDATE, resource: options.auditResource })
    update(
      @Param("id", ParseUUIDPipe) id: string,
      @Body() dto: TUpdate & { expectedVersion?: number },
      @CurrentUser() user: AuthUser,
    ): Promise<TEntityDto> {
      const { expectedVersion, ...rest } = dto;
      return this.service.updateDto(id, rest as never, user.id, expectedVersion);
    }

    @Patch(":id/publish")
    @RequirePermissions(Permission.CONTENT_PUBLISH)
    @HttpCode(HttpStatus.OK)
    @Audit({ action: AuditAction.PUBLISH, resource: options.auditResource })
    publish(
      @Param("id", ParseUUIDPipe) id: string,
      @CurrentUser() user: AuthUser,
    ): Promise<TEntityDto> {
      return this.service.setStatusDto(id, ContentStatus.PUBLISHED, user.id);
    }

    @Patch(":id/unpublish")
    @RequirePermissions(Permission.CONTENT_PUBLISH)
    @HttpCode(HttpStatus.OK)
    @Audit({ action: AuditAction.UNPUBLISH, resource: options.auditResource })
    unpublish(
      @Param("id", ParseUUIDPipe) id: string,
      @CurrentUser() user: AuthUser,
    ): Promise<TEntityDto> {
      return this.service.setStatusDto(id, ContentStatus.DRAFT, user.id);
    }

    @Delete(":id")
    @RequirePermissions(Permission.CONTENT_DELETE)
    @Audit({ action: AuditAction.DELETE, resource: options.auditResource })
    @ApiOperation({ summary: "Soft delete — recoverable via restore" })
    remove(@Param("id", ParseUUIDPipe) id: string): Promise<{ id: string; deleted: true }> {
      return this.service.remove(id);
    }

    @Post(":id/restore")
    @RequirePermissions(Permission.CONTENT_DELETE)
    @HttpCode(HttpStatus.OK)
    @Audit({ action: AuditAction.RESTORE, resource: options.auditResource })
    restore(@Param("id", ParseUUIDPipe) id: string): Promise<TEntityDto> {
      return this.service.restoreDto(id);
    }
  }

  /* The `@Body()` decorators above carry no design:type for a generic, so the
     DTO classes are attached explicitly — without this, ValidationPipe has no
     class to validate against and every payload would pass straight through. */
  Reflect.defineMetadata(
    "design:paramtypes",
    [options.createDto, Object],
    CrudController.prototype,
    "create",
  );
  Reflect.defineMetadata(
    "design:paramtypes",
    [String, options.updateDto, Object],
    CrudController.prototype,
    "update",
  );
  Reflect.defineMetadata(
    "design:paramtypes",
    [QueryDto],
    CrudController.prototype,
    "list",
  );

  return CrudController as unknown as Type<CrudControllerBase<TEntityDto>>;
}

import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AuditAction,
  AuditResource,
  type AuthUser,
  Permission,
  type Service,
  type ServiceDetail,
} from "@funavry/types";

import { createCrudController } from "src/common/controllers/crud.controller";
import { Audit } from "src/common/decorators/audit.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { RequirePermissions } from "src/common/decorators/roles.decorator";

import { CreateServiceDto, UpdateServiceDto } from "./dto/service.dto";
import { ServicesService } from "./services.service";

const CrudBase = createCrudController<Service, CreateServiceDto, UpdateServiceDto>({
  name: "Services",
  auditResource: AuditResource.SERVICE,
  createDto: CreateServiceDto,
  updateDto: UpdateServiceDto,
  hasSlug: true,
});

/**
 * `create` and `update` are overridden because a service carries sub-services
 * and a curated case-study list, which the generic routes would silently drop —
 * they only know how to write the row's own columns.
 */
@ApiTags("Services")
@Controller("services")
export class ServicesController extends CrudBase {
  constructor(readonly service: ServicesService) {
    super(service);
  }

  @Public()
  @Get("public/:slug")
  @ApiOperation({ summary: "A published practice with its published proof" })
  getPublicDetail(@Param("slug") slug: string): Promise<ServiceDetail> {
    return this.service.getDetailBySlug(slug, true);
  }

  @Get("by-slug/:slug")
  @RequirePermissions(Permission.CONTENT_READ)
  getBySlug(@Param("slug") slug: string): Promise<ServiceDetail> {
    return this.service.getDetailBySlug(slug, false);
  }

  @Post()
  @RequirePermissions(Permission.CONTENT_CREATE)
  @Audit({ action: AuditAction.CREATE, resource: AuditResource.SERVICE, labelField: "title" })
  override create(
    @Body() dto: CreateServiceDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Service> {
    return this.service.createFull(dto, user.id);
  }

  @Patch(":id")
  @RequirePermissions(Permission.CONTENT_UPDATE)
  @Audit({ action: AuditAction.UPDATE, resource: AuditResource.SERVICE, labelField: "title" })
  override update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Service> {
    return this.service.updateFull(id, dto, user.id);
  }
}

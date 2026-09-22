import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuditResource, type Industry, type IndustryDetail, Permission } from "@funavry/types";

import { createCrudController } from "src/common/controllers/crud.controller";
import { Public } from "src/common/decorators/public.decorator";
import { RequirePermissions } from "src/common/decorators/roles.decorator";

import { CreateIndustryDto, UpdateIndustryDto } from "./dto/industry.dto";
import { IndustriesService } from "./industries.service";

/** The standard CRUD surface, generated. */
const CrudBase = createCrudController<Industry, CreateIndustryDto, UpdateIndustryDto>({
  name: "Industries",
  auditResource: AuditResource.INDUSTRY,
  createDto: CreateIndustryDto,
  updateDto: UpdateIndustryDto,
  hasSlug: true,
});

/**
 * Extends the generated controller with the two routes that are specific to
 * this resource — an industry page carries the work filed under it, which no
 * generic CRUD route knows how to assemble.
 */
@ApiTags("Industries")
@Controller("industries")
export class IndustriesController extends CrudBase {
  constructor(readonly service: IndustriesService) {
    super(service);
  }

  @Public()
  @Get("public/:slug")
  @ApiOperation({ summary: "A published industry with its published case studies" })
  getPublicDetail(@Param("slug") slug: string): Promise<IndustryDetail> {
    return this.service.getDetailBySlug(slug, true);
  }

  @Get("by-slug/:slug")
  @RequirePermissions(Permission.CONTENT_READ)
  @ApiOperation({ summary: "An industry by slug, including drafts" })
  getBySlug(@Param("slug") slug: string): Promise<IndustryDetail> {
    return this.service.getDetailBySlug(slug, false);
  }
}

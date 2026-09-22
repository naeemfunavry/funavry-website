import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AuditAction,
  AuditResource,
  type AuthUser,
  type Client,
  type DeliveryCountry,
  type Office,
  Permission,
  type SocialLink,
  type Stat,
  type Technology,
} from "@funavry/types";

import { createCrudController } from "src/common/controllers/crud.controller";
import { Audit } from "src/common/decorators/audit.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { RequirePermissions } from "src/common/decorators/roles.decorator";

import {
  CreateClientDto,
  CreateDeliveryCountryDto,
  CreateOfficeDto,
  CreateSocialLinkDto,
  CreateStatDto,
  CreateTechnologyDto,
  UpdateClientDto,
  UpdateDeliveryCountryDto,
  UpdateOfficeDto,
  UpdateSocialLinkDto,
  UpdateStatDto,
  UpdateTechnologyDto,
} from "./dto/org.dto";
import { OfficesService } from "./offices.service";
import {
  ClientsService,
  DeliveryCountriesService,
  SocialLinksService,
  StatsService,
  TechnologiesService,
} from "./org.services";

/* --------------------------------------------------------------- offices - */

const OfficeCrud = createCrudController<Office, CreateOfficeDto, UpdateOfficeDto>({
  name: "Offices",
  auditResource: AuditResource.OFFICE,
  createDto: CreateOfficeDto,
  updateDto: UpdateOfficeDto,
  hasSlug: true,
});

/** Locations. Writes are overridden because an office owns its address lines. */
@ApiTags("Offices")
@Controller("offices")
export class OfficesController extends OfficeCrud {
  constructor(readonly service: OfficesService) {
    super(service);
  }

  @Public()
  @Get("public/:slug")
  getPublicBySlug(@Param("slug") slug: string): Promise<Office> {
    return this.service.getBySlugDto(slug, true);
  }

  @Post()
  @RequirePermissions(Permission.CONTENT_CREATE)
  @Audit({ action: AuditAction.CREATE, resource: AuditResource.OFFICE, labelField: "city" })
  override create(
    @Body() dto: CreateOfficeDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Office> {
    return this.service.createFull(dto, user.id);
  }

  @Patch(":id")
  @RequirePermissions(Permission.CONTENT_UPDATE)
  @Audit({ action: AuditAction.UPDATE, resource: AuditResource.OFFICE, labelField: "city" })
  override update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateOfficeDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Office> {
    return this.service.updateFull(id, dto, user.id);
  }
}

/* ------------------------------------------------------ clients/partners - */

const ClientCrud = createCrudController<Client, CreateClientDto, UpdateClientDto>({
  name: "Clients",
  auditResource: AuditResource.CLIENT,
  createDto: CreateClientDto,
  updateDto: UpdateClientDto,
  hasSlug: true,
});

@ApiTags("Clients")
@Controller("clients")
export class ClientsController extends ClientCrud {
  constructor(readonly service: ClientsService) {
    super(service);
  }

  /**
   * Partners are the same table filtered, exposed as their own route so the
   * public site can ask for "partners" without knowing that is a boolean
   * column on the clients table.
   */
  @Public()
  @Get("public/partners")
  @ApiOperation({ summary: "Published partner marks" })
  listPartners(@Query("limit") limit?: string): Promise<Client[]> {
    return this.service.listPublicFiltered(true, limit ? Number(limit) : undefined);
  }

  @Public()
  @Get("public/clients")
  @ApiOperation({ summary: "Published client marks, excluding partners" })
  listClientsOnly(@Query("limit") limit?: string): Promise<Client[]> {
    return this.service.listPublicFiltered(false, limit ? Number(limit) : undefined);
  }
}

/* ---------------------------------------------------------- technologies - */

const TechnologyCrud = createCrudController<Technology, CreateTechnologyDto, UpdateTechnologyDto>({
  name: "Technologies",
  auditResource: AuditResource.TECHNOLOGY,
  createDto: CreateTechnologyDto,
  updateDto: UpdateTechnologyDto,
  hasSlug: true,
});

@ApiTags("Technologies")
@Controller("technologies")
export class TechnologiesController extends TechnologyCrud {
  constructor(readonly service: TechnologiesService) {
    super(service);
  }
}

/* ----------------------------------------------------------------- stats - */

const StatCrud = createCrudController<Stat, CreateStatDto, UpdateStatDto>({
  name: "Stats",
  auditResource: AuditResource.STAT,
  createDto: CreateStatDto,
  updateDto: UpdateStatDto,
});

@ApiTags("Stats")
@Controller("stats")
export class StatsController extends StatCrud {
  constructor(readonly service: StatsService) {
    super(service);
  }
}

/* ---------------------------------------------------------- social links - */

const SocialCrud = createCrudController<SocialLink, CreateSocialLinkDto, UpdateSocialLinkDto>({
  name: "Social Links",
  auditResource: AuditResource.SOCIAL_LINK,
  createDto: CreateSocialLinkDto,
  updateDto: UpdateSocialLinkDto,
});

@ApiTags("Social Links")
@Controller("social-links")
export class SocialLinksController extends SocialCrud {
  constructor(readonly service: SocialLinksService) {
    super(service);
  }
}

/* ----------------------------------------------------- delivery countries - */

const CountryCrud = createCrudController<
  DeliveryCountry,
  CreateDeliveryCountryDto,
  UpdateDeliveryCountryDto
>({
  name: "Delivery Countries",
  auditResource: AuditResource.OFFICE,
  createDto: CreateDeliveryCountryDto,
  updateDto: UpdateDeliveryCountryDto,
});

@ApiTags("Delivery Countries")
@Controller("delivery-countries")
export class DeliveryCountriesController extends CountryCrud {
  constructor(readonly service: DeliveryCountriesService) {
    super(service);
  }
}

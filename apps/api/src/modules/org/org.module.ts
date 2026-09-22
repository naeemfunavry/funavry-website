import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  ClientEntity,
  DeliveryCountryEntity,
  OfficeEntity,
  SocialLinkEntity,
  StatEntity,
  TechnologyEntity,
} from "src/database/entities";
import { MediaModule } from "src/modules/media/media.module";

import {
  ClientsController,
  DeliveryCountriesController,
  OfficesController,
  SocialLinksController,
  StatsController,
  TechnologiesController,
} from "./org.controller";
import { OfficesService } from "./offices.service";
import {
  ClientsService,
  DeliveryCountriesService,
  SocialLinksService,
  StatsService,
  TechnologiesService,
} from "./org.services";

/** The company's own facts: where it is, who it works with, what it runs on. */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfficeEntity,
      DeliveryCountryEntity,
      ClientEntity,
      TechnologyEntity,
      StatEntity,
      SocialLinkEntity,
    ]),
    MediaModule,
  ],
  controllers: [
    OfficesController,
    ClientsController,
    TechnologiesController,
    StatsController,
    SocialLinksController,
    DeliveryCountriesController,
  ],
  providers: [
    OfficesService,
    ClientsService,
    TechnologiesService,
    StatsService,
    SocialLinksService,
    DeliveryCountriesService,
  ],
  exports: [
    OfficesService,
    ClientsService,
    TechnologiesService,
    StatsService,
    SocialLinksService,
    DeliveryCountriesService,
  ],
})
export class OrgModule {}

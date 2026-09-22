import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CaseStudyEntity, ServiceEntity } from "src/database/entities";
import { MediaModule } from "src/modules/media/media.module";

import { ServicesController } from "./services.controller";
import { ServicesService } from "./services.service";

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity, CaseStudyEntity]), MediaModule],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}

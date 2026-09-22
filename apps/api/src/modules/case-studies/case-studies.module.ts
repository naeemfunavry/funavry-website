import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CaseStudyEntity, IndustryEntity } from "src/database/entities";
import { MediaModule } from "src/modules/media/media.module";

import { CaseStudiesController } from "./case-studies.controller";
import { CaseStudiesService } from "./case-studies.service";

@Module({
  imports: [TypeOrmModule.forFeature([CaseStudyEntity, IndustryEntity]), MediaModule],
  controllers: [CaseStudiesController],
  providers: [CaseStudiesService],
  exports: [CaseStudiesService],
})
export class CaseStudiesModule {}

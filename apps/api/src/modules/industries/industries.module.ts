import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { IndustryEntity } from "src/database/entities";
import { MediaModule } from "src/modules/media/media.module";

import { IndustriesController } from "./industries.controller";
import { IndustriesService } from "./industries.service";

@Module({
  imports: [TypeOrmModule.forFeature([IndustryEntity]), MediaModule],
  controllers: [IndustriesController],
  providers: [IndustriesService],
  exports: [IndustriesService],
})
export class IndustriesModule {}

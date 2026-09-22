import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  LeaderEntity,
  TeamMemberEntity,
  TestimonialEntity,
} from "src/database/entities";
import { MediaModule } from "src/modules/media/media.module";

import {
  LeadersController,
  TeamController,
  TestimonialsController,
} from "./people.controller";
import { LeadersService } from "./leaders.service";
import { TeamService } from "./team.service";
import { TestimonialsService } from "./testimonials.service";

/**
 * One module for the three people-shaped resources. They share DTO ancestry and
 * are always edited together in the panel, so splitting them into three modules
 * would be filing, not structure.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([LeaderEntity, TeamMemberEntity, TestimonialEntity]),
    MediaModule,
  ],
  controllers: [LeadersController, TeamController, TestimonialsController],
  providers: [LeadersService, TeamService, TestimonialsService],
  exports: [LeadersService, TeamService, TestimonialsService],
})
export class PeopleModule {}

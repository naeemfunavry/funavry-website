import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AuditAction,
  AuditResource,
  type AuthUser,
  type Leader,
  Permission,
  type TeamMember,
  type Testimonial,
} from "@funavry/types";

import { createCrudController } from "src/common/controllers/crud.controller";
import { Audit } from "src/common/decorators/audit.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { RequirePermissions } from "src/common/decorators/roles.decorator";

import {
  CreateLeaderDto,
  CreateTeamMemberDto,
  CreateTestimonialDto,
  UpdateLeaderDto,
  UpdateTeamMemberDto,
  UpdateTestimonialDto,
} from "./dto/people.dto";
import { LeadersService } from "./leaders.service";
import { TeamService } from "./team.service";
import { TestimonialsService } from "./testimonials.service";

/* ----------------------------------------------------------------- leaders */

const LeaderCrud = createCrudController<Leader, CreateLeaderDto, UpdateLeaderDto>({
  name: "Leadership",
  auditResource: AuditResource.LEADER,
  createDto: CreateLeaderDto,
  updateDto: UpdateLeaderDto,
  hasSlug: true,
});

/**
 * Leadership: the founder, co-founders and the C-suite.
 *
 * `create` and `update` are overridden because a leadership card carries an
 * ordered list of bullet points, which the generic write routes have no way to
 * persist.
 */
@ApiTags("Leadership")
@Controller("leaders")
export class LeadersController extends LeaderCrud {
  constructor(readonly service: LeadersService) {
    super(service);
  }

  @Public()
  @Get("public/founders")
  @ApiOperation({ summary: "Published founders and co-founders only" })
  async listFounders(): Promise<Leader[]> {
    const all = await this.service.listPublicDto();
    return all.filter((l) => l.isFounder || l.isCoFounder);
  }

  @Public()
  @Get("public/:slug")
  getPublicBySlug(@Param("slug") slug: string): Promise<Leader> {
    return this.service.getBySlugDto(slug, true);
  }

  @Post()
  @RequirePermissions(Permission.CONTENT_CREATE)
  @Audit({ action: AuditAction.CREATE, resource: AuditResource.LEADER, labelField: "name" })
  override create(
    @Body() dto: CreateLeaderDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Leader> {
    return this.service.createFull(dto, user.id);
  }

  @Patch(":id")
  @RequirePermissions(Permission.CONTENT_UPDATE)
  @Audit({ action: AuditAction.UPDATE, resource: AuditResource.LEADER, labelField: "name" })
  override update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeaderDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Leader> {
    return this.service.updateFull(id, dto, user.id);
  }
}

/* -------------------------------------------------------------------- team */

const TeamCrud = createCrudController<TeamMember, CreateTeamMemberDto, UpdateTeamMemberDto>({
  name: "Team",
  auditResource: AuditResource.TEAM_MEMBER,
  createDto: CreateTeamMemberDto,
  updateDto: UpdateTeamMemberDto,
  hasSlug: true,
});

@ApiTags("Team")
@Controller("team")
export class TeamController extends TeamCrud {
  constructor(readonly service: TeamService) {
    super(service);
  }

  @Public()
  @Get("public/:slug")
  getPublicBySlug(@Param("slug") slug: string): Promise<TeamMember> {
    return this.service.getBySlugDto(slug, true);
  }
}

/* ------------------------------------------------------------ testimonials */

const TestimonialCrud = createCrudController<
  Testimonial,
  CreateTestimonialDto,
  UpdateTestimonialDto
>({
  name: "Testimonials",
  auditResource: AuditResource.TESTIMONIAL,
  createDto: CreateTestimonialDto,
  updateDto: UpdateTestimonialDto,
});

@ApiTags("Testimonials")
@Controller("testimonials")
export class TestimonialsController extends TestimonialCrud {
  constructor(readonly service: TestimonialsService) {
    super(service);
  }

  /**
   * Approved quotes only.
   *
   * Separate from the plain public list on purpose: the site's carousel should
   * be able to ask for the ones cleared for use without having to know that
   * `pending` is the flag that decides it.
   */
  @Public()
  @Get("public/approved")
  @ApiOperation({ summary: "Published testimonials with written client approval" })
  async listApproved(@Query("limit") limit?: string): Promise<Testimonial[]> {
    const parsed = limit ? Math.min(Number(limit) || 0, 100) : undefined;
    const all = await this.service.listPublicDto(parsed);
    return all.filter((t) => !t.pending);
  }
}

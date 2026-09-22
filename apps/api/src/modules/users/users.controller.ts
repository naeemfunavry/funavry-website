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
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AuditAction,
  AuditResource,
  type AuthUser,
  type Paginated,
  Permission,
  UserRole,
} from "@funavry/types";

import { Audit } from "src/common/decorators/audit.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { RequirePermissions, RequireRoles } from "src/common/decorators/roles.decorator";

import {
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
  UserQueryDto,
} from "./dto/user.dto";
import { UsersService } from "./users.service";

/**
 * Account administration.
 *
 * Creating, deleting and resetting passwords are SUPER_ADMIN only, not merely
 * `user:manage`. Account management is privilege escalation by another name —
 * anyone who can grant a role can grant themselves one — so it sits behind the
 * role that is meant to be held by one or two people rather than behind a
 * permission that could be attached to a role by mistake.
 */
@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions(Permission.USER_READ)
  @ApiOperation({ summary: "List admin accounts" })
  findAll(@Query() query: UserQueryDto): Promise<Paginated<AuthUser>> {
    return this.users.findAll(query);
  }

  @Get(":id")
  @RequirePermissions(Permission.USER_READ)
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<AuthUser> {
    return this.users.findOne(id);
  }

  @Get(":id/sessions")
  @RequirePermissions(Permission.USER_READ)
  @ApiOperation({ summary: "A user's sessions, with origin IP and device" })
  sessions(@Param("id", ParseUUIDPipe) id: string) {
    return this.users.listSessions(id);
  }

  @Post()
  @RequireRoles(UserRole.SUPER_ADMIN)
  @Audit({ action: AuditAction.USER_CREATED, resource: AuditResource.USER, labelField: "username" })
  @ApiOperation({ summary: "Create an admin account with a handover password" })
  create(@Body() dto: CreateUserDto, @CurrentUser() actor: AuthUser): Promise<AuthUser> {
    return this.users.create(dto, actor.id);
  }

  @Patch(":id")
  @RequirePermissions(Permission.USER_MANAGE)
  @Audit({ action: AuditAction.USER_UPDATED, resource: AuditResource.USER, labelField: "username" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<AuthUser> {
    return this.users.update(id, dto, actor);
  }

  @Post(":id/reset-password")
  @RequireRoles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset a password, forcing a change and dropping sessions" })
  async resetPassword(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<{ reset: true }> {
    await this.users.resetPassword(id, dto, actor);
    return { reset: true };
  }

  @Post(":id/unlock")
  @RequirePermissions(Permission.USER_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Clear a lockout early" })
  unlock(@Param("id", ParseUUIDPipe) id: string): Promise<AuthUser> {
    return this.users.unlock(id);
  }

  @Post(":id/revoke-sessions")
  @RequirePermissions(Permission.USER_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sign a user out of every device" })
  revokeSessions(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<{ revoked: true }> {
    return this.users.revokeSessions(id, actor);
  }

  @Delete(":id")
  @RequireRoles(UserRole.SUPER_ADMIN)
  @Audit({ action: AuditAction.DELETE, resource: AuditResource.USER })
  @ApiOperation({ summary: "Soft delete an account — the audit trail still resolves it" })
  remove(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<{ id: string; deleted: true }> {
    return this.users.remove(id, actor);
  }
}

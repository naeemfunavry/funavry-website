import { Body, Controller, Delete, Get, Param, Put, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { type AuthUser, Permission, type Setting } from "@funavry/types";

import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { RequirePermissions } from "src/common/decorators/roles.decorator";

import { UpsertSettingDto } from "./dto/setting.dto";
import { SettingsService } from "./settings.service";

@ApiTags("Settings")
@Controller("settings")
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  /**
   * Public settings only.
   *
   * Scoped to the `public` group rather than serving the whole table: settings
   * is exactly the kind of key/value store where someone eventually parks an
   * API key, and an endpoint that returns everything would publish it.
   */
  @Public()
  @Get("public")
  @ApiOperation({ summary: "Settings in the 'public' group, for the site" })
  listPublic(): Promise<Setting[]> {
    return this.settings.findAll("public");
  }

  @Get()
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  findAll(@Query("group") group?: string): Promise<Setting[]> {
    return this.settings.findAll(group);
  }

  @Get(":key")
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  findByKey(@Param("key") key: string): Promise<Setting> {
    return this.settings.findByKey(key);
  }

  /** PUT, because a setting either exists at that key or is created there. */
  @Put()
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  @ApiOperation({ summary: "Create or update a setting" })
  upsert(
    @Body() dto: UpsertSettingDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Setting> {
    return this.settings.upsert(dto, user.id);
  }

  @Delete(":key")
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  remove(@Param("key") key: string): Promise<{ key: string; deleted: true }> {
    return this.settings.remove(key);
  }
}

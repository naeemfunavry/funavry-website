import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { AuthUser, AuthSession } from "@funavry/types";
import type { Request, Response } from "express";

import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { AuthThrottlerGuard } from "src/common/guards/auth-throttle.guard";
import { TokenInvalidException } from "src/common/exceptions/app.exception";
import { resolveClientIp } from "src/common/utils/client-ip";

import { AuthService, type RequestOrigin } from "./auth.service";
import { ChangePasswordDto, LoginDto } from "./dto/login.dto";
import { REFRESH_COOKIE, buildRefreshCookieOptions, clearRefreshCookie } from "./cookie.util";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private origin(req: Request): RequestOrigin {
    return {
      ip: resolveClientIp(req),
      userAgent: (req.headers["user-agent"] ?? null) as string | null,
    };
  }

  /**
   * Sign in.
   *
   * The access token goes in the body and the refresh token goes into an
   * httpOnly cookie. That split is the point: script on the page can hold the
   * access token for fifteen minutes, but an XSS payload cannot read the
   * long-lived credential, because the browser will not show it to JavaScript
   * at all.
   */
  @Public()
  @UseGuards(AuthThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Sign in and open a session" })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    const { user, tokens } = await this.auth.login(dto, this.origin(req));

    res.cookie(REFRESH_COOKIE, tokens.refreshToken, buildRefreshCookieOptions());

    return {
      user,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      tokenType: "Bearer",
    };
  }

  /** Exchanges the refresh cookie for a new pair. Rotation is enforced. */
  @Public()
  @UseGuards(AuthThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rotate the session tokens" })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    const token = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];

    if (!token) throw new TokenInvalidException("No session to refresh.");

    try {
      const { user, tokens } = await this.auth.refresh(token, this.origin(req));

      res.cookie(REFRESH_COOKIE, tokens.refreshToken, buildRefreshCookieOptions());

      return {
        user,
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
        tokenType: "Bearer",
      };
    } catch (err) {
      /* Clear the cookie on any refresh failure, so a browser holding a dead
         token stops replaying it on every page load. */
      clearRefreshCookie(res);
      throw err;
    }
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revoke the current session" })
  async logout(
    @CurrentUser() user: AuthUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ loggedOut: true }> {
    const token = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];

    if (token) {
      const result = await this.auth.refreshTokenSession(token);
      if (result) await this.auth.logout(result, user.id, this.origin(req));
    }

    clearRefreshCookie(res);

    return { loggedOut: true };
  }

  @Get("me")
  @ApiOperation({ summary: "The signed-in user, with resolved permissions" })
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }

  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Change password and revoke all other sessions" })
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ changed: true }> {
    await this.auth.changePassword(user.id, dto, this.origin(req));

    /* Every session was just revoked, including this one — the client must
       sign in again with the new password. */
    clearRefreshCookie(res);

    return { changed: true };
  }
}

import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import {
  AuditAction,
  AuditResource,
  type AuthUser,
  type Permission,
  type UserRole,
} from "@funavry/types";
import { PinoLogger } from "nestjs-pino";
import { Repository } from "typeorm";

import { authConfig } from "src/config/configuration";
import { UserEntity } from "src/database/entities";
import {
  AccountLockedException,
  InvalidCredentialsException,
  TokenInvalidException,
} from "src/common/exceptions/app.exception";
import { AuditService } from "src/modules/audit/audit.service";

import { ChangePasswordDto, LoginDto } from "./dto/login.dto";
import { PasswordService } from "./password.service";
import { TokenService, type IssuedTokens } from "./token.service";

export interface LoginResult {
  user: AuthUser;
  tokens: IssuedTokens;
}

export interface RequestOrigin {
  ip: string;
  userAgent: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /**
   * Authenticates and issues a session.
   *
   * Every failure path below raises the same InvalidCredentialsException with
   * the same message and, thanks to `fakeVerify`, in roughly the same time.
   * A login form that answers "no such user" faster than "wrong password" is a
   * user-enumeration oracle, and against a small admin user base that is most
   * of the work done for an attacker.
   */
  async login(dto: LoginDto, origin: RequestOrigin): Promise<LoginResult> {
    const identifier = dto.identifier.toLowerCase();

    const user = await this.users
      .createQueryBuilder("u")
      .addSelect("u.passwordHash")
      .leftJoinAndSelect("u.roles", "role")
      .leftJoinAndSelect("role.permissions", "permission")
      .where("LOWER(u.username) = :identifier OR LOWER(u.email) = :identifier", {
        identifier,
      })
      .getOne();

    if (!user) {
      await this.passwords.fakeVerify();
      await this.recordFailure(identifier, origin, "No such account");
      throw new InvalidCredentialsException();
    }

    /* Lockout is checked before the password so a locked account cannot be
       used as a slow oracle for whether a guess was right. */
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      await this.recordFailure(identifier, origin, "Account locked", user);
      throw new AccountLockedException(this.config.lockoutMinutes);
    }

    if (!user.isActive) {
      await this.passwords.fakeVerify();
      await this.recordFailure(identifier, origin, "Account disabled", user);
      throw new InvalidCredentialsException();
    }

    const ok = await this.passwords.verify(user.passwordHash, dto.password);

    if (!ok) {
      await this.registerFailedAttempt(user);
      await this.recordFailure(identifier, origin, "Incorrect password", user);
      throw new InvalidCredentialsException();
    }

    /* Transparent upgrade: if the stored hash predates a parameter bump, it is
       re-hashed now, while the plaintext is legitimately in hand. */
    if (this.passwords.needsRehash(user.passwordHash)) {
      user.passwordHash = await this.passwords.hash(dto.password);
      this.logger.info({ userId: user.id }, "Rehashed password with current parameters");
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = origin.ip;
    await this.users.save(user);

    const authUser = this.toAuthUser(user);
    const tokens = await this.tokens.issue(authUser, origin);

    await this.audit.recordLoginAttempt(identifier, origin.ip, origin.userAgent, true);
    await this.audit.record({
      action: AuditAction.LOGIN_SUCCESS,
      resource: AuditResource.AUTH,
      resourceId: user.id,
      resourceLabel: user.username,
      actorId: user.id,
      actorUsername: user.username,
      ipAddress: origin.ip,
      userAgent: origin.userAgent,
      success: true,
    });

    return { user: authUser, tokens };
  }

  /** Exchanges a refresh token for a new pair, detecting replay. */
  async refresh(refreshToken: string, origin: RequestOrigin): Promise<LoginResult> {
    const result = await this.tokens.validateRefreshToken(refreshToken);

    if (result.status === "invalid") {
      throw new TokenInvalidException("The session could not be refreshed.");
    }

    if (result.status === "reused") {
      /* An already-rotated token was presented. Assume capture and drop every
         session for this user — see the note on TokenService.validateRefreshToken. */
      await this.tokens.revokeAllForUser(result.row.userId);

      this.logger.warn(
        { userId: result.row.userId, sessionId: result.row.sessionId, ip: origin.ip },
        "Refresh token reuse detected — all sessions revoked",
      );

      await this.audit.record({
        action: AuditAction.TOKEN_REFRESH,
        resource: AuditResource.AUTH,
        resourceId: result.row.userId,
        ipAddress: origin.ip,
        userAgent: origin.userAgent,
        success: false,
        reason: "Refresh token reuse detected — all sessions revoked",
      });

      throw new TokenInvalidException("This session has been revoked.");
    }

    const user = await this.findAuthUserById(result.row.userId);

    if (!user || !user.isActive) {
      await this.tokens.revokeAllForUser(result.row.userId);
      throw new TokenInvalidException("This account is no longer active.");
    }

    const tokens = await this.tokens.rotate(result.row, user, origin);

    await this.audit.record({
      action: AuditAction.TOKEN_REFRESH,
      resource: AuditResource.AUTH,
      resourceId: user.id,
      resourceLabel: user.username,
      actorId: user.id,
      actorUsername: user.username,
      ipAddress: origin.ip,
      userAgent: origin.userAgent,
      success: true,
    });

    return { user, tokens };
  }

  /**
   * Resolves a presented refresh token to its session id, for logout.
   *
   * Returns null rather than throwing on an unknown token: signing out with a
   * stale cookie should clear it and succeed, not hand the caller an error for
   * doing the safe thing.
   */
  async refreshTokenSession(refreshToken: string): Promise<string | null> {
    const result = await this.tokens.validateRefreshToken(refreshToken);
    return result.status === "invalid" ? null : result.row.sessionId;
  }

  async logout(sessionId: string, userId: string, origin: RequestOrigin): Promise<void> {
    await this.tokens.revokeSession(sessionId);

    await this.audit.record({
      action: AuditAction.LOGOUT,
      resource: AuditResource.AUTH,
      resourceId: userId,
      ipAddress: origin.ip,
      userAgent: origin.userAgent,
      success: true,
    });
  }

  /**
   * Changes a password and invalidates every existing session.
   *
   * Bumping `tokenVersion` is what makes that immediate: access tokens already
   * in circulation carry the old value and the JWT strategy rejects them on
   * their next use, rather than staying valid for up to fifteen minutes after
   * the user changed their password because they thought it was compromised.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    origin: RequestOrigin,
  ): Promise<void> {
    const user = await this.users
      .createQueryBuilder("u")
      .addSelect("u.passwordHash")
      .where("u.id = :userId", { userId })
      .getOne();

    if (!user) throw new InvalidCredentialsException();

    const ok = await this.passwords.verify(user.passwordHash, dto.currentPassword);
    if (!ok) {
      await this.audit.record({
        action: AuditAction.PASSWORD_CHANGED,
        resource: AuditResource.AUTH,
        resourceId: userId,
        ipAddress: origin.ip,
        success: false,
        reason: "Current password did not match",
      });
      throw new InvalidCredentialsException();
    }

    user.passwordHash = await this.passwords.hash(dto.newPassword);
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();
    user.tokenVersion += 1;
    await this.users.save(user);

    await this.tokens.revokeAllForUser(userId);

    await this.audit.record({
      action: AuditAction.PASSWORD_CHANGED,
      resource: AuditResource.AUTH,
      resourceId: userId,
      resourceLabel: user.username,
      actorId: userId,
      actorUsername: user.username,
      ipAddress: origin.ip,
      userAgent: origin.userAgent,
      success: true,
    });
  }

  /**
   * Loads the user the JWT names, for the strategy.
   *
   * Done on every authenticated request rather than trusting the token's
   * claims. It costs a query and buys immediate revocation: disable an account
   * or change its roles and the very next request is refused, instead of the
   * change taking effect whenever the access token happens to expire.
   */
  async findAuthUserById(id: string): Promise<AuthUser | null> {
    const user = await this.users.findOne({
      where: { id },
      relations: { roles: { permissions: true }, avatar: true },
    });

    return user ? this.toAuthUser(user) : null;
  }

  async getTokenVersion(id: string): Promise<number | null> {
    const row = await this.users.findOne({ where: { id }, select: { tokenVersion: true } });
    return row?.tokenVersion ?? null;
  }

  private toAuthUser(user: UserEntity): AuthUser {
    const roles = (user.roles ?? []).map((r) => r.name as UserRole);

    /* Flattened union across roles, de-duplicated — a user holding two roles
       that share a permission should see it once. */
    const permissions = Array.from(
      new Set(
        (user.roles ?? []).flatMap((r) => (r.permissions ?? []).map((p) => p.name as Permission)),
      ),
    );

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      roles,
      permissions,
      avatarUrl: null,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  /** Counts the attempt and locks the account once the ceiling is reached. */
  private async registerFailedAttempt(user: UserEntity): Promise<void> {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= this.config.maxFailedAttempts) {
      user.lockedUntil = new Date(Date.now() + this.config.lockoutMinutes * 60_000);
      user.failedLoginAttempts = 0;

      this.logger.warn(
        { userId: user.id, username: user.username, until: user.lockedUntil },
        "Account locked after repeated failed logins",
      );

      await this.audit.record({
        action: AuditAction.ACCOUNT_LOCKED,
        resource: AuditResource.AUTH,
        resourceId: user.id,
        resourceLabel: user.username,
        success: false,
        reason: `Locked for ${this.config.lockoutMinutes} minutes`,
      });
    }

    await this.users.save(user);
  }

  private async recordFailure(
    identifier: string,
    origin: RequestOrigin,
    reason: string,
    user?: UserEntity,
  ): Promise<void> {
    await this.audit.recordLoginAttempt(identifier, origin.ip, origin.userAgent, false);

    await this.audit.record({
      action: AuditAction.LOGIN_FAILED,
      resource: AuditResource.AUTH,
      resourceId: user?.id ?? null,
      resourceLabel: identifier,
      actorId: user?.id ?? null,
      actorUsername: user?.username ?? null,
      ipAddress: origin.ip,
      userAgent: origin.userAgent,
      success: false,
      /* Recorded in the audit table, never returned to the caller — the log
         needs to distinguish these, the login form must not. */
      reason,
    });
  }
}

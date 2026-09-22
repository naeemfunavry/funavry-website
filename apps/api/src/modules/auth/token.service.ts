import { Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

/**
 * `jsonwebtoken` types `expiresIn` as a `ms` StringValue template literal, which
 * a plain configuration string cannot satisfy. The duration strings are already
 * validated at boot and parsed by `parseDuration` below, so this narrows the
 * type without loosening what actually reaches the signer.
 */
type JwtExpiry = Exclude<Parameters<JwtService["sign"]>[1], undefined>["expiresIn"];
import type { AuthUser, JwtPayload } from "@funavry/types";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { LessThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PinoLogger } from "nestjs-pino";

import { authConfig } from "src/config/configuration";
import { RefreshTokenEntity } from "src/database/entities";
import { describeDevice } from "src/common/utils/client-ip";

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number;
}

/**
 * Mints, stores and rotates tokens.
 *
 * The split is the design: a short-lived access JWT the server never stores,
 * and an opaque refresh token whose hash it does. The JWT carries the claims so
 * ordinary requests need no database round-trip, and the stored refresh row is
 * what makes revocation possible at all — you cannot un-issue a JWT.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshRepo: Repository<RefreshTokenEntity>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TokenService.name);
  }

  /**
   * SHA-256, not Argon2.
   *
   * A refresh token is 256 bits of server-generated randomness, so there is no
   * dictionary for a slow hash to defend against — the only thing a KDF would
   * add is latency on every refresh. Hashing at all is what matters: it means a
   * dump of this table is not a set of usable sessions.
   */
  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async issue(
    user: AuthUser,
    context: { ip: string | null; userAgent: string | null },
    sessionId: string = randomUUID(),
  ): Promise<IssuedTokens> {
    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        sid: sessionId,
      },
      {
        secret: this.config.accessSecret,
        expiresIn: this.config.accessExpiresIn as JwtExpiry,
        issuer: this.config.issuer,
        audience: this.config.audience,
      },
    );

    /* Opaque and random rather than a second JWT. Nothing needs to read it, so
       there is no reason to give a holder a decodable payload. */
    const refreshToken = randomBytes(48).toString("base64url");

    const expiresAt = new Date(Date.now() + this.parseDuration(this.config.refreshExpiresIn));

    await this.refreshRepo.save(
      this.refreshRepo.create({
        tokenHash: this.hashToken(refreshToken),
        sessionId,
        userId: user.id,
        expiresAt,
        ipAddress: context.ip,
        userAgent: context.userAgent?.slice(0, 512) ?? null,
        device: describeDevice(context.userAgent),
      }),
    );

    return {
      accessToken,
      refreshToken,
      sessionId,
      expiresIn: Math.floor(this.parseDuration(this.config.accessExpiresIn) / 1000),
    };
  }

  /**
   * Validates a presented refresh token.
   *
   * The reuse branch is the important one. A token that has already been
   * rotated should never be presented again by an honest client, so seeing one
   * means the value was captured — from a log, a proxy, a stolen backup. The
   * response is to revoke the entire session chain rather than just refuse this
   * request: the attacker and the legitimate user both get logged out, which is
   * the correct outcome when you cannot tell which one is calling.
   */
  async validateRefreshToken(
    token: string,
  ): Promise<
    | { status: "valid"; row: RefreshTokenEntity }
    | { status: "reused"; row: RefreshTokenEntity }
    | { status: "invalid" }
  > {
    const row = await this.refreshRepo.findOne({
      where: { tokenHash: this.hashToken(token) },
    });

    if (!row) return { status: "invalid" };

    if (row.revokedAt) return { status: "reused", row };

    if (row.expiresAt.getTime() < Date.now()) return { status: "invalid" };

    return { status: "valid", row };
  }

  /** Rotates: revokes the presented token and issues its successor. */
  async rotate(
    previous: RefreshTokenEntity,
    user: AuthUser,
    context: { ip: string | null; userAgent: string | null },
  ): Promise<IssuedTokens> {
    const next = await this.issue(user, context, previous.sessionId);

    previous.revokedAt = new Date();
    previous.replacedByTokenId = (
      await this.refreshRepo.findOne({
        where: { tokenHash: this.hashToken(next.refreshToken) },
        select: { id: true },
      })
    )?.id ?? null;

    await this.refreshRepo.save(previous);

    return next;
  }

  /** Revokes one session — a single device signing out. */
  async revokeSession(sessionId: string): Promise<void> {
    await this.refreshRepo.update(
      { sessionId, revokedAt: undefined },
      { revokedAt: new Date() },
    );
  }

  /** Revokes every session for a user — a password change, or a detected reuse. */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshRepo
      .createQueryBuilder()
      .update(RefreshTokenEntity)
      .set({ revokedAt: new Date() })
      .where("userId = :userId", { userId })
      .andWhere("revokedAt IS NULL")
      .execute();
  }

  async listSessions(userId: string): Promise<RefreshTokenEntity[]> {
    return this.refreshRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  /**
   * Drops rows that expired more than 30 days ago. Revoked-but-recent rows are
   * kept on purpose — they are what makes reuse detection work, and deleting
   * them immediately would turn a replayed token into a plain "invalid" and
   * lose the signal that something was stolen.
   */
  async pruneExpired(): Promise<number> {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.refreshRepo.delete({ expiresAt: LessThan(cutoff) });
    const count = result.affected ?? 0;
    if (count > 0) this.logger.info({ count }, "Pruned expired refresh tokens");
    return count;
  }

  /** Accepts the `15m` / `7d` forms used in configuration. */
  private parseDuration(value: string): number {
    const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(value.trim());
    if (!match) {
      const asNumber = Number(value);
      if (Number.isFinite(asNumber)) return asNumber * 1000;
      throw new Error(`Invalid duration: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return amount * (multipliers[unit as keyof typeof multipliers] ?? 1000);
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwt.verifyAsync<JwtPayload>(token, {
      secret: this.config.accessSecret,
      issuer: this.config.issuer,
      audience: this.config.audience,
    });
  }
}

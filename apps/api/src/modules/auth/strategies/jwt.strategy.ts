import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { AuthUser, JwtPayload } from "@funavry/types";
import { ExtractJwt, Strategy } from "passport-jwt";

import { authConfig } from "src/config/configuration";
import { TokenInvalidException } from "src/common/exceptions/app.exception";

import { AuthService } from "../auth.service";

/**
 * Verifies the access token and resolves it to a live user.
 *
 * `issuer` and `audience` are verified, not just the signature. Without them a
 * token minted by any other service that happens to share the secret would be
 * accepted here — the check is what scopes a token to this API and this client.
 *
 * `ignoreExpiration: false` is the default and is restated because turning it
 * off is a one-word change with no visible symptom until it matters.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    @Inject(authConfig.KEY) config: ConfigType<typeof authConfig>,
    private readonly auth: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.accessSecret,
      issuer: config.issuer,
      audience: config.audience,
      algorithms: ["HS256"],
    });
  }

  /**
   * Runs after the signature checks out.
   *
   * The database lookup here is the difference between a token being proof of
   * identity and proof of identity *right now*: a disabled account or a revoked
   * role takes effect on the next request rather than at token expiry.
   */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.auth.findAuthUserById(payload.sub);

    if (!user) throw new TokenInvalidException("The account no longer exists.");
    if (!user.isActive) throw new TokenInvalidException("This account is disabled.");

    return user;
  }
}

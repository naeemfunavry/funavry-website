import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import type { AuthUser } from "@funavry/types";
import { Observable } from "rxjs";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import {
  TokenExpiredException,
  TokenInvalidException,
} from "../exceptions/app.exception";
import { setContextUser } from "../utils/request-context";

/**
 * The global authentication gate. Registered app-wide in AppModule, so a route
 * is protected unless it carries `@Public()`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<TUser = AuthUser>(err: unknown, user: TUser, info: unknown): TUser {
    if (err) throw err;

    if (!user) {
      /* Distinguish expiry from invalidity: the panel silently refreshes on the
         first and bounces to the login screen on the second. Both are still
         401s, so this leaks nothing a token holder doesn't already know. */
      const name = (info as Error | undefined)?.name;
      if (name === "TokenExpiredError") throw new TokenExpiredException();
      throw new TokenInvalidException(
        name === "JsonWebTokenError" ? "The session token is invalid." : "Authentication required.",
      );
    }

    const authed = user as unknown as AuthUser;
    /* Hand the actor to the request context so audit rows written deep in a
       service know who is acting without being passed the request. */
    setContextUser(authed.id, authed.username);

    return user;
  }
}

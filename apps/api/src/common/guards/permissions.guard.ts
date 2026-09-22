import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { type AuthUser, Permission, UserRole } from "@funavry/types";
import type { Request } from "express";

import { PERMISSIONS_KEY, ROLES_KEY } from "../decorators/roles.decorator";
import {
  InsufficientPermissionException,
  TokenInvalidException,
} from "../exceptions/app.exception";

/**
 * Authorization, evaluated after the JWT guard has established identity.
 *
 * Permissions are read off the user the strategy loaded from the database on
 * this request, not off a claim in the token. That costs a lookup per request
 * and buys revocation: demote someone and their next call is refused, rather
 * than at whatever point their 15-minute access token happens to expire.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    /* Nothing declared: the JWT guard's decision stands. */
    if (!requiredRoles?.length && !requiredPermissions?.length) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = request.user;

    if (!user) throw new TokenInvalidException("Authentication required.");

    /* SUPER_ADMIN bypasses the permission matrix by design — it is the role that
       must always be able to repair a misconfigured one. */
    if (user.roles.includes(UserRole.SUPER_ADMIN)) return true;

    if (requiredRoles?.length) {
      const ok = requiredRoles.some((r) => user.roles.includes(r));
      if (!ok) throw new InsufficientPermissionException(requiredRoles.join(" or "));
    }

    if (requiredPermissions?.length) {
      /* Every listed permission, not any — a route that both updates and
         publishes needs both, and `some` would let an EDITOR through. */
      const missing = requiredPermissions.filter((p) => !user.permissions.includes(p));
      if (missing.length) throw new InsufficientPermissionException(missing.join(", "));
    }

    return true;
  }
}

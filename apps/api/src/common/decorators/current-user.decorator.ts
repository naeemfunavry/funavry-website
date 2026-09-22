import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import type { AuthUser } from "@funavry/types";
import type { Request } from "express";

/**
 * Injects the authenticated user the JWT strategy put on the request, so
 * controllers never reach into `req.user` and cast it by hand.
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = request.user;
    if (!user) return undefined;
    return field ? user[field] : user;
  },
);

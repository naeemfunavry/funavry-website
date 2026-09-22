import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Marks a route as reachable without a token.
 *
 * The JWT guard is registered globally, so authentication is the default and
 * every public route has to say so explicitly. That ordering matters: forgetting
 * this decorator makes a route inaccessible, which someone notices immediately,
 * whereas an opt-in scheme fails the other way — forget to add the guard and the
 * route is silently wide open.
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

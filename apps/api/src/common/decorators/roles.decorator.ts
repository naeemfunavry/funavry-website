import { SetMetadata } from "@nestjs/common";
import { Permission, UserRole } from "@funavry/types";

export const ROLES_KEY = "roles";
export const PERMISSIONS_KEY = "permissions";

/** Restricts a route to the listed roles. Satisfied by holding any one of them. */
export const RequireRoles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);

/**
 * Restricts a route to holders of every listed permission.
 *
 * Preferred over `@RequireRoles` for content routes: it says what the endpoint
 * does rather than who is currently allowed to, so adding a role later is a
 * change to the seed data instead of a sweep through the controllers.
 */
export const RequirePermissions = (
  ...permissions: Permission[]
): MethodDecorator & ClassDecorator => SetMetadata(PERMISSIONS_KEY, permissions);

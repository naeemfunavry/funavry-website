import { Permission, UserRole } from "@funavry/types";
import type { DataSource } from "typeorm";

import { PermissionEntity, RoleEntity, UserEntity } from "../entities";

/**
 * The role → permission matrix.
 *
 * SUPER_ADMIN is absent deliberately: the permissions guard short-circuits for
 * it, because it is the role that must always be able to repair a
 * misconfigured matrix. Listing its permissions here would create a second
 * place for that to go wrong.
 *
 * The EDITOR row is where the draft/publish split earns its keep — an editor
 * can write and revise anything but cannot put it on funavry.com, and cannot
 * delete.
 */
const ROLE_MATRIX: Record<Exclude<UserRole, UserRole.SUPER_ADMIN>, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_DELETE,
    Permission.USER_READ,
    Permission.AUDIT_READ,
    Permission.SETTINGS_MANAGE,
  ],
  [UserRole.EDITOR]: [
    Permission.CONTENT_READ,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.MEDIA_UPLOAD,
  ],
};

const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [Permission.CONTENT_READ]: "View all content, including drafts",
  [Permission.CONTENT_CREATE]: "Create new content",
  [Permission.CONTENT_UPDATE]: "Edit existing content",
  [Permission.CONTENT_DELETE]: "Delete and restore content",
  [Permission.CONTENT_PUBLISH]: "Publish content to the live site",
  [Permission.MEDIA_UPLOAD]: "Upload images to the media library",
  [Permission.MEDIA_DELETE]: "Delete media assets",
  [Permission.USER_READ]: "View admin accounts",
  [Permission.USER_MANAGE]: "Edit admin accounts and their roles",
  [Permission.AUDIT_READ]: "Read the audit trail",
  [Permission.SETTINGS_MANAGE]: "Change site settings",
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Unrestricted access, including account administration",
  [UserRole.ADMIN]: "Full content, media and settings management",
  [UserRole.EDITOR]: "Create and edit content, but cannot publish or delete",
};

/**
 * Seeds roles and permissions.
 *
 * Idempotent — safe to re-run on every deploy, which is what keeps the matrix
 * in code rather than in whatever state a database happens to have drifted to.
 * Role assignments are replaced rather than merged so removing a permission
 * here actually removes it, instead of accumulating grants forever.
 */
export async function seedRbac(dataSource: DataSource): Promise<void> {
  const permissionRepo = dataSource.getRepository(PermissionEntity);
  const roleRepo = dataSource.getRepository(RoleEntity);

  const permissions = new Map<Permission, PermissionEntity>();

  for (const name of Object.values(Permission)) {
    let permission = await permissionRepo.findOne({ where: { name } });

    if (!permission) {
      permission = await permissionRepo.save(
        permissionRepo.create({ name, description: PERMISSION_DESCRIPTIONS[name] }),
      );
    } else if (permission.description !== PERMISSION_DESCRIPTIONS[name]) {
      permission.description = PERMISSION_DESCRIPTIONS[name];
      permission = await permissionRepo.save(permission);
    }

    permissions.set(name, permission);
  }

  for (const name of Object.values(UserRole)) {
    let role = await roleRepo.findOne({
      where: { name },
      relations: { permissions: true },
    });

    if (!role) {
      role = roleRepo.create({ name, description: ROLE_DESCRIPTIONS[name], permissions: [] });
    }

    role.description = ROLE_DESCRIPTIONS[name];

    role.permissions =
      name === UserRole.SUPER_ADMIN
        ? /* Given every permission so the UI can render its capabilities
             honestly; the guard never actually consults them. */
          Array.from(permissions.values())
        : (ROLE_MATRIX[name as Exclude<UserRole, UserRole.SUPER_ADMIN>] ?? [])
            .map((p) => permissions.get(p))
            .filter((p): p is PermissionEntity => Boolean(p));

    await roleRepo.save(role);
  }
}

/**
 * Seeds the master administrator.
 *
 * Created once and never overwritten: re-running the seed must not silently
 * reset a password that has since been rotated, which would hand back access
 * to whoever knows the original.
 *
 * `mustChangePassword` is set, so the panel forces a rotation on first sign-in.
 * The configured password is a handover credential, not a permanent one.
 */
export async function seedMasterAdmin(
  dataSource: DataSource,
  credentials: { username: string; email: string; password: string },
  hash: (plain: string) => Promise<string>,
): Promise<{ created: boolean; username: string }> {
  const userRepo = dataSource.getRepository(UserEntity);
  const roleRepo = dataSource.getRepository(RoleEntity);

  const existing = await userRepo.findOne({
    where: [{ username: credentials.username }, { email: credentials.email }],
  });

  if (existing) return { created: false, username: existing.username };

  const superAdmin = await roleRepo.findOne({
    where: { name: UserRole.SUPER_ADMIN },
    relations: { permissions: true },
  });

  if (!superAdmin) {
    throw new Error("SUPER_ADMIN role is missing — run seedRbac before seedMasterAdmin.");
  }

  const user = userRepo.create({
    username: credentials.username,
    email: credentials.email,
    fullName: "Master Administrator",
    passwordHash: await hash(credentials.password),
    roles: [superAdmin],
    isActive: true,
    mustChangePassword: true,
  });

  await userRepo.save(user);

  return { created: true, username: user.username };
}

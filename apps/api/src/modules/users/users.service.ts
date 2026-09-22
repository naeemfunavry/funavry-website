import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  AuditAction,
  AuditResource,
  type AuthUser,
  type Paginated,
  type Permission,
  UserRole,
} from "@funavry/types";
import { In, Repository } from "typeorm";

import {
  ConflictException,
  InsufficientPermissionException,
  ResourceNotFoundException,
  ValidationException,
} from "src/common/exceptions/app.exception";
import { buildDiff } from "src/common/utils/redact";
import { RoleEntity, UserEntity } from "src/database/entities";
import { AuditService } from "src/modules/audit/audit.service";
import { PasswordService } from "src/modules/auth/password.service";
import { TokenService } from "src/modules/auth/token.service";

import {
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
  UserQueryDto,
} from "./dto/user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: UserQueryDto): Promise<Paginated<AuthUser>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.users
      .createQueryBuilder("u")
      .leftJoinAndSelect("u.roles", "role")
      .leftJoinAndSelect("role.permissions", "permission");

    if (query.includeDeleted) qb.withDeleted();
    if (query.isActive !== undefined) {
      qb.andWhere("u.isActive = :isActive", { isActive: query.isActive });
    }
    if (query.role) qb.andWhere("role.name = :role", { role: query.role });

    if (query.q) {
      const term = `%${query.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
      qb.andWhere("(u.username LIKE :term OR u.email LIKE :term OR u.fullName LIKE :term)", {
        term,
      });
    }

    const [items, total] = await qb
      .orderBy("u.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items: items.map((u) => this.toDto(u)),
      pageInfo: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<AuthUser> {
    const found = await this.users.findOne({
      where: { id },
      relations: { roles: { permissions: true } },
    });

    if (!found) throw new ResourceNotFoundException("User", id);

    return this.toDto(found);
  }

  async create(dto: CreateUserDto, actorId: string): Promise<AuthUser> {
    const clash = await this.users
      .createQueryBuilder("u")
      .withDeleted()
      .where("u.username = :username OR u.email = :email", {
        username: dto.username,
        email: dto.email,
      })
      .getCount();

    if (clash > 0) {
      throw new ConflictException("That username or email address is already in use.");
    }

    const roles = await this.resolveRoles(dto.roles);

    const user = this.users.create({
      username: dto.username,
      email: dto.email,
      fullName: dto.fullName,
      passwordHash: await this.passwords.hash(dto.password),
      roles,
      isActive: dto.isActive ?? true,
      /* Always set on creation: the password was chosen by whoever created the
         account, so it is a handover credential and the owner must replace it. */
      mustChangePassword: true,
    });

    const saved = await this.users.save(user);

    await this.audit.record({
      action: AuditAction.USER_CREATED,
      resource: AuditResource.USER,
      resourceId: saved.id,
      resourceLabel: saved.username,
      actorId,
      changes: { roles: { from: null, to: dto.roles } },
      success: true,
    });

    return this.findOne(saved.id);
  }

  /**
   * Updates an account.
   *
   * Two self-inflicted-damage guards, both about the acting user: you cannot
   * disable your own account, and you cannot drop your own SUPER_ADMIN role.
   * Either would lock the operator out mid-session, and the second can leave an
   * installation with no super admin at all and no way to appoint one.
   */
  async update(id: string, dto: UpdateUserDto, actor: AuthUser): Promise<AuthUser> {
    const user = await this.users.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!user) throw new ResourceNotFoundException("User", id);

    if (id === actor.id && dto.isActive === false) {
      throw new ValidationException([
        { field: "isActive", message: "You cannot disable your own account.", code: "self" },
      ]);
    }

    if (
      id === actor.id &&
      dto.roles &&
      actor.roles.includes(UserRole.SUPER_ADMIN) &&
      !dto.roles.includes(UserRole.SUPER_ADMIN)
    ) {
      throw new ValidationException([
        {
          field: "roles",
          message: "You cannot remove your own super-admin role.",
          code: "self",
        },
      ]);
    }

    if (dto.email && dto.email !== user.email) {
      const clash = await this.users
        .createQueryBuilder("u")
        .withDeleted()
        .where("u.email = :email AND u.id != :id", { email: dto.email, id })
        .getCount();

      if (clash > 0) throw new ConflictException("That email address is already in use.");
    }

    const before = {
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      roles: user.roles?.map((r) => r.name).join(","),
    };

    if (dto.email !== undefined) user.email = dto.email;
    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.avatarId !== undefined) user.avatarId = dto.avatarId;
    if (dto.roles !== undefined) user.roles = await this.resolveRoles(dto.roles);

    const saved = await this.users.save(user);

    /* Disabling an account must take effect now, not when its access token
       happens to expire — so every session is dropped with it. */
    if (dto.isActive === false) {
      await this.tokens.revokeAllForUser(id);
      user.tokenVersion += 1;
      await this.users.save(user);
    }

    const after = {
      email: saved.email,
      fullName: saved.fullName,
      isActive: saved.isActive,
      roles: dto.roles?.join(",") ?? before.roles,
    };

    await this.audit.record({
      action: dto.isActive === false ? AuditAction.USER_DISABLED : AuditAction.USER_UPDATED,
      resource: AuditResource.USER,
      resourceId: id,
      resourceLabel: saved.username,
      changes: buildDiff(before, after),
      success: true,
    });

    return this.findOne(id);
  }

  /**
   * Administrative password reset.
   *
   * Forces a rotation on next sign-in and kills every existing session — an
   * admin-set password is a handover credential, and leaving the old sessions
   * alive would mean a reset performed *because* an account was compromised
   * changed nothing for the attacker already holding a session.
   */
  async resetPassword(id: string, dto: ResetPasswordDto, actor: AuthUser): Promise<void> {
    const user = await this.users.findOne({ where: { id } });

    if (!user) throw new ResourceNotFoundException("User", id);

    user.passwordHash = await this.passwords.hash(dto.newPassword);
    user.mustChangePassword = true;
    user.passwordChangedAt = new Date();
    user.tokenVersion += 1;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    await this.users.save(user);
    await this.tokens.revokeAllForUser(id);

    await this.audit.record({
      action: AuditAction.PASSWORD_CHANGED,
      resource: AuditResource.USER,
      resourceId: id,
      resourceLabel: user.username,
      actorId: actor.id,
      actorUsername: actor.username,
      reason: "Administrative reset",
      success: true,
    });
  }

  /** Clears a lockout early, for the case of a user locked out by mistake. */
  async unlock(id: string): Promise<AuthUser> {
    const user = await this.users.findOne({ where: { id } });

    if (!user) throw new ResourceNotFoundException("User", id);

    user.lockedUntil = null;
    user.failedLoginAttempts = 0;
    await this.users.save(user);

    return this.findOne(id);
  }

  /**
   * Soft-deletes an account.
   *
   * Never hard — the audit log points at this row, and removing it would leave
   * a history whose actor cannot be resolved. Refuses to remove the last
   * super admin, which would leave the installation unadministrable.
   */
  async remove(id: string, actor: AuthUser): Promise<{ id: string; deleted: true }> {
    if (id === actor.id) {
      throw new ValidationException([
        { field: "id", message: "You cannot delete your own account.", code: "self" },
      ]);
    }

    const user = await this.users.findOne({ where: { id }, relations: { roles: true } });

    if (!user) throw new ResourceNotFoundException("User", id);

    const isSuperAdmin = user.roles?.some((r) => r.name === UserRole.SUPER_ADMIN);

    if (isSuperAdmin) {
      const remaining = await this.users
        .createQueryBuilder("u")
        .innerJoin("u.roles", "role")
        .where("role.name = :role", { role: UserRole.SUPER_ADMIN })
        .andWhere("u.id != :id", { id })
        .andWhere("u.isActive = true")
        .getCount();

      if (remaining === 0) {
        throw new ConflictException(
          "This is the last active super admin. Appoint another before removing this one.",
        );
      }
    }

    await this.tokens.revokeAllForUser(id);
    await this.users.softRemove(user);

    await this.audit.record({
      action: AuditAction.DELETE,
      resource: AuditResource.USER,
      resourceId: id,
      resourceLabel: user.username,
      success: true,
    });

    return { id, deleted: true };
  }

  /** Lists a user's sessions, so a specific device can be signed out. */
  async listSessions(id: string): Promise<
    { id: string; sessionId: string; ip: string | null; device: string | null; createdAt: string; revokedAt: string | null }[]
  > {
    const rows = await this.tokens.listSessions(id);

    return rows.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      ip: r.ipAddress,
      device: r.device,
      createdAt: r.createdAt.toISOString(),
      revokedAt: r.revokedAt?.toISOString() ?? null,
    }));
  }

  async revokeSessions(id: string, actor: AuthUser): Promise<{ revoked: true }> {
    if (!actor.roles.includes(UserRole.SUPER_ADMIN) && actor.id !== id) {
      throw new InsufficientPermissionException("user:manage");
    }

    await this.tokens.revokeAllForUser(id);

    await this.audit.record({
      action: AuditAction.LOGOUT,
      resource: AuditResource.USER,
      resourceId: id,
      reason: "All sessions revoked",
      success: true,
    });

    return { revoked: true };
  }

  private async resolveRoles(names: UserRole[]): Promise<RoleEntity[]> {
    const found = await this.roles.find({
      where: { name: In(names) },
      relations: { permissions: true },
    });

    if (found.length !== names.length) {
      throw new ValidationException([
        { field: "roles", message: "One or more roles do not exist.", code: "exists" },
      ]);
    }

    return found;
  }

  /** Entity → DTO. The password hash is `select: false`, so it is never here. */
  private toDto(user: UserEntity): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      roles: (user.roles ?? []).map((r) => r.name),
      permissions: Array.from(
        new Set(
          (user.roles ?? []).flatMap((r) =>
            (r.permissions ?? []).map((p) => p.name as Permission),
          ),
        ),
      ),
      avatarUrl: null,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

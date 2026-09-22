import { UserRole, Permission } from "@funavry/types";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";

import { BaseEntity } from "./base.entity";
import { MediaAssetEntity } from "./media-asset.entity";
import { RefreshTokenEntity } from "./refresh-token.entity";

@Entity("roles")
export class RoleEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "enum", enum: UserRole })
  name: UserRole;

  @Column({ type: "varchar", length: 255 })
  description: string;

  @ManyToMany(() => PermissionEntity, (p) => p.roles, { cascade: false })
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "role_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permission_id", referencedColumnName: "id" },
  })
  permissions: PermissionEntity[];

  @ManyToMany(() => UserEntity, (u) => u.roles)
  users: UserEntity[];
}

@Entity("permissions")
export class PermissionEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 64 })
  name: Permission;

  @Column({ type: "varchar", length: 255 })
  description: string;

  @ManyToMany(() => RoleEntity, (r) => r.permissions)
  roles: RoleEntity[];
}

/**
 * An admin account.
 *
 * Roles are a join table rather than a column so a user can hold more than one,
 * and permissions hang off roles rather than off users — which keeps "what can
 * an EDITOR do" answerable in one place instead of being re-derived per account.
 */
@Entity("users")
@Index("idx_users_active", ["isActive"])
export class UserEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 64 })
  username: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 160 })
  fullName: string;

  /**
   * Argon2id. Chosen over bcrypt because it is memory-hard — bcrypt's cost is
   * CPU-only, which modern GPU and ASIC cracking rigs parallelise cheaply.
   *
   * `select: false` keeps the column out of every ordinary find, so a hash
   * cannot reach a response by someone returning a user entity directly. The
   * one place that needs it asks for it explicitly with `addSelect`.
   */
  @Column({ type: "varchar", length: 255, select: false })
  passwordHash: string;

  /**
   * Bumped whenever the password changes or every session is revoked. Tokens
   * carry the value they were minted with, so a mismatch invalidates access
   * tokens immediately rather than leaving them live until they expire.
   */
  @Column({ type: "int", default: 0 })
  tokenVersion: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  /** True on the seeded master account until its password is rotated. */
  @Column({ type: "boolean", default: false })
  mustChangePassword: boolean;

  /* ------------------------------------------------------------- lockout */

  @Column({ type: "int", default: 0 })
  failedLoginAttempts: number;

  /** Set when the attempt ceiling is hit; logins refuse until it passes. */
  @Column({ type: "datetime", precision: 6, nullable: true })
  lockedUntil: Date | null;

  @Column({ type: "datetime", precision: 6, nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  lastLoginIp: string | null;

  @Column({ type: "datetime", precision: 6, nullable: true })
  passwordChangedAt: Date | null;

  /* ------------------------------------------------------- relationships */

  @Column({ type: "char", length: 36, nullable: true })
  avatarId: string | null;

  @ManyToOne(() => MediaAssetEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "avatarId" })
  avatar: MediaAssetEntity | null;

  @ManyToMany(() => RoleEntity, (r) => r.users, { eager: true })
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "role_id", referencedColumnName: "id" },
  })
  roles: RoleEntity[];

  @OneToMany(() => RefreshTokenEntity, (t) => t.user)
  refreshTokens: RefreshTokenEntity[];
}

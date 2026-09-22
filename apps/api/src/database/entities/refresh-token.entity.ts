import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";

/**
 * One issued refresh token, stored so sessions can be revoked.
 *
 * Only a SHA-256 of the token is kept. A refresh token is a bearer credential,
 * so a dump of this table with the raw values would be a dump of live sessions;
 * hashing means the database alone cannot impersonate anyone. Plain SHA-256 is
 * the right primitive here rather than Argon2 — the input is 256 bits of
 * server-generated entropy, so there is no dictionary to slow down, and the
 * check happens on every refresh.
 *
 * `replacedByTokenId` implements rotation detection: each refresh issues a new
 * token and marks the old one replaced. If a token that has already been
 * replaced is presented, it was captured — the whole chain is revoked and the
 * event is audited.
 */
@Entity("refresh_tokens")
@Index("idx_refresh_user_active", ["userId", "revokedAt"])
export class RefreshTokenEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: "char", length: 64 })
  tokenHash: string;

  /** Groups the rotation chain for one device, and is the JWT's `sid`. */
  @Index()
  @Column({ type: "char", length: 36 })
  sessionId: string;

  @Index()
  @Column({ type: "char", length: 36 })
  userId: string;

  @ManyToOne(() => UserEntity, (u) => u.refreshTokens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Column({ type: "datetime", precision: 6 })
  expiresAt: Date;

  @Column({ type: "datetime", precision: 6, nullable: true })
  revokedAt: Date | null;

  @Column({ type: "char", length: 36, nullable: true })
  replacedByTokenId: string | null;

  /** Recorded so the panel can show "signed in from" per session. */
  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  userAgent: string | null;

  @Column({ type: "varchar", length: 128, nullable: true })
  device: string | null;
}

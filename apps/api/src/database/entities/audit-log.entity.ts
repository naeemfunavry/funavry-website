import { AuditAction, AuditResource } from "@funavry/types";
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/**
 * The audit trail: who did what, from where, and what changed.
 *
 * Deliberately append-only and standalone. It does NOT extend BaseEntity —
 * there is no `deletedAt`, because a soft-deletable audit log is not an audit
 * log, and no `updatedAt`, because a row that can be amended proves nothing.
 *
 * Actor and resource labels are snapshotted as text rather than joined. A
 * foreign key would either block deleting the user it points at or cascade the
 * history away with them, and renaming a case study would silently rewrite what
 * the log says happened. The text columns keep the record true to the moment.
 */
@Entity("audit_logs")
@Index("idx_audit_actor_time", ["actorId", "createdAt"])
@Index("idx_audit_resource", ["resource", "resourceId"])
@Index("idx_audit_action_time", ["action", "createdAt"])
@Index("idx_audit_ip_time", ["ipAddress", "createdAt"])
export class AuditLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: AuditAction })
  action: AuditAction;

  @Column({ type: "enum", enum: AuditResource })
  resource: AuditResource;

  @Column({ type: "char", length: 36, nullable: true })
  resourceId: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  resourceLabel: string | null;

  /* --------------------------------------------------------------- actor */

  @Column({ type: "char", length: 36, nullable: true })
  actorId: string | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  actorUsername: string | null;

  /* -------------------------------------------------------------- origin */

  /** 45 chars holds a full IPv6 address. */
  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  userAgent: string | null;

  @Column({ type: "varchar", length: 128, nullable: true })
  device: string | null;

  @Column({ type: "char", length: 2, nullable: true })
  country: string | null;

  /* ------------------------------------------------------------- request */

  @Index()
  @Column({ type: "char", length: 64, nullable: true })
  requestId: string | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  method: string | null;

  @Column({ type: "varchar", length: 512, nullable: true })
  path: string | null;

  @Column({ type: "int", unsigned: true, nullable: true })
  statusCode: number | null;

  @Column({ type: "int", unsigned: true, nullable: true })
  durationMs: number | null;

  /* ------------------------------------------------------------- outcome */

  /**
   * Field-level diff, `{ field: { from, to } }`, passed through the redactor
   * first — a password or token key is replaced with a marker, never stored.
   */
  @Column({ type: "json", nullable: true })
  changes: Record<string, { from: unknown; to: unknown }> | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  reason: string | null;

  @Column({ type: "boolean", default: true })
  success: boolean;

  @Index()
  @CreateDateColumn({ type: "datetime", precision: 6 })
  createdAt: Date;
}

/**
 * Login attempts, separate from the audit log so the lockout check is a narrow
 * indexed count over a small table rather than a scan of everything that has
 * ever happened.
 */
@Entity("login_attempts")
@Index("idx_login_identifier_time", ["identifier", "createdAt"])
@Index("idx_login_ip_time", ["ipAddress", "createdAt"])
export class LoginAttemptEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Lower-cased username or email as submitted. */
  @Column({ type: "varchar", length: 255 })
  identifier: string;

  @Column({ type: "varchar", length: 45 })
  ipAddress: string;

  @Column({ type: "varchar", length: 512, nullable: true })
  userAgent: string | null;

  @Column({ type: "boolean" })
  success: boolean;

  @CreateDateColumn({ type: "datetime", precision: 6 })
  createdAt: Date;
}

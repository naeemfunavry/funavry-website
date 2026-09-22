import type { AuditAction, AuditResource } from "../enums";

/**
 * One line of the audit trail.
 *
 * Written for every authentication event and every write, with the actor, the
 * origin of the request, and a redacted before/after diff. `changes` never
 * contains a password, a token or any other secret — the redactor strips those
 * keys before the row is composed.
 */
export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  /** Primary key of the affected row; null for login attempts. */
  resourceId: string | null;
  /** Human label of the affected row at the time, e.g. the case study title. */
  resourceLabel: string | null;

  /** Null when the actor was unauthenticated, e.g. a failed login. */
  actorId: string | null;
  /** Snapshotted so the log still reads correctly if the user is later renamed. */
  actorUsername: string | null;

  /** Client IP, taken from the trusted proxy chain. */
  ipAddress: string | null;
  userAgent: string | null;
  /** Coarse device/browser read off the user agent, for skim-reading the log. */
  device: string | null;
  /** ISO country, when a geo lookup is configured. */
  country: string | null;

  /** Correlates the line with the request's logs. */
  requestId: string | null;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  /** Server-side handling time, milliseconds. */
  durationMs: number | null;

  /** Redacted field-level diff. Null for reads and login events. */
  changes: Record<string, { from: unknown; to: unknown }> | null;
  /** Why a LOGIN_FAILED failed, in non-enumerating terms. */
  reason: string | null;
  success: boolean;
  createdAt: string;
}

/** A login attempt, kept separately so lockout can be evaluated cheaply. */
export interface LoginAttempt {
  id: string;
  identifier: string;
  ipAddress: string;
  userAgent: string | null;
  success: boolean;
  createdAt: string;
}

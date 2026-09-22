import type { AuditLogEntry } from "@funavry/types";

import type { AuditLogEntity } from "src/database/entities";

/**
 * Entity → response DTO.
 *
 * Mapping explicitly rather than returning the entity is what keeps the wire
 * shape a decision instead of an accident: add a column and nothing leaks until
 * someone adds it here on purpose.
 */
export function toAuditLogEntry(e: AuditLogEntity): AuditLogEntry {
  return {
    id: e.id,
    action: e.action,
    resource: e.resource,
    resourceId: e.resourceId,
    resourceLabel: e.resourceLabel,
    actorId: e.actorId,
    actorUsername: e.actorUsername,
    ipAddress: e.ipAddress,
    userAgent: e.userAgent,
    device: e.device,
    country: e.country,
    requestId: e.requestId,
    method: e.method,
    path: e.path,
    statusCode: e.statusCode,
    durationMs: e.durationMs,
    changes: e.changes,
    reason: e.reason,
    success: e.success,
    createdAt: e.createdAt.toISOString(),
  };
}

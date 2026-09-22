import { SetMetadata } from "@nestjs/common";
import { AuditAction, AuditResource } from "@funavry/types";

export const AUDIT_KEY = "audit";

export interface AuditMetadata {
  action: AuditAction;
  resource: AuditResource;
  /**
   * Which field of the response to record as the row's human label, so the log
   * reads "Deleted case study 'QFS'" rather than a bare UUID.
   */
  labelField?: string;
}

/**
 * Marks a handler for the audit trail. The interceptor reads this and writes a
 * row after the handler resolves — including when it throws, so a failed
 * destructive attempt is recorded rather than vanishing.
 */
export const Audit = (meta: AuditMetadata): MethodDecorator => SetMetadata(AUDIT_KEY, meta);

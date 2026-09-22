import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request, Response } from "express";
import { Observable, tap } from "rxjs";

import { AuditService } from "src/modules/audit/audit.service";

import { AUDIT_KEY, type AuditMetadata } from "../decorators/audit.decorator";

/**
 * Writes an audit row when a handler carrying `@Audit(...)` FAILS.
 *
 * Failures only, and that division is the point. Successful writes are recorded
 * by the services themselves, which have the before/after snapshot and can
 * attach a real field-level diff; a row written from out here would duplicate
 * that one with strictly less information. What the services cannot record is a
 * request that never reached them — a payload rejected by validation, a delete
 * refused by the permissions guard — and those are exactly the events worth
 * keeping when someone is probing what they are allowed to touch.
 *
 * So: the service owns "what changed", this owns "what was attempted and
 * refused".
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditMetadata | undefined>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!meta) return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    /* Captured before the handler runs — a delete handler may well have removed
       the row this id came from by the time we write the row. */
    const paramId =
      (request.params?.id as string | undefined) ??
      (request.params?.slug as string | undefined) ??
      null;

    return next.handle().pipe(
      tap({
        error: (err: unknown) => {
          void this.audit.record({
            action: meta.action,
            resource: meta.resource,
            resourceId: paramId,
            statusCode:
              typeof (err as { status?: number })?.status === "number"
                ? (err as { status: number }).status
                : 500,
            success: false,
            reason: (err as Error)?.message ?? "Unknown error",
          });
        },
      }),
    );
  }
}

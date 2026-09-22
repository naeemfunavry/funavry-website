import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  AuditAction,
  AuditResource,
  type Paginated,
} from "@funavry/types";
import { PinoLogger } from "nestjs-pino";
import { Repository } from "typeorm";

import { AuditLogEntity, LoginAttemptEntity } from "src/database/entities";
import { describeDevice } from "src/common/utils/client-ip";
import { getRequestContext } from "src/common/utils/request-context";
import { redactDeep } from "src/common/utils/redact";

import { AuditQueryDto } from "./dto/audit-query.dto";

export interface AuditInput {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string | null;
  resourceLabel?: string | null;
  changes?: Record<string, { from: unknown; to: unknown }> | null;
  reason?: string | null;
  success?: boolean;
  statusCode?: number | null;
  /** Overrides, for events raised outside a request (the seed runner). */
  actorId?: string | null;
  actorUsername?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Writes the audit trail.
 *
 * Actor, IP, user agent and correlation id come from the request context rather
 * than from arguments, so a service deep in a call stack can record what it did
 * without being handed the request.
 *
 * Every write is fire-and-forget with its own error handling. That is
 * deliberate: an audit row is evidence, not part of the transaction, and a
 * failure to write one must not roll back a case study the editor already saw
 * succeed. The failure is logged loudly instead — a silently broken audit trail
 * is worse than a noisy one.
 */
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
    @InjectRepository(LoginAttemptEntity)
    private readonly attemptRepo: Repository<LoginAttemptEntity>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuditService.name);
  }

  async record(input: AuditInput): Promise<void> {
    const ctx = getRequestContext();

    const ipAddress = input.ipAddress ?? ctx?.ip ?? null;
    const userAgent = input.userAgent ?? ctx?.userAgent ?? null;

    const entry = this.auditRepo.create({
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId ?? null,
      resourceLabel: input.resourceLabel?.slice(0, 255) ?? null,

      actorId: input.actorId ?? ctx?.userId ?? null,
      actorUsername: input.actorUsername ?? ctx?.username ?? null,

      ipAddress,
      userAgent: userAgent?.slice(0, 512) ?? null,
      device: describeDevice(userAgent),
      country: null,

      requestId: ctx?.requestId ?? null,
      method: ctx?.method ?? null,
      path: ctx?.path?.slice(0, 512) ?? null,
      statusCode: input.statusCode ?? null,
      durationMs: ctx ? Date.now() - ctx.startedAt : null,

      /* Second pass of redaction. The diff builder already skips secret-bearing
         fields, but this row is durable and a missed key would be permanent. */
      changes: input.changes ? (redactDeep(input.changes) as typeof input.changes) : null,
      reason: input.reason?.slice(0, 255) ?? null,
      success: input.success ?? true,
    });

    try {
      await this.auditRepo.save(entry);
    } catch (err) {
      this.logger.error(
        { err, action: input.action, resource: input.resource, requestId: ctx?.requestId },
        "Failed to write audit log entry",
      );
    }
  }

  /**
   * Records a login attempt. Written for successes and failures alike — a
   * trail that only holds failures cannot answer "was this address ever
   * successful", which is the question that matters after a breach.
   */
  async recordLoginAttempt(
    identifier: string,
    ipAddress: string,
    userAgent: string | null,
    success: boolean,
  ): Promise<void> {
    try {
      await this.attemptRepo.save(
        this.attemptRepo.create({
          identifier: identifier.toLowerCase().slice(0, 255),
          ipAddress,
          userAgent: userAgent?.slice(0, 512) ?? null,
          success,
        }),
      );
    } catch (err) {
      this.logger.error({ err, identifier }, "Failed to write login attempt");
    }
  }

  /** Recent failures for an identifier, used by the lockout check. */
  async countRecentFailures(identifier: string, since: Date): Promise<number> {
    return this.attemptRepo
      .createQueryBuilder("a")
      .where("a.identifier = :identifier", { identifier: identifier.toLowerCase() })
      .andWhere("a.success = false")
      .andWhere("a.createdAt > :since", { since })
      .getCount();
  }

  async findAll(query: AuditQueryDto): Promise<Paginated<AuditLogEntity>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.auditRepo.createQueryBuilder("a");

    if (query.action) qb.andWhere("a.action = :action", { action: query.action });
    if (query.resource) qb.andWhere("a.resource = :resource", { resource: query.resource });
    if (query.actorId) qb.andWhere("a.actorId = :actorId", { actorId: query.actorId });
    if (query.resourceId) {
      qb.andWhere("a.resourceId = :resourceId", { resourceId: query.resourceId });
    }
    if (query.ipAddress) qb.andWhere("a.ipAddress = :ip", { ip: query.ipAddress });
    if (query.success !== undefined) {
      qb.andWhere("a.success = :success", { success: query.success });
    }
    if (query.from) qb.andWhere("a.createdAt >= :from", { from: query.from });
    if (query.to) qb.andWhere("a.createdAt <= :to", { to: query.to });

    const [items, total] = await qb
      .orderBy("a.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
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
}

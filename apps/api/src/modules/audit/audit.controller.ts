import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { type AuditLogEntry, type Paginated, Permission } from "@funavry/types";

import { RequirePermissions } from "src/common/decorators/roles.decorator";

import { AuditQueryDto } from "./dto/audit-query.dto";
import { toAuditLogEntry } from "./audit.mapper";
import { AuditService } from "./audit.service";

/**
 * Read-only by design. There is no endpoint that edits or deletes an audit row,
 * because a trail that can be amended by the people it records is not evidence.
 * Retention is a database-level job, not an API one.
 */
@ApiTags("Audit")
@Controller("audit")
@RequirePermissions(Permission.AUDIT_READ)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: "List audit log entries, newest first" })
  async findAll(@Query() query: AuditQueryDto): Promise<Paginated<AuditLogEntry>> {
    const result = await this.audit.findAll(query);
    return { items: result.items.map(toAuditLogEntry), pageInfo: result.pageInfo };
  }
}

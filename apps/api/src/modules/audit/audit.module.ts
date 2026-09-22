import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuditLogEntity, LoginAttemptEntity } from "src/database/entities";

import { AuditController } from "./audit.controller";
import { AuditService } from "./audit.service";

/**
 * Global so any module can record an action without importing this one — the
 * alternative is every content module listing AuditModule in its imports, which
 * is the kind of boilerplate that eventually gets skipped on the module where
 * it mattered most.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity, LoginAttemptEntity])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}

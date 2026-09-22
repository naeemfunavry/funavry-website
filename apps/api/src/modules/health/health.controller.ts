import { Controller, Get, UseFilters } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from "@nestjs/terminus";

import { Public } from "src/common/decorators/public.decorator";
import { RawResponse } from "src/common/decorators/raw-response.decorator";

import { HealthExceptionFilter } from "./health-exception.filter";

/**
 * Liveness and readiness.
 *
 * `@RawResponse` because load balancers and orchestrators parse Terminus' own
 * shape; wrapping it in the API envelope would make the probe unreadable to
 * everything that expects the standard format.
 *
 * Deliberately shallow: it reports that dependencies respond, and nothing about
 * versions, hostnames or configuration. A health endpoint is usually the one
 * route left open to the internet, and it is a standard reconnaissance target.
 */
@ApiTags("Health")
@Controller("health")
@UseFilters(HealthExceptionFilter)
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Public()
  @RawResponse()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Liveness and dependency check" })
  check() {
    return this.health.check([
      () => this.db.pingCheck("database", { timeout: 3000 }),
      /* Uploads live on the same volume, so a full disk is a failed write
         waiting to happen rather than a problem discovered later.

         0.95 rather than 0.9: this has to be a threshold that means "act now",
         and a developer machine sitting at 90% would otherwise report the API
         as unhealthy permanently, which trains everyone to ignore it. */
      () => this.disk.checkStorage("storage", { path: "/", thresholdPercent: 0.95 }),
      () => this.memory.checkHeap("memory_heap", 512 * 1024 * 1024),
    ]);
  }
}

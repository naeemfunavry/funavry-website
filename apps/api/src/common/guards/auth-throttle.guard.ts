import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";

import { resolveClientIp } from "../utils/client-ip";

/**
 * Rate limiting for the credential endpoints.
 *
 * Keyed on IP *and* submitted identifier rather than IP alone. Keying on IP
 * only lets one attacker behind a NAT lock out an office; keying on the
 * identifier only lets a botnet spread an attack across addresses. Combining
 * them throttles the actual thing being attacked — attempts against one
 * account — while leaving other users on the same address alone.
 */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const ip = resolveClientIp(req);
    const body = req.body as { identifier?: unknown } | undefined;
    const identifier =
      typeof body?.identifier === "string" ? body.identifier.toLowerCase().slice(0, 128) : "";

    return `${ip}|${identifier}`;
  }
}

import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

import { runWithRequestContext } from "../utils/request-context";
import { resolveClientIp } from "../utils/client-ip";

/**
 * Opens the per-request context and assigns the correlation id.
 *
 * Runs before the guards, so every log line, audit row and error envelope for
 * this request shares one id. An inbound `x-request-id` is honoured so a trace
 * survives a hop from the admin panel, but it is length-capped and stripped of
 * anything but url-safe characters first: it ends up in log files and in a
 * response header, and an unbounded client-controlled string in either is a
 * log-injection and header-splitting vector.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const inbound = req.headers["x-request-id"];
    const candidate = Array.isArray(inbound) ? inbound[0] : inbound;

    const requestId =
      candidate && /^[\w-]{8,64}$/.test(candidate) ? candidate : randomUUID();

    res.setHeader("x-request-id", requestId);

    runWithRequestContext(
      {
        requestId,
        ip: resolveClientIp(req),
        userAgent: (req.headers["user-agent"] ?? null) as string | null,
        userId: null,
        username: null,
        method: req.method,
        path: req.originalUrl ?? req.url,
        startedAt: Date.now(),
      },
      () => next(),
    );
  }
}

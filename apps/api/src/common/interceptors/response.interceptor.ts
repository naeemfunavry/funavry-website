import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { ApiSuccess } from "@funavry/types";
import type { Request, Response } from "express";
import { Observable, map } from "rxjs";

import { RAW_RESPONSE_KEY } from "../decorators/raw-response.decorator";
import { getRequestId } from "../utils/request-context";

/**
 * Wraps every successful handler return in the shared envelope.
 *
 * Controllers return plain data — a DTO, an array, a Paginated<T> — and this is
 * what turns it into `{ success, data, meta }`. Doing it here rather than in
 * each controller means the contract cannot drift one endpoint at a time, and
 * it pairs with the exception filter so success and failure are structurally
 * identical.
 *
 * Handlers marked `@RawResponse()` are passed through untouched, for the two
 * cases an envelope would break: file streams and the health probe, which
 * infrastructure expects in Terminus' own shape.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccess<T> | T> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccess<T> | T> {
    const isRaw = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isRaw) return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const requestId =
      getRequestId() ?? (request.headers["x-request-id"] as string) ?? "unknown";

    /* Echoed so a client can quote it in a bug report without parsing the body. */
    response.setHeader("x-request-id", requestId);

    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          path: request.originalUrl ?? request.url,
          requestId,
        },
      })),
    );
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { ApiErrorCode, type ApiFailure, type ApiFieldError } from "@funavry/types";
import type { Request, Response } from "express";
import { PinoLogger } from "nestjs-pino";
import { QueryFailedError, EntityNotFoundError } from "typeorm";

import { AppException } from "../exceptions/app.exception";
import { getRequestId } from "../utils/request-context";

/** MySQL driver errors we can map to a meaningful client-facing code. */
interface DriverError {
  code?: string;
  errno?: number;
  sqlMessage?: string;
}

/**
 * The single exit point for every failure in the application.
 *
 * Two jobs, and the second is the one that matters. First, it makes failures
 * look exactly like successes structurally — same envelope, same meta — so a
 * client never has to guess which shape it got. Second, it is the boundary
 * where internal detail stops: a QueryFailedError carries the failing SQL and
 * often the parameter values, and letting that reach a browser hands an
 * attacker the schema. Below, the driver error is logged in full and the client
 * is told only which of a handful of situations it hit.
 */
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message, fields, logLevel } = this.resolve(exception);

    const requestId = getRequestId() ?? (request.headers["x-request-id"] as string) ?? "unknown";

    const body: ApiFailure = {
      success: false,
      error: { code, message, ...(fields ? { fields } : {}) },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.originalUrl ?? request.url,
        requestId,
      },
    };

    /* The full exception goes to the log, never to the client. A 5xx carries
       the stack; a 4xx is an expected outcome and only needs a line. */
    const logPayload = {
      requestId,
      statusCode: status,
      errorCode: code,
      method: request.method,
      path: request.originalUrl ?? request.url,
      ip: request.ip,
      userId: (request as Request & { user?: { id?: string } }).user?.id ?? null,
      err: exception instanceof Error ? exception : { message: String(exception) },
    };

    if (logLevel === "error") {
      this.logger.error(logPayload, `Unhandled failure: ${message}`);
    } else {
      this.logger.warn(logPayload, `Request failed: ${message}`);
    }

    if (response.headersSent) {
      /* Something already started writing — usually a stream. Destroying is
         the only honest option; appending an envelope would corrupt it. */
      response.destroy();
      return;
    }

    response.status(status).json(body);
  }

  private resolve(exception: unknown): {
    status: number;
    code: ApiErrorCode;
    message: string;
    fields?: ApiFieldError[];
    logLevel: "warn" | "error";
  } {
    /* Our own exceptions already carry a code — they pass through intact. */
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        fields: exception.fields,
        logLevel: exception.getStatus() >= 500 ? "error" : "warn",
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      /* ValidationPipe throws with an object whose `message` is a string[].
         Those were already shaped into field errors by the pipe's factory, so
         anything arriving here as a bare array is a framework-level throw. */
      let message = exception.message;
      let fields: ApiFieldError[] | undefined;

      if (typeof res === "object" && res !== null) {
        const r = res as { message?: unknown; fields?: ApiFieldError[] };
        if (Array.isArray(r.fields)) fields = r.fields;
        if (typeof r.message === "string") message = r.message;
        else if (Array.isArray(r.message)) message = r.message.join("; ");
      }

      return {
        status,
        code: this.codeForStatus(status),
        message,
        fields,
        logLevel: status >= 500 ? "error" : "warn",
      };
    }

    if (exception instanceof EntityNotFoundError) {
      return {
        status: HttpStatus.NOT_FOUND,
        code: ApiErrorCode.NOT_FOUND,
        message: "The requested resource does not exist.",
        logLevel: "warn",
      };
    }

    if (exception instanceof QueryFailedError) {
      const driver = exception.driverError as DriverError;

      /* Duplicate key is the one driver error worth distinguishing: it is a
         client mistake (a slug already taken), not a server fault. The column
         name is NOT echoed — it would leak schema. */
      if (driver?.code === "ER_DUP_ENTRY" || driver?.errno === 1062) {
        return {
          status: HttpStatus.CONFLICT,
          code: ApiErrorCode.CONFLICT,
          message: "A record with these details already exists.",
          logLevel: "warn",
        };
      }

      if (driver?.code === "ER_NO_REFERENCED_ROW_2" || driver?.errno === 1452) {
        return {
          status: HttpStatus.BAD_REQUEST,
          code: ApiErrorCode.VALIDATION_FAILED,
          message: "A referenced record does not exist.",
          logLevel: "warn",
        };
      }

      if (driver?.code === "ER_ROW_IS_REFERENCED_2" || driver?.errno === 1451) {
        return {
          status: HttpStatus.CONFLICT,
          code: ApiErrorCode.CONFLICT,
          message: "This record is still referenced by other content.",
          logLevel: "warn",
        };
      }

      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ApiErrorCode.DATABASE_ERROR,
        message: "A database error occurred.",
        logLevel: "error",
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ApiErrorCode.INTERNAL_ERROR,
      message: "An unexpected error occurred.",
      logLevel: "error",
    };
  }

  private codeForStatus(status: number): ApiErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ApiErrorCode.VALIDATION_FAILED;
      case HttpStatus.UNAUTHORIZED:
        return ApiErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ApiErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ApiErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ApiErrorCode.CONFLICT;
      case HttpStatus.PAYLOAD_TOO_LARGE:
        return ApiErrorCode.PAYLOAD_TOO_LARGE;
      case HttpStatus.UNSUPPORTED_MEDIA_TYPE:
        return ApiErrorCode.UNSUPPORTED_MEDIA_TYPE;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ApiErrorCode.RATE_LIMITED;
      default:
        return status >= 500 ? ApiErrorCode.INTERNAL_ERROR : ApiErrorCode.VALIDATION_FAILED;
    }
  }
}

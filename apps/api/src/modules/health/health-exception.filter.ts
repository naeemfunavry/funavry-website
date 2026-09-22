import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ServiceUnavailableException,
} from "@nestjs/common";
import type { Response } from "express";

/**
 * Lets a failing health check keep its own response body.
 *
 * Terminus signals failure by throwing a ServiceUnavailableException whose
 * response *is* the check result — which check failed, and why. The global
 * filter would catch that and replace it with the API's generic envelope,
 * leaving a probe with a 503 and the word "Service Unavailable Exception":
 * technically accurate, and useless at three in the morning.
 *
 * Scoped to this controller only. Everywhere else, hiding internal detail is
 * exactly what the global filter is for.
 */
@Catch(ServiceUnavailableException)
export class HealthExceptionFilter implements ExceptionFilter {
  catch(exception: ServiceUnavailableException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(exception.getStatus()).json(exception.getResponse());
  }
}

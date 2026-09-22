import {
  CallHandler,
  ExecutionContext,
  GatewayTimeoutException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, TimeoutError, throwError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";

/**
 * Caps how long a request may occupy a connection.
 *
 * Without this a query that never returns — a lock wait, a wedged upstream —
 * holds its socket indefinitely, and enough of them exhaust the pool. Failing
 * at 30s turns that into one bad request instead of an outage.
 */
/**
 * A constant rather than a constructor argument: Nest resolves constructor
 * parameters through the injector, and a defaulted primitive has no provider
 * token, so taking it as an argument makes the interceptor un-instantiable.
 */
const REQUEST_TIMEOUT_MS = 30_000;

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) =>
        err instanceof TimeoutError
          ? throwError(() => new GatewayTimeoutException("The request took too long."))
          : throwError(() => err),
      ),
    );
  }
}

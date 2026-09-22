import { HttpException, HttpStatus } from "@nestjs/common";
import { ApiErrorCode, type ApiFieldError } from "@funavry/types";

/**
 * The base for every deliberate failure the application raises.
 *
 * Carrying the `ApiErrorCode` on the exception is what lets the global filter
 * emit a precise machine-readable code without pattern-matching on prose. The
 * subclasses below exist so a service reads as `throw new NotFoundException(...)`
 * rather than assembling status codes at the call site.
 */
export class AppException extends HttpException {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    status: HttpStatus,
    readonly fields?: ApiFieldError[],
  ) {
    super({ code, message, fields }, status);
  }
}

export class ResourceNotFoundException extends AppException {
  constructor(resource: string, identifier?: string) {
    super(
      ApiErrorCode.NOT_FOUND,
      identifier ? `${resource} '${identifier}' was not found.` : `${resource} was not found.`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ValidationException extends AppException {
  constructor(fields: ApiFieldError[], message = "The submitted data is invalid.") {
    super(ApiErrorCode.VALIDATION_FAILED, message, HttpStatus.BAD_REQUEST, fields);
  }
}

export class SlugTakenException extends AppException {
  constructor(slug: string) {
    super(
      ApiErrorCode.SLUG_TAKEN,
      `The slug '${slug}' is already in use.`,
      HttpStatus.CONFLICT,
      [{ field: "slug", message: "This slug is already in use.", code: "unique" }],
    );
  }
}

/**
 * Deliberately vague. Distinguishing "no such user" from "wrong password" turns
 * the login form into a user-enumeration oracle, so both paths raise this.
 */
export class InvalidCredentialsException extends AppException {
  constructor() {
    super(
      ApiErrorCode.INVALID_CREDENTIALS,
      "Invalid credentials.",
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AccountLockedException extends AppException {
  constructor(minutes: number) {
    super(
      ApiErrorCode.ACCOUNT_LOCKED,
      `Too many failed attempts. This account is locked for ${minutes} minutes.`,
      HttpStatus.FORBIDDEN,
    );
  }
}

export class TokenInvalidException extends AppException {
  constructor(message = "The session token is invalid.") {
    super(ApiErrorCode.TOKEN_INVALID, message, HttpStatus.UNAUTHORIZED);
  }
}

export class TokenExpiredException extends AppException {
  constructor() {
    super(ApiErrorCode.TOKEN_EXPIRED, "The session has expired.", HttpStatus.UNAUTHORIZED);
  }
}

export class InsufficientPermissionException extends AppException {
  constructor(required: string) {
    super(
      ApiErrorCode.FORBIDDEN,
      `This action requires the '${required}' permission.`,
      HttpStatus.FORBIDDEN,
    );
  }
}

export class UnsupportedMediaException extends AppException {
  constructor(message: string) {
    super(ApiErrorCode.UNSUPPORTED_MEDIA_TYPE, message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }
}

export class PayloadTooLargeException extends AppException {
  constructor(maxBytes: number) {
    super(
      ApiErrorCode.PAYLOAD_TOO_LARGE,
      `The file exceeds the ${Math.round(maxBytes / 1024 / 1024)}MB limit.`,
      HttpStatus.PAYLOAD_TOO_LARGE,
    );
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super(ApiErrorCode.CONFLICT, message, HttpStatus.CONFLICT);
  }
}

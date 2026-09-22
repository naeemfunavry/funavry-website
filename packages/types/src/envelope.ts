/**
 * The single response envelope every API route returns — success and failure
 * alike. Declared here rather than in the API so the admin panel and the web
 * app compile against the exact shape the server promises, and a change to the
 * contract breaks the consumers at build time instead of at runtime.
 *
 * The discriminant is `success`. Narrowing on it gives you `data` or `error`
 * but never both, which is what stops a caller reading `data` off a failure.
 */

/** Machine-readable failure codes. The UI switches on these, never on prose. */
export enum ApiErrorCode {
  /* 4xx */
  VALIDATION_FAILED = "VALIDATION_FAILED",
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  SLUG_TAKEN = "SLUG_TAKEN",
  PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
  UNSUPPORTED_MEDIA_TYPE = "UNSUPPORTED_MEDIA_TYPE",
  RATE_LIMITED = "RATE_LIMITED",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  /* 5xx */
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  UPSTREAM_ERROR = "UPSTREAM_ERROR",
}

/**
 * One field-level validation failure. `field` is the dotted path into the
 * submitted body (`seo.title`, `sections.2.heading`) so the admin form can
 * attach the message to the input that caused it.
 */
export interface ApiFieldError {
  field: string;
  message: string;
  /** The failed constraint, e.g. `isNotEmpty`, `maxLength`. */
  code?: string;
}

export interface ApiErrorBody {
  code: ApiErrorCode;
  /** Human-readable, safe to show. Never contains a stack or a SQL fragment. */
  message: string;
  /** Present only for VALIDATION_FAILED. */
  fields?: ApiFieldError[];
}

export interface ApiMeta {
  /** ISO-8601, server clock. */
  timestamp: string;
  /** The request path, echoed so a logged envelope is self-describing. */
  path: string;
  /**
   * Correlation id, also returned as the `x-request-id` header and written to
   * every log line for this request. Quote it in a bug report and the whole
   * request is recoverable from the logs.
   */
  requestId: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiFailure {
  success: false;
  error: ApiErrorBody;
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Narrowing helper, so callers don't hand-write the discriminant check. */
export function isApiSuccess<T>(res: ApiResponse<T>): res is ApiSuccess<T> {
  return res.success === true;
}

/* ------------------------------------------------------------------ paging */

export interface PageInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** List endpoints return this as their `data`, so paging survives the envelope. */
export interface Paginated<T> {
  items: T[];
  pageInfo: PageInfo;
}

export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

"use client";

import {
  type ApiResponse,
  ApiErrorCode,
  type ApiFieldError,
  type AuthSession,
  type Paginated,
} from "@funavry/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api/v1";

/**
 * A failed API call, carrying the server's machine-readable code and any
 * field-level errors so a form can attach each message to the input that
 * produced it.
 */
export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly status: number,
    readonly fields?: ApiFieldError[],
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Field errors as a map, ready to hand to react-hook-form. */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries((this.fields ?? []).map((f) => [f.field, f.message]));
  }
}

/**
 * The access token, held in memory only.
 *
 * Not in localStorage, and that is the whole point. A token in localStorage is
 * readable by any script that ends up on the page, so a single XSS turns into a
 * stolen session. In a module-scoped variable it dies with the tab, and the
 * httpOnly refresh cookie — which script cannot read at all — is what restores
 * the session on reload.
 */
let accessToken: string | null = null;

/** Set when the panel signs in or refreshes; cleared on sign-out. */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * De-duplicates concurrent refreshes.
 *
 * Several queries can 401 at once when a token expires. Without this each would
 * start its own refresh, and because refresh tokens rotate, the second would
 * present a token the first had already replaced — which the server correctly
 * treats as a replay and responds to by revoking every session. Sharing one
 * in-flight promise is what keeps a token expiry from logging the user out.
 */
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
      });

      if (!response.ok) {
        accessToken = null;
        return false;
      }

      const body = (await response.json()) as ApiResponse<AuthSession>;

      if (!body.success) {
        accessToken = null;
        return false;
      }

      accessToken = body.data.accessToken;
      return true;
    } catch {
      accessToken = null;
      return false;
    } finally {
      /* Cleared in a microtask so callers awaiting this promise all observe the
         same result before a new refresh can start. */
      queueMicrotask(() => {
        refreshInFlight = null;
      });
    }
  })();

  return refreshInFlight;
}

/** Called when a refresh fails — the app redirects to the login screen. */
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Appended as a query string; undefined and null values are dropped. */
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** Skips the automatic refresh-and-retry — used by the refresh call itself. */
  skipRetry?: boolean;
}

/**
 * The single entry point for talking to the API.
 *
 * Unwraps the response envelope so callers deal in data, and turns a failure
 * envelope into a typed ApiError rather than leaving every call site to check
 * `success` for itself.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`);

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {};

  /* FormData sets its own multipart boundary; setting content-type by hand
     would omit it and the server would fail to parse the upload. */
  if (!isFormData && options.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  if (accessToken) headers.authorization = `Bearer ${accessToken}`;

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    /* Sends the httpOnly refresh cookie. */
    credentials: "include",
    body: isFormData
      ? (options.body as FormData)
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
    signal: options.signal,
  });

  /* A 401 on an authenticated call usually means the 15-minute access token
     expired mid-session. Refresh once and replay, so the user never sees it. */
  if (response.status === 401 && !options.skipRetry) {
    const refreshed = await refreshSession();

    if (refreshed) {
      return apiFetch<T>(path, { ...options, skipRetry: true });
    }

    onSessionExpired?.();
  }

  const requestId = response.headers.get("x-request-id") ?? undefined;

  let body: ApiResponse<T>;

  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      `The server returned an unreadable response (${response.status}).`,
      response.status,
      undefined,
      requestId,
    );
  }

  if (!body.success) {
    throw new ApiError(
      body.error.code,
      body.error.message,
      response.status,
      body.error.fields,
      body.meta?.requestId ?? requestId,
    );
  }

  return body.data;
}

/* ------------------------------------------------------------ convenience */

export const api = {
  get: <T>(path: string, query?: RequestOptions["query"]) =>
    apiFetch<T>(path, { method: "GET", query }),

  list: <T>(path: string, query?: RequestOptions["query"]) =>
    apiFetch<Paginated<T>>(path, { method: "GET", query }),

  post: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "POST", body }),

  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PATCH", body }),

  put: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PUT", body }),

  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),

  upload: <T>(path: string, form: FormData) => apiFetch<T>(path, { method: "POST", body: form }),
};

export { API_URL, refreshSession };

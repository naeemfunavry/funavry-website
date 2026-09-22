import type { CookieOptions, Response } from "express";

export const REFRESH_COOKIE = "funavry_rt";

/**
 * The refresh cookie's flags. Each one closes a specific attack:
 *
 * `httpOnly` — script cannot read it, so an XSS payload cannot exfiltrate the
 * long-lived credential.
 *
 * `secure` — never sent over plain HTTP, so it cannot be captured in transit.
 * Off in development because localhost is not HTTPS; the env validator refuses
 * to boot a production build with it off.
 *
 * `sameSite: strict` — not sent on cross-site requests at all, which is what
 * makes CSRF against the refresh endpoint impossible rather than merely
 * inconvenient. `lax` would still send it on a top-level navigation.
 *
 * `path` — scoped to the auth routes, so it is not attached to every API call
 * that has no use for it.
 */
export function buildRefreshCookieOptions(): CookieOptions {
  const secure = process.env.COOKIE_SECURE === "true";

  return {
    httpOnly: true,
    secure,
    sameSite: "strict",
    domain: process.env.COOKIE_DOMAIN ?? "localhost",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    signed: false,
  };
}

export function clearRefreshCookie(res: Response): void {
  /* Cleared with the same flags it was set with — a mismatch on domain, path
     or sameSite leaves the original cookie in place. */
  const { maxAge: _maxAge, ...options } = buildRefreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE, options);
}

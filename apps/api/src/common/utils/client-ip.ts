import type { Request } from "express";

/**
 * The client's IP, as recorded in the audit log and keyed on for rate limiting.
 *
 * `req.ip` is the value to use, not a hand-parse of X-Forwarded-For: Express
 * resolves it against the configured `trust proxy` hop count, so a client that
 * sends its own X-Forwarded-For cannot prepend a fake address and have it
 * believed. Parsing the header directly is the common mistake, and it makes
 * both the rate limiter and the audit trail trivially spoofable.
 *
 * The IPv4-mapped IPv6 prefix is stripped so `::ffff:203.0.113.4` and
 * `203.0.113.4` are one address in the log rather than two.
 */
export function resolveClientIp(req: Request): string {
  const ip = req.ip ?? req.socket?.remoteAddress ?? "unknown";
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

/**
 * A coarse device label for skim-reading the audit log. Deliberately crude —
 * this is a hint in a UI column, not analytics, and full UA parsing would pull
 * in a dependency that needs constant updating to stay accurate.
 */
export function describeDevice(userAgent: string | null): string | null {
  if (!userAgent) return null;

  const ua = userAgent.toLowerCase();

  const os = ua.includes("windows")
    ? "Windows"
    : ua.includes("android")
      ? "Android"
      : ua.includes("iphone") || ua.includes("ipad")
        ? "iOS"
        : ua.includes("mac os")
          ? "macOS"
          : ua.includes("linux")
            ? "Linux"
            : "Unknown OS";

  const browser = ua.includes("edg/")
    ? "Edge"
    : ua.includes("chrome/") && !ua.includes("chromium")
      ? "Chrome"
      : ua.includes("firefox/")
        ? "Firefox"
        : ua.includes("safari/") && !ua.includes("chrome")
          ? "Safari"
          : ua.includes("curl")
            ? "curl"
            : "Unknown browser";

  return `${browser} · ${os}`;
}

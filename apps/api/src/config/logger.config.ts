import type { Params } from "nestjs-pino";
import { randomUUID } from "node:crypto";

/**
 * Structured logging.
 *
 * Two things here are security controls rather than ergonomics.
 *
 * `redact` strips credentials before a line is written. Request logging is the
 * classic way a password ends up in a log file nobody thought was sensitive —
 * an Authorization header or a login body lands in plaintext, and the log then
 * needs the same handling as the password database. The paths below cover every
 * route a secret is known to travel.
 *
 * `serializers` narrow what a request and response contribute. Pino's defaults
 * log every header, which reinstates exactly what redact removed as soon as a
 * new secret-bearing header appears.
 */
export function buildLoggerConfig(opts: {
  level: string;
  dir: string;
  toFile: boolean;
  isProduction: boolean;
  apiPrefix: string;
}): Params {
  /* pino's TransportTargetOptions, kept loose because each target's options
     differ by transport and pino validates them at runtime anyway. */
  const targets: { target: string; level: string; options: Record<string, unknown> }[] = [];

  if (opts.isProduction) {
    targets.push({
      target: "pino/file",
      level: opts.level,
      options: { destination: 1 },
    });
  } else {
    targets.push({
      target: "pino-pretty",
      level: opts.level,
      options: {
        colorize: true,
        singleLine: false,
        translateTime: "SYS:HH:MM:ss.l",
        ignore: "pid,hostname",
        messageFormat: "{req.method} {req.url} — {msg}",
      },
    });
  }

  if (opts.toFile) {
    /* Rolled daily and capped, so a noisy week cannot fill the disk the
       database is also sitting on. */
    targets.push({
      target: "pino-roll",
      level: opts.level,
      options: {
        file: `${opts.dir}/api.log`,
        frequency: "daily",
        size: "20m",
        limit: { count: 30 },
        mkdir: true,
        dateFormat: "yyyy-MM-dd",
      },
    });

    /* Failures also go to their own file — when something breaks at 2am you
       want the errors without grepping a gigabyte of request lines. */
    targets.push({
      target: "pino-roll",
      level: "error",
      options: {
        file: `${opts.dir}/error.log`,
        frequency: "daily",
        size: "20m",
        limit: { count: 90 },
        mkdir: true,
        dateFormat: "yyyy-MM-dd",
      },
    });
  }

  return {
    pinoHttp: {
      level: opts.level,

      transport: { targets },

      genReqId: (req, res) => {
        const existing = req.headers["x-request-id"];
        const candidate = Array.isArray(existing) ? existing[0] : existing;
        const id = candidate && /^[\w-]{8,64}$/.test(candidate) ? candidate : randomUUID();
        res.setHeader("x-request-id", id);
        return id;
      },

      /**
       * Anything matching these paths is replaced before serialisation. The
       * wildcards cover header casing, which Node lower-cases but proxies do
       * not always normalise on the way in.
       */
      redact: {
        paths: [
          "req.headers.authorization",
          "req.headers.cookie",
          "req.headers['x-api-key']",
          "req.headers['x-revalidate-secret']",
          "res.headers['set-cookie']",
          "req.body.password",
          "req.body.newPassword",
          "req.body.currentPassword",
          "req.body.passwordHash",
          "req.body.token",
          "req.body.refreshToken",
          "req.body.accessToken",
          "*.password",
          "*.passwordHash",
          "*.refreshToken",
          "*.accessToken",
          "*.tokenHash",
          "*.secret",
        ],
        censor: "[REDACTED]",
      },

      serializers: {
        req(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url,
            /* Only the headers worth having. Logging them all is how a new
               secret-bearing header quietly starts being written to disk. */
            userAgent: req.headers["user-agent"],
            referer: req.headers.referer,
            ip: req.remoteAddress,
          };
        },
        res(res) {
          return { statusCode: res.statusCode };
        },
      },

      customLogLevel(_req, res, err) {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },

      customSuccessMessage(_req, res) {
        return `${res.statusCode}`;
      },

      /* Health checks and static uploads would otherwise dominate the log. */
      autoLogging: {
        ignore: (req) => {
          const url = req.url ?? "";
          return (
            url.startsWith("/health") ||
            url.startsWith("/uploads") ||
            url === "/favicon.ico"
          );
        },
      },
    },
  };
}

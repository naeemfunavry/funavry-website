import { plainToInstance, Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from "class-validator";

export enum NodeEnv {
  DEVELOPMENT = "development",
  TEST = "test",
  PRODUCTION = "production",
}

/**
 * Every environment variable the API reads, validated once at boot.
 *
 * The point of failing here is that a missing or weak secret becomes a startup
 * crash with a precise message rather than a security hole that only shows up
 * under traffic — a JWT secret silently defaulting to "secret" is the classic
 * version of that bug. Nothing in this class has a default that would be unsafe
 * in production.
 */
const toBool = ({ value }: { value: unknown }): boolean =>
  value === true || value === "true" || value === "1";

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.DEVELOPMENT;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  /** Mounted under this prefix, e.g. /api/v1/case-studies. */
  @IsString()
  API_PREFIX: string = "api/v1";

  /* ------------------------------------------------------------- database */

  @IsString()
  DB_HOST: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number = 3306;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  /**
   * Never true. Schema changes go through migrations so a rename cannot become
   * a silent column drop on boot — TypeORM's synchronize is a data-loss switch.
   */
  @Transform(toBool)
  @IsBoolean()
  DB_SYNCHRONIZE: boolean = false;

  @Transform(toBool)
  @IsBoolean()
  DB_LOGGING: boolean = false;

  @Transform(toBool)
  @IsBoolean()
  DB_SSL: boolean = false;

  /* ----------------------------------------------------------------- auth */

  /**
   * Separate secrets for the two token types: a leaked access secret must not
   * also mint refresh tokens. 32 chars is the floor, not a recommendation —
   * generate with `openssl rand -base64 48`.
   */
  @IsString()
  @MinLength(32, {
    message: "JWT_ACCESS_SECRET must be at least 32 characters",
  })
  JWT_ACCESS_SECRET: string;

  @IsString()
  @MinLength(32, {
    message: "JWT_REFRESH_SECRET must be at least 32 characters",
  })
  JWT_REFRESH_SECRET: string;

  /** Short by design — revocation is the refresh token's job. */
  @IsString()
  JWT_ACCESS_EXPIRES_IN: string = "15m";

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = "7d";

  @IsString()
  JWT_ISSUER: string = "funavry-api";

  @IsString()
  JWT_AUDIENCE: string = "funavry-admin";

  /** Failed logins before the account locks. */
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(20)
  AUTH_MAX_FAILED_ATTEMPTS: number = 5;

  /** Minutes an account stays locked after exhausting its attempts. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  AUTH_LOCKOUT_MINUTES: number = 15;

  /* ------------------------------------------------------- seeded account */

  @IsString()
  SEED_ADMIN_USERNAME: string = "admin";

  @IsString()
  SEED_ADMIN_EMAIL: string = "admin@funavry.com";

  /**
   * The master password. Seeded once, hashed with Argon2id, and flagged
   * `mustChangePassword` so the panel forces a rotation on first sign-in.
   */
  @IsString()
  @MinLength(8)
  SEED_ADMIN_PASSWORD: string;

  /* --------------------------------------------------------------- CORS */

  /** Comma-separated exact origins. No wildcard — credentials are in play. */
  @IsString()
  CORS_ORIGINS: string;

  /* ------------------------------------------------------------ cookies */

  @IsString()
  COOKIE_DOMAIN: string = "localhost";

  @Transform(toBool)
  @IsBoolean()
  COOKIE_SECURE: boolean = false;

  @IsString()
  @MinLength(32)
  COOKIE_SECRET: string;

  /* -------------------------------------------------------- revalidation */

  /** Where the public Next site lives, for on-demand revalidation. */
  @IsString()
  WEB_APP_URL: string = "http://localhost:3000";

  /** Shared secret the web app checks before honouring a revalidate hook. */
  @IsString()
  @MinLength(16)
  REVALIDATE_SECRET: string;

  /* -------------------------------------------------------------- uploads */

  @IsString()
  STORAGE_DRIVER: string = "LOCAL";

  @IsString()
  UPLOAD_DIR: string = "uploads";

  /** Origin that serves uploaded files back. */
  @IsString()
  UPLOAD_PUBLIC_URL: string = "http://localhost:4000/uploads";

  @Type(() => Number)
  @IsInt()
  @Min(1024)
  UPLOAD_MAX_BYTES: number = 10 * 1024 * 1024;

  /* --- S3, unused while STORAGE_DRIVER is LOCAL; validated only if set --- */

  @IsOptional()
  @IsString()
  S3_BUCKET?: string;

  @IsOptional()
  @IsString()
  S3_REGION?: string;

  @IsOptional()
  @IsString()
  S3_ACCESS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  S3_SECRET_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  S3_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  S3_PUBLIC_URL?: string;

  /* -------------------------------------------------------------- logging */

  @IsString()
  LOG_LEVEL: string = "info";

  @IsString()
  LOG_DIR: string = "logs";

  @Transform(toBool)
  @IsBoolean()
  LOG_TO_FILE: boolean = true;

  /* ------------------------------------------------------------ throttle */

  @Type(() => Number)
  @IsInt()
  @Min(1)
  THROTTLE_TTL_SECONDS: number = 60;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  THROTTLE_LIMIT: number = 120;

  /** Tighter bucket for /auth/login, evaluated per IP + identifier. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  THROTTLE_AUTH_LIMIT: number = 5;

  /**
   * How many reverse proxies sit in front. Express only trusts this many hops
   * when resolving the client IP, so a spoofed X-Forwarded-For cannot dodge
   * rate limiting or poison the audit log's IP column.
   */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  TRUST_PROXY_HOPS: number = 1;
}

export function validateEnv(raw: Record<string, unknown>): EnvironmentVariables {
  const config = plainToInstance(EnvironmentVariables, raw, {
    enableImplicitConversion: false,
    exposeDefaultValues: true,
  });

  const errors = validateSync(config, {
    skipMissingProperties: false,
    whitelist: false,
  });

  if (errors.length > 0) {
    const detail = errors
      .map((e) => `  ${e.property}: ${Object.values(e.constraints ?? {}).join(", ")}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${detail}`);
  }

  /* Production-only invariants that a per-field rule can't express. */
  if (config.NODE_ENV === NodeEnv.PRODUCTION) {
    const problems: string[] = [];
    if (config.DB_SYNCHRONIZE) {
      problems.push("DB_SYNCHRONIZE must be false in production");
    }
    if (!config.COOKIE_SECURE) {
      problems.push("COOKIE_SECURE must be true in production");
    }
    if (config.CORS_ORIGINS.includes("*")) {
      problems.push("CORS_ORIGINS cannot contain a wildcard in production");
    }
    if (config.CORS_ORIGINS.includes("localhost")) {
      problems.push("CORS_ORIGINS must not include localhost in production");
    }
    if (config.JWT_ACCESS_SECRET === config.JWT_REFRESH_SECRET) {
      problems.push("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ");
    }
    if (config.SEED_ADMIN_PASSWORD.length < 16) {
      problems.push("SEED_ADMIN_PASSWORD must be at least 16 characters in production");
    }
    if (problems.length > 0) {
      throw new Error(`Unsafe production configuration:\n  ${problems.join("\n  ")}`);
    }
  }

  return config;
}

import { registerAs } from "@nestjs/config";

/**
 * Typed config namespaces. Every module reads its settings through one of
 * these rather than touching process.env directly, so the env surface stays
 * enumerable and a rename is a compile error instead of an undefined at
 * runtime.
 */

const int = (v: string | undefined, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const bool = (v: string | undefined, fallback = false): boolean =>
  v === undefined ? fallback : v === "true" || v === "1";

export const appConfig = registerAs("app", () => ({
  env: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  port: int(process.env.PORT, 4000),
  apiPrefix: process.env.API_PREFIX ?? "api/v1",
  webAppUrl: process.env.WEB_APP_URL ?? "http://localhost:3000",
  revalidateSecret: process.env.REVALIDATE_SECRET as string,
  trustProxyHops: int(process.env.TRUST_PROXY_HOPS, 1),
  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
}));

export const databaseConfig = registerAs("database", () => ({
  host: process.env.DB_HOST as string,
  port: int(process.env.DB_PORT, 3306),
  username: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_DATABASE as string,
  synchronize: bool(process.env.DB_SYNCHRONIZE),
  logging: bool(process.env.DB_LOGGING),
  ssl: bool(process.env.DB_SSL),
}));

export const authConfig = registerAs("auth", () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET as string,
  refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  issuer: process.env.JWT_ISSUER ?? "funavry-api",
  audience: process.env.JWT_AUDIENCE ?? "funavry-admin",
  maxFailedAttempts: int(process.env.AUTH_MAX_FAILED_ATTEMPTS, 5),
  lockoutMinutes: int(process.env.AUTH_LOCKOUT_MINUTES, 15),
  cookieDomain: process.env.COOKIE_DOMAIN ?? "localhost",
  cookieSecure: bool(process.env.COOKIE_SECURE),
  cookieSecret: process.env.COOKIE_SECRET as string,
  seed: {
    username: process.env.SEED_ADMIN_USERNAME ?? "admin",
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@funavry.com",
    password: process.env.SEED_ADMIN_PASSWORD as string,
  },
}));

export const storageConfig = registerAs("storage", () => ({
  driver: (process.env.STORAGE_DRIVER ?? "LOCAL").toUpperCase(),
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  publicUrl: (process.env.UPLOAD_PUBLIC_URL ?? "http://localhost:4000/uploads").replace(
    /\/$/,
    "",
  ),
  maxBytes: int(process.env.UPLOAD_MAX_BYTES, 10 * 1024 * 1024),
  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
    publicUrl: process.env.S3_PUBLIC_URL?.replace(/\/$/, ""),
  },
}));

export const loggingConfig = registerAs("logging", () => ({
  level: process.env.LOG_LEVEL ?? "info",
  dir: process.env.LOG_DIR ?? "logs",
  toFile: bool(process.env.LOG_TO_FILE, true),
}));

export const throttleConfig = registerAs("throttle", () => ({
  ttlSeconds: int(process.env.THROTTLE_TTL_SECONDS, 60),
  limit: int(process.env.THROTTLE_LIMIT, 120),
  authLimit: int(process.env.THROTTLE_AUTH_LIMIT, 5),
}));

export const configurations = [
  appConfig,
  databaseConfig,
  authConfig,
  storageConfig,
  loggingConfig,
  throttleConfig,
];

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NestExpressApplication } from "@nestjs/platform-express";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { join } from "node:path";

import { AppModule } from "./app.module";
import { globalValidationPipe } from "./common/pipes/validation.pipe";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    /* Nest's own logger is buffered until pino takes over, so boot-time errors
       are not lost between the two. */
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const isProduction = config.get<string>("NODE_ENV") === "production";
  const apiPrefix = config.get<string>("API_PREFIX") ?? "api/v1";
  const port = config.get<number>("PORT") ?? 4000;

  /**
   * How many proxy hops to believe when resolving the client IP.
   *
   * A number, never `true`. `trust proxy: true` tells Express to accept the
   * left-most X-Forwarded-For entry, which is entirely client-supplied — so any
   * caller could claim any address and walk straight past both the rate limiter
   * and the audit log's IP column.
   */
  app.set("trust proxy", config.get<number>("TRUST_PROXY_HOPS") ?? 1);

  /* Express advertises itself by default; there is no reason to tell a scanner
     which server and version it is talking to. */
  app.disable("x-powered-by");

  /**
   * Security headers.
   *
   * The CSP is strict because the only HTML this server serves is Swagger in
   * development — the API itself returns JSON, and a permissive policy here
   * would only ever help an attacker who found somewhere to inject markup.
   */
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:", "blob:"],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      /* Tells browsers to use HTTPS for this origin for a year, which closes
         the plain-HTTP window an active attacker needs to strip TLS. */
      hsts: isProduction
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
        : false,
      /* The API, the public site and the admin panel are three separate
         origins, and both front-ends embed media served from here — so the
         blanket policy is relaxed for /uploads below. Everything else this
         server returns is JSON that nothing should be embedding. */
      crossOriginResourcePolicy: { policy: "same-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      /* Nothing here is meant to be framed. */
      frameguard: { action: "deny" },
      noSniff: true,
    }),
  );

  app.use(compression());

  /* The refresh token lives in a signed httpOnly cookie. */
  app.use(cookieParser(config.get<string>("COOKIE_SECRET")));

  /**
   * Body size cap.
   *
   * 1MB for JSON, which is generous for content payloads and far below what it
   * takes to make parsing expensive. File uploads are multipart and bounded
   * separately by multer, so this does not constrain them.
   */
  app.useBodyParser("json", { limit: "1mb" });
  app.useBodyParser("urlencoded", { limit: "1mb", extended: true });

  /**
   * CORS with an explicit origin allow-list.
   *
   * `credentials: true` is required for the refresh cookie, and the two rules
   * interlock: a browser refuses `Access-Control-Allow-Origin: *` on a
   * credentialed request, so a wildcard here would not merely be lax — it would
   * break the login flow while appearing to work in tools that ignore CORS.
   */
  const corsOrigins = (config.get<string>("CORS_ORIGINS") ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      /* No Origin header: same-origin, curl, or a server-to-server call. There
         is nothing for CORS to protect in that case. */
      if (!origin) return callback(null, true);

      if (corsOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
    maxAge: 600,
  });

  app.setGlobalPrefix(apiPrefix, {
    /* Probes should not have to know the API version. */
    exclude: ["health"],
  });

  app.useGlobalPipes(globalValidationPipe);

  /**
   * Uploaded media, served from disk.
   *
   * `dotfiles: "deny"` and `index: false` stop the directory being browsable
   * and stop anything starting with a dot being served at all. The long
   * immutable cache is safe because storage keys are content-addressed — a
   * changed file gets a new key rather than a new version of an old one.
   */
  app.useStaticAssets(join(process.cwd(), config.get<string>("UPLOAD_DIR") ?? "uploads"), {
    prefix: "/uploads/",
    index: false,
    dotfiles: "deny",
    maxAge: "365d",
    immutable: true,
    setHeaders: (res) => {
      /* Never let the browser second-guess the type. Combined with the
         magic-byte check on upload, this is what stops a file being treated as
         something other than the image it was verified to be. */
      res.setHeader("X-Content-Type-Options", "nosniff");

      /* Media is meant to be embedded by the site and the panel, which are
         different origins from this one. `same-site` here silently blanked
         every image in both. */
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

      /* `default-src 'none'` with no `sandbox`. The directive still neuters an
         SVG opened directly as a document — no scripts, no external fetches —
         which is the case worth defending, on top of the sanitising the upload
         already does. Adding `sandbox` looks stricter and is not: Chrome
         applies it to the resource itself, which stops an <img> rendering at
         all. That is how this broke the first time. */
      res.setHeader("Content-Security-Policy", "default-src 'none'");
    },
  });

  /**
   * API documentation, development only.
   *
   * Publishing a complete map of every route, parameter and DTO to the internet
   * is free reconnaissance; in production this is simply absent.
   */
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Funavry CMS API")
      .setDescription(
        "Content and identity API for the Funavry website admin panel. " +
          "Every response uses the shared envelope: { success, data | error, meta }.",
      )
      .setVersion("1.0")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "access-token",
      )
      .addTag("Auth", "Sign in, refresh, and password management")
      .addTag("Case Studies", "Portfolio projects and their detail pages")
      .addTag("Services", "The practice lines and their sub-services")
      .addTag("Industries", "Sectors, with the work filed under each")
      .addTag("Posts", "Blog, news and case notes")
      .addTag("Leadership", "Founders, co-founders and the C-suite")
      .addTag("Team", "The wider team directory")
      .addTag("Testimonials", "Client quotes and their approval state")
      .addTag("Offices", "Locations, with coordinates for the globe")
      .addTag("Clients", "Client and partner marks")
      .addTag("Media", "Uploads and the asset library")
      .addTag("Users", "Admin accounts and sessions")
      .addTag("Audit", "The audit trail")
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  /* Gives in-flight requests a chance to finish on SIGTERM rather than being
     cut off mid-transaction by an orchestrator's rolling restart. */
  app.enableShutdownHooks();

  await app.listen(port, "0.0.0.0");

  const logger = app.get(Logger);
  logger.log(
    `Funavry CMS API listening on port ${port} — prefix /${apiPrefix}` +
      (isProduction ? "" : `, docs at /${apiPrefix}/docs`),
  );
}

void bootstrap();

import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService, ConfigType } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggerModule } from "nestjs-pino";

import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";
import { AuditInterceptor } from "./common/interceptors/audit.interceptor";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";
import { RequestContextMiddleware } from "./common/middleware/request-context.middleware";
import {
  appConfig,
  configurations,
  databaseConfig,
  loggingConfig,
  throttleConfig,
} from "./config/configuration";
import { validateEnv } from "./config/env.validation";
import { buildLoggerConfig } from "./config/logger.config";
import { ENTITIES } from "./database/entities";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CaseStudiesModule } from "./modules/case-studies/case-studies.module";
import { HealthModule } from "./modules/health/health.module";
import { IndustriesModule } from "./modules/industries/industries.module";
import { MediaModule } from "./modules/media/media.module";
import { OrgModule } from "./modules/org/org.module";
import { PeopleModule } from "./modules/people/people.module";
import { PostsModule } from "./modules/posts/posts.module";
import { RevalidationModule } from "./modules/revalidation/revalidation.module";
import { ServicesModule } from "./modules/services/services.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { UsersModule } from "./modules/users/users.module";

/**
 * The application root.
 *
 * The four globals registered here are the reason cross-cutting behaviour is
 * consistent rather than per-controller: every response is enveloped, every
 * failure is caught and sanitised, every route is authenticated unless it says
 * `@Public()`, and every request is rate limited.
 *
 * Guard order matters and is the registration order below: throttle first so a
 * flood is rejected before it costs a database lookup, then authentication,
 * then authorization — which needs the identity the previous guard resolved.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configurations,
      /* Fails the boot on a missing or weak secret rather than starting with a
         hole in it — see env.validation.ts. */
      validate: validateEnv,
      envFilePath: [".env.local", ".env"],
    }),

    LoggerModule.forRootAsync({
      inject: [loggingConfig.KEY, appConfig.KEY],
      useFactory: (
        logging: ConfigType<typeof loggingConfig>,
        app: ConfigType<typeof appConfig>,
      ) =>
        buildLoggerConfig({
          level: logging.level,
          dir: logging.dir,
          toFile: logging.toFile,
          isProduction: app.isProduction,
          apiPrefix: app.apiPrefix,
        }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) => ({
        type: "mysql" as const,
        host: db.host,
        port: db.port,
        username: db.username,
        password: db.password,
        database: db.database,
        entities: ENTITIES,
        /* Never true, and never `migrationsRun` either: schema changes are
           reviewed and applied deliberately, not as a side effect of a deploy
           that happened to restart first. */
        synchronize: false,
        migrationsRun: false,
        logging: db.logging ? (["query", "error"] as const) : (["error"] as const),
        charset: "utf8mb4_unicode_ci",
        timezone: "Z",
        extra: {
          connectionLimit: 10,
          supportBigNumbers: true,
          bigNumberStrings: true,
        },
        ssl: db.ssl ? { rejectUnauthorized: true } : undefined,
        autoLoadEntities: false,
      }),
    }),

    ThrottlerModule.forRootAsync({
      inject: [throttleConfig.KEY],
      useFactory: (throttle: ConfigType<typeof throttleConfig>) => ({
        throttlers: [
          {
            name: "default",
            ttl: throttle.ttlSeconds * 1000,
            limit: throttle.limit,
          },
        ],
      }),
    }),

    /* Global modules — audit and revalidation are injected everywhere. */
    AuditModule,
    RevalidationModule,

    AuthModule,
    UsersModule,
    MediaModule,

    CaseStudiesModule,
    ServicesModule,
    IndustriesModule,
    PostsModule,
    PeopleModule,
    OrgModule,
    SettingsModule,

    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },

    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    /* Interceptors run outside-in on the way down and inside-out on the way
       back, so the response wrapper is listed first and therefore wraps last —
       after the audit interceptor has seen the raw handler return value. */
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    /* Opens the async-local request context before anything else runs, so the
       correlation id and client IP are available to guards, services and the
       exception filter alike. */
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}

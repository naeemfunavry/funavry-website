import { config as loadEnv } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";

import { ENTITIES } from "./entities";

/* The TypeORM CLI boots this file directly, outside Nest, so it loads .env
   itself rather than relying on ConfigModule. */
loadEnv();

/**
 * The CLI data source, used by `migration:generate`, `migration:run` and the
 * seed runner. The application gets its connection from TypeOrmModule instead;
 * both read the same entity list so they cannot describe different schemas.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: "mysql",
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: ENTITIES,
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  migrationsTableName: "typeorm_migrations",

  /* Never on. A rename would be executed as a drop-then-create, which is a
     silent data loss on a production table. Schema changes go through a
     migration file that can be read before it runs. */
  synchronize: false,
  migrationsRun: false,
  logging: process.env.DB_LOGGING === "true" ? ["query", "error"] : ["error"],

  charset: "utf8mb4_unicode_ci",
  timezone: "Z",

  extra: {
    connectionLimit: 10,
    /* Return DECIMAL and BIGINT as strings. The MySQL driver would otherwise
       hand back a JS number, which silently loses precision past 2^53 and
       rounds the coordinates the globe uses to place its markers. */
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: false,
  },

  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: true }
      : undefined,
};

export const AppDataSource = new DataSource(dataSourceOptions);

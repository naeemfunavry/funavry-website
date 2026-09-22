import { config as loadEnv } from "dotenv";
import * as path from "node:path";

import { AppDataSource } from "../data-source";
import { seedContent } from "./content.seed";
import { MediaSeeder } from "./media.seed";
import { seedMasterAdmin, seedRbac } from "./rbac.seed";

loadEnv();

/**
 * Populates a fresh database.
 *
 * Order matters: roles must exist before the master admin can be given one,
 * and the media library must be importable before content can reference it.
 *
 * Every step is idempotent, so this is safe to re-run — which matters, because
 * the alternative is a seed people are afraid to run twice and therefore run
 * once, by hand, differently on every environment.
 */
async function run(): Promise<void> {
  const started = Date.now();

  console.log("Connecting…");
  await AppDataSource.initialize();

  try {
    const pending = await AppDataSource.showMigrations();

    if (pending) {
      throw new Error(
        "There are unapplied migrations. Run `npm run migration:run` before seeding.",
      );
    }

    console.log("\nRoles and permissions…");
    await seedRbac(AppDataSource);

    console.log("Master administrator…");
    const { PasswordService } = await import("src/modules/auth/password.service");
    const passwords = new PasswordService();

    const admin = await seedMasterAdmin(
      AppDataSource,
      {
        username: process.env.SEED_ADMIN_USERNAME ?? "admin",
        email: process.env.SEED_ADMIN_EMAIL ?? "admin@funavry.com",
        password: process.env.SEED_ADMIN_PASSWORD ?? "admin1234",
      },
      (plain) => passwords.hash(plain),
    );

    console.log(
      admin.created
        ? `  created '${admin.username}' (must change password on first sign-in)`
        : `  '${admin.username}' already exists — left untouched`,
    );

    console.log("\nContent…");

    const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");
    const webPublicDir = path.resolve(process.cwd(), "../web/public");

    const media = new MediaSeeder(AppDataSource, uploadDir, webPublicDir);

    await seedContent(AppDataSource, media, (message) => console.log(message));

    console.log(`  media assets imported: ${media.importedCount}`);

    console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s.`);
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((error: unknown) => {
  console.error("\nSeed failed:");
  console.error(error);
  process.exitCode = 1;
});

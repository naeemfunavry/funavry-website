import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { appConfig } from "src/config/configuration";

import { RevalidationService } from "./revalidation.service";

/** Global — every content module revalidates, none should have to import it. */
@Global()
@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [RevalidationService],
  exports: [RevalidationService],
})
export class RevalidationModule {}

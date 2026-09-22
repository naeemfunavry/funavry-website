import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PinoLogger } from "nestjs-pino";

import { storageConfig } from "src/config/configuration";
import { MediaAssetEntity } from "src/database/entities";

import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { LocalDiskDriver } from "./storage/local-disk.driver";
import { S3Driver } from "./storage/s3.driver";
import { STORAGE_DRIVER } from "./storage/storage.interface";

/**
 * The storage driver is chosen once, here, from configuration. Everything else
 * injects the STORAGE_DRIVER token, so moving to S3 is this factory and nothing
 * else.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MediaAssetEntity]),
    ConfigModule.forFeature(storageConfig),
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    LocalDiskDriver,
    S3Driver,
    {
      provide: STORAGE_DRIVER,
      inject: [storageConfig.KEY, PinoLogger],
      useFactory: (config: ConfigType<typeof storageConfig>, logger: PinoLogger) =>
        config.driver === "S3" ? new S3Driver(config) : new LocalDiskDriver(config, logger),
    },
  ],
  exports: [MediaService, STORAGE_DRIVER],
})
export class MediaModule {}

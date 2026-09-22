import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";

import { storageConfig } from "src/config/configuration";

import type { StorageDriverPort, StoredFile } from "./storage.interface";

/**
 * S3 storage — the slot for when object storage is added.
 *
 * Left unimplemented rather than half-written against an SDK that is not
 * installed: a driver that looks finished but has never run is worse than one
 * that says plainly it is not wired up yet. The contract is fixed, so filling
 * this in is a self-contained job — add `@aws-sdk/client-s3`, implement the
 * four methods, and set STORAGE_DRIVER=S3. Nothing else in the application
 * changes, because everything depends on StorageDriverPort.
 */
@Injectable()
export class S3Driver implements StorageDriverPort {
  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {}

  private notImplemented(): never {
    throw new Error(
      "S3 storage is not wired up yet. Install @aws-sdk/client-s3, implement " +
        "S3Driver, and set STORAGE_DRIVER=S3 with the S3_* variables filled in.",
    );
  }

  async save(_key: string, _data: Buffer, _contentType: string): Promise<StoredFile> {
    this.notImplemented();
  }

  async delete(_key: string): Promise<void> {
    this.notImplemented();
  }

  async exists(_key: string): Promise<boolean> {
    this.notImplemented();
  }

  urlFor(key: string): string {
    const base = this.config.s3.publicUrl ?? `https://${this.config.s3.bucket}.s3.amazonaws.com`;
    return `${base}/${key}`;
  }
}

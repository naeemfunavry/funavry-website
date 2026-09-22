import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PinoLogger } from "nestjs-pino";
import { promises as fs } from "node:fs";
import * as path from "node:path";

import { storageConfig } from "src/config/configuration";

import type { StorageDriverPort, StoredFile } from "./storage.interface";

/**
 * Local disk storage.
 *
 * `resolveSafe` is the security control here. Keys are server-generated, so in
 * normal operation nothing hostile reaches this class — but "the caller always
 * passes a safe key" is precisely the assumption that stops holding when
 * someone later adds an endpoint that takes a key from a request. Resolving and
 * then verifying containment means a `../../etc/passwd` is refused at the layer
 * that actually touches the filesystem, not at the layer that happened to
 * remember.
 */
@Injectable()
export class LocalDiskDriver implements StorageDriverPort {
  private readonly root: string;

  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(LocalDiskDriver.name);
    this.root = path.resolve(process.cwd(), this.config.uploadDir);
  }

  private resolveSafe(key: string): string {
    const resolved = path.resolve(this.root, key);

    /* The trailing separator matters: without it, a sibling directory whose
       name merely starts with the root's ("uploads-evil") would pass. */
    if (!resolved.startsWith(this.root + path.sep) && resolved !== this.root) {
      throw new Error(`Refusing to operate outside the upload root: ${key}`);
    }

    return resolved;
  }

  async save(key: string, data: Buffer, _contentType: string): Promise<StoredFile> {
    const target = this.resolveSafe(key);

    await fs.mkdir(path.dirname(target), { recursive: true });

    /* 0o640: the process can read and write, its group can read, and nobody
       else on the box can. The default 0o666-minus-umask is usually
       world-readable, which on a shared host is a data leak. */
    await fs.writeFile(target, data, { mode: 0o640 });

    this.logger.debug({ key, size: data.length }, "Stored file on local disk");

    return { key, url: this.urlFor(key), size: data.length };
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolveSafe(key));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
      /* Already gone is the desired end state, not an error. */
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.resolveSafe(key));
      return true;
    } catch {
      return false;
    }
  }

  urlFor(key: string): string {
    return `${this.config.publicUrl}/${key}`;
  }
}

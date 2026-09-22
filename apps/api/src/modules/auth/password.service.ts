import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import { timingSafeEqual } from "node:crypto";

/**
 * Password hashing.
 *
 * Argon2id, with parameters at the OWASP Password Storage Cheat Sheet's
 * recommended floor: 19 MiB of memory, 2 iterations, 1 degree of parallelism.
 * The memory cost is the part that matters — it is what makes a GPU or ASIC
 * cracking rig expensive, and it is the reason to prefer Argon2id over bcrypt,
 * whose cost is CPU-only and parallelises cheaply on commodity hardware.
 *
 * The `id` variant specifically: Argon2i resists side channels but is weaker
 * against time-memory trade-offs, Argon2d is the reverse, and `id` is the
 * hybrid that is correct for password storage.
 */
@Injectable()
export class PasswordService {
  private readonly options: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
  };

  async hash(plain: string): Promise<string> {
    return argon2.hash(plain, this.options);
  }

  /**
   * Verifies a password. Returns false rather than throwing on a malformed
   * hash, so a corrupt row is a failed login and not a 500 that tells the
   * caller something unusual about that account.
   */
  async verify(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  /**
   * Burns roughly the time a real verification takes.
   *
   * Called on the "no such user" path. Without it, a missing account returns
   * measurably faster than a wrong password, and that difference is a reliable
   * user-enumeration oracle no matter how carefully the error message is worded.
   */
  async fakeVerify(): Promise<void> {
    await argon2.hash("timing-equalisation-placeholder", this.options);
  }

  /** True when the stored hash was produced with weaker parameters than current. */
  needsRehash(hash: string): boolean {
    try {
      return argon2.needsRehash(hash, this.options);
    } catch {
      return true;
    }
  }

  /** Constant-time compare for opaque tokens. */
  static safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}

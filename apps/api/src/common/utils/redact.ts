/**
 * Keys whose values never get written to a log or an audit row, matched
 * case-insensitively against the key name.
 *
 * Matching on the name rather than the value is the point: it catches a secret
 * in a field nobody remembered to think about, which is exactly how credentials
 * reach logs in practice.
 */
const SECRET_KEY_PATTERN =
  /(pass(word)?|secret|token|authorization|cookie|credential|api[-_]?key|private[-_]?key|hash|otp|pin)/i;

const REDACTED = "[REDACTED]";

/** How deep to walk before giving up — a cycle guard as much as a depth cap. */
const MAX_DEPTH = 8;

/**
 * Recursively replaces secret-bearing values in an arbitrary object.
 *
 * Used on audit diffs, which are attacker-influenced (an editor controls what
 * they type into a field) and durable. Without this, a mistyped password in the
 * wrong input box would be stored in the audit table in plaintext forever.
 */
export function redactDeep(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[TRUNCATED]";
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((v) => redactDeep(v, depth + 1));
  }

  if (value instanceof Date) return value.toISOString();

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SECRET_KEY_PATTERN.test(key) ? REDACTED : redactDeep(val, depth + 1);
    }
    return out;
  }

  /* A very long string in an audit row is almost always a pasted body; keep the
     row readable and the table small. */
  if (typeof value === "string" && value.length > 2000) {
    return `${value.slice(0, 2000)}… [truncated ${value.length - 2000} chars]`;
  }

  return value;
}

/**
 * Builds the field-level diff an audit row stores.
 *
 * Only changed scalar fields are recorded. Relations and child collections are
 * skipped rather than serialised — a case study's full object graph would make
 * every audit row kilobytes of mostly-unchanged prose, and the interesting
 * question ("who changed the slug") gets buried.
 */
export function buildDiff(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  skip: string[] = ["updatedAt", "createdAt", "version", "deletedAt"],
): Record<string, { from: unknown; to: unknown }> | null {
  if (!before && !after) return null;

  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);

  for (const key of keys) {
    if (skip.includes(key)) continue;

    const from = before?.[key];
    const to = after?.[key];

    /* Skip nested objects and arrays — see the note above. */
    if (
      (from !== null && typeof from === "object" && !(from instanceof Date)) ||
      (to !== null && typeof to === "object" && !(to instanceof Date))
    ) {
      continue;
    }

    const same =
      from instanceof Date && to instanceof Date
        ? from.getTime() === to.getTime()
        : from === to;

    if (!same) {
      diff[key] = {
        from: SECRET_KEY_PATTERN.test(key) ? REDACTED : (from ?? null),
        to: SECRET_KEY_PATTERN.test(key) ? REDACTED : (to ?? null),
      };
    }
  }

  return Object.keys(diff).length > 0 ? diff : null;
}

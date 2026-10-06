import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * TLS options for the MySQL connection, shared by the app and the CLI data
 * source so the two cannot disagree.
 *
 * Managed hosts (Aiven, for one) sign with their own CA, which Node's bundled
 * roots don't include. The CA is given either as `DB_SSL_CA_PEM` — the
 * certificate itself, for hosts with no files to mount (Vercel) — or as
 * `DB_SSL_CA`, a path to it. Either way the certificate is still verified:
 * switching `rejectUnauthorized` off would accept anyone presenting any
 * certificate, which is the attack TLS is there to stop.
 */
export function mysqlSsl(
  enabled: boolean,
  caPath: string | undefined,
  caPem: string | undefined = process.env.DB_SSL_CA_PEM,
) {
  if (!enabled) return undefined;

  /* Env UIs often store a pasted multi-line value with literal "\n"s. */
  const inline = caPem?.trim() ? caPem.replace(/\\n/g, "\n") : undefined;

  return {
    rejectUnauthorized: true,
    ca: inline ?? (caPath ? readFileSync(resolve(caPath), "utf8") : undefined),
  };
}

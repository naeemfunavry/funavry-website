import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * TLS options for the MySQL connection, shared by the app and the CLI data
 * source so the two cannot disagree.
 *
 * Managed hosts (Aiven, for one) sign with their own CA, which Node's bundled
 * roots don't include. `DB_SSL_CA` points at that CA so the certificate is
 * still verified — switching `rejectUnauthorized` off would accept anyone
 * presenting any certificate, which is the attack TLS is there to stop.
 */
export function mysqlSsl(enabled: boolean, caPath: string | undefined) {
  if (!enabled) return undefined;

  return {
    rejectUnauthorized: true,
    ca: caPath ? readFileSync(resolve(caPath), "utf8") : undefined,
  };
}

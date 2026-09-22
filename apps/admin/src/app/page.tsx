import { redirect } from "next/navigation";

/**
 * The root is a redirect rather than a page.
 *
 * Where it lands depends on the session, which only the client knows — the
 * access token lives in memory and the refresh cookie is httpOnly. So the
 * dashboard's own auth gate makes that call, and this just points at it.
 */
export default function RootPage() {
  redirect("/dashboard");
}

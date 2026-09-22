import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * The hook the CMS calls after every write, so the published site re-renders
 * instead of serving what it cached an hour ago.
 *
 * This is the one route on a marketing site that can be made to do work by an
 * unauthenticated caller, so it is deliberately narrow:
 *
 * - A shared secret in a header, compared in constant time. A plain `===` on a
 *   secret leaks its length and, in principle, its content through timing.
 * - The secret travels in a header, never a query string — query strings end up
 *   in access logs, browser history and referrer headers.
 * - Tags and paths are checked against fixed allow-lists. Without that, anyone
 *   holding the secret could purge arbitrary routes, and a path is a much
 *   sharper tool than a tag.
 * - No response body detail on failure. A 401 that explains *why* is a hint.
 */

/** Exactly the tags apps/web declares on its fetches. */
const ALLOWED_TAGS = new Set([
  "case-studies",
  "services",
  "industries",
  "posts",
  "leaders",
  "team",
  "offices",
  "clients",
  "testimonials",
  "technologies",
  "stats",
  "socials",
  "settings",
]);

/**
 * Paths are for what a tag cannot express — chiefly purging the *old* URL after
 * a slug change, which no tag on the new row knows about.
 */
const ALLOWED_PATH_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/about$/,
  /^\/contact$/,
  /^\/blog$/,
  /^\/blog\/[a-z0-9-]{1,160}$/,
  /^\/case-studies$/,
  /^\/case-studies\/[a-z0-9-]{1,140}$/,
  /^\/services$/,
  /^\/services\/[a-z0-9-]{1,140}$/,
  /^\/industries$/,
  /^\/industries\/[a-z0-9-]{1,140}$/,
];

interface RevalidateBody {
  tags?: unknown;
  paths?: unknown;
}

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;

  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");

  /* timingSafeEqual throws on a length mismatch, so that is checked first —
     which does leak the length, and is unavoidable without hashing both sides.
     The secret is 32+ bytes of randomness, so its length is not the secret. */
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<NextResponse> {
  const expected = process.env.REVALIDATE_SECRET;

  /* Refusing to run unconfigured beats defaulting to "no auth required". */
  if (!expected) {
    console.error("[revalidate] REVALIDATE_SECRET is not set — refusing");
    return NextResponse.json({ revalidated: false }, { status: 503 });
  }

  if (!secretMatches(request.headers.get("x-revalidate-secret"), expected)) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  let body: RevalidateBody;

  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json({ revalidated: false }, { status: 400 });
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string" && ALLOWED_TAGS.has(t))
    : [];

  const paths = Array.isArray(body.paths)
    ? body.paths.filter(
        (p): p is string =>
          typeof p === "string" && ALLOWED_PATH_PATTERNS.some((pattern) => pattern.test(p)),
      )
    : [];

  /* Next 16 takes a cacheLife profile as the second argument. `{ expire: 0 }`
     is the one that means what a publish means: the cached entry is stale as of
     now, not after some profile's window. */
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  /* Next 16 requires the path's type. "page" purges that exact route; "layout"
     would additionally purge everything nested beneath it, which is more than
     any of these paths means — a slug change should not invalidate the whole
     /case-studies subtree. */
  for (const path of paths) revalidatePath(path, "page");

  console.log(
    `[revalidate] purged ${tags.length} tag(s)${paths.length ? ` and ${paths.length} path(s)` : ""}`,
  );

  return NextResponse.json({
    revalidated: true,
    tags,
    paths,
    at: new Date().toISOString(),
  });
}

/** A GET here is almost always a misconfiguration; say so rather than 404. */
export function GET(): NextResponse {
  return NextResponse.json(
    { error: "This endpoint accepts POST with an x-revalidate-secret header." },
    { status: 405 },
  );
}

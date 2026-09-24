/**
 * Snapshots the CMS's public content into the web app, so the site can build
 * and run without a reachable API.
 *
 *   npm run cms:snapshot            (from the repo root, with the API running)
 *
 * Reads every public endpoint `src/lib/api.ts` calls — the lists, and each
 * case study, service and industry by slug — and writes the unwrapped `data`
 * of each response to `src/data/cms-snapshot.json`, keyed by path.
 *
 * Media URLs point at the API's /uploads, and each is rewritten to a file the
 * web app serves itself:
 *   - an upload identical to a file already in `public/` (the seed copied
 *     most of them from there) points at that file — no second copy;
 *   - a PNG or JPEG over 300 KB is re-encoded to WebP at q90 — the quality
 *     the site already asks for on its dashboard captures — at full size,
 *     into `public/cms/`; the big screenshots shrink ~8x;
 *   - anything else is copied into `public/cms/` as-is.
 * Files in `public/cms/` no longer referenced are removed on the next run.
 *
 * Re-run after editing content in the admin panel, and commit the result.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(here, "..");
const UPLOADS = resolve(WEB, "../api/uploads");
const OUT_JSON = join(WEB, "src/data/cms-snapshot.json");
const PUBLIC = join(WEB, "public");
const OUT_MEDIA = join(PUBLIC, "cms");
/* Below this a re-encode isn't worth the generation loss. */
const REENCODE_OVER = 300 * 1024;
/* WebP's hard limit on either side. */
const WEBP_MAX_SIDE = 16383;

const API_URL = (process.env.API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
const API_ORIGIN = new URL(API_URL).origin;

const LISTS = [
  "/case-studies/public",
  "/case-studies/public?featured=true",
  "/case-studies/public/details",
  "/services/public",
  "/industries/public",
  "/posts/public",
  "/offices/public",
  "/delivery-countries/public",
  "/leaders/public",
  "/testimonials/public",
  "/clients/public/clients",
  "/stats/public",
  "/social-links/public",
];

async function get(path) {
  const res = await fetch(`${API_URL}${path}`, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const body = await res.json();
  if (!body.success) throw new Error(`${path}: ${body.error?.code} ${body.error?.message}`);
  return body.data;
}

const UPLOAD_PREFIX = `${API_ORIGIN}/uploads/`;
const uploadPath = (url) => decodeURIComponent(url.slice(UPLOAD_PREFIX.length).split("?")[0]);
const toUrl = (path) => "/" + path.split("/").map(encodeURIComponent).join("/");

/** Every /uploads path a response refers to. */
function collect(value, into) {
  if (typeof value === "string") {
    if (value.startsWith(UPLOAD_PREFIX)) into.add(uploadPath(value));
  } else if (Array.isArray(value)) value.forEach((v) => collect(v, into));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collect(v, into));
  return into;
}

/** Rewrites every /uploads URL through `targets` (upload path → site path). */
function localise(value, targets) {
  if (typeof value === "string") {
    return value.startsWith(UPLOAD_PREFIX) ? toUrl(targets.get(uploadPath(value)) ?? "") : value;
  }
  if (Array.isArray(value)) return value.map((v) => localise(v, targets));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localise(v, targets)]));
  }
  return value;
}

/** Decides, and writes, where one upload is served from on the site. */
async function place(rel) {
  const from = join(UPLOADS, rel);
  if (!existsSync(from)) return null;
  const bytes = readFileSync(from);

  /* The key is "<purpose>/<its path under public/>" for seeded media. */
  const publicPath = rel.split("/").slice(1).join("/");
  const inPublic = join(PUBLIC, publicPath);
  if (publicPath && existsSync(inPublic) && bytes.equals(readFileSync(inPublic))) {
    return publicPath;
  }

  if (/\.(png|jpe?g)$/i.test(rel) && bytes.length > REENCODE_OVER) {
    const { width = 0, height = 0 } = await sharp(bytes).metadata();
    if (width <= WEBP_MAX_SIDE && height <= WEBP_MAX_SIDE) {
      const out = `cms/${rel.replace(/\.(png|jpe?g)$/i, ".webp")}`;
      mkdirSync(dirname(join(PUBLIC, out)), { recursive: true });
      await sharp(bytes).webp({ quality: 90, smartSubsample: true }).toFile(join(PUBLIC, out));
      return out;
    }
  }

  const out = `cms/${rel}`;
  mkdirSync(dirname(join(PUBLIC, out)), { recursive: true });
  cpSync(from, join(PUBLIC, out));
  return out;
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const snapshot = {};

for (const path of LISTS) snapshot[path] = await get(path);

const bySlug = [
  ["/case-studies/public/", snapshot["/case-studies/public"]],
  ["/services/public/", snapshot["/services/public"]],
  ["/industries/public/", snapshot["/industries/public"]],
];
for (const [base, items] of bySlug) {
  for (const { slug } of items) {
    const path = `${base}${encodeURIComponent(slug)}`;
    snapshot[path] = await get(path);
  }
}

const targets = new Map();
let missing = 0;
for (const rel of collect(snapshot, new Set())) {
  const target = await place(rel);
  if (target) targets.set(rel, target);
  else {
    console.warn(`  missing upload: ${rel}`);
    missing++;
  }
}
const localised = localise(snapshot, targets);

/* Drop what the last run wrote and this one no longer references. */
const written = new Set([...targets.values()].filter((t) => t.startsWith("cms/")));
for (const file of walk(OUT_MEDIA)) {
  const rel = relative(PUBLIC, file).split("\\").join("/");
  if (!written.has(rel)) rmSync(file);
}

mkdirSync(dirname(OUT_JSON), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(localised) + "\n");

console.log(
  `cms snapshot: ${Object.keys(localised).length} endpoints, ${targets.size} media files ` +
    `(${written.size} in public/cms)` +
    (missing ? `, ${missing} missing` : ""),
);

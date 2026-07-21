/**
 * Canonical site constants, in one place so `layout`, `sitemap`, `robots` and
 * the Open Graph image all resolve URLs against the same origin. Kept out of
 * `layout.tsx` so the metadata routes don't have to import the fonts/CSS that
 * file pulls in.
 *
 * Override the origin per deploy with NEXT_PUBLIC_SITE_URL. Confirm the
 * production hostname (www vs apex) matches where DNS/redirects actually
 * settle — a canonical pointing at the variant Google then 301s away reads as
 * a duplicate.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.funavry.com";

export const SITE_NAME = "Funavry Technologies";

export const SITE_DESCRIPTION =
  "Funavry is an AI-first engineering and Global Business Services partner. We build modern platforms, automate the work inside them, and operate them at global scale — so you get outcomes, not just software.";

/**
 * Brand marks shipped in /public/tech-stack. Keys must match the `name` of an
 * item in TechStack's DOMAINS, and they take precedence over the Simple Icons
 * path in TECH_ICONS — so only the marks Simple Icons cannot give us belong
 * here. Everything else resolves to an SVG, which keeps a row of chips of a
 * piece rather than mixing raster and vector at the same size.
 *
 * OpenXR and SteamVR were never submitted to Simple Icons, and no icon set
 * carries them — these two are the only raster left on the page.
 *
 * AWS used to live here too. It no longer does: TECH_MARKS carries real AWS
 * vector artwork and is resolved first, so the raster had been unreachable and
 * was only waiting to be picked up by someone who reordered the lookup.
 *
 * `width`/`height` are the intrinsic pixel sizes so next/image can size the
 * box without a layout shift.
 */
export type TechLogo = { src: string; width: number; height: number };

const logo = (file: string, width: number, height: number): TechLogo => ({
  src: `/tech-stack/${file}.webp`,
  width,
  height,
});

export const TECH_LOGOS: Record<string, TechLogo> = {
  OpenXR: logo("open-xr", 120, 120),
  SteamVR: logo("steam-vr", 120, 120),
};

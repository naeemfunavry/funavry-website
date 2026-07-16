/**
 * Brand marks shipped in /public/tech-stack. Keys must match the `name` of an
 * item in TechStack's DOMAINS, and they take precedence over the Simple Icons
 * path in TECH_ICONS — so only the marks Simple Icons cannot give us belong
 * here. Everything else resolves to an SVG, which keeps a row of chips of a
 * piece rather than mixing raster and vector at the same size.
 *
 * Simple Icons removes marks on trademark-holder request, which is why AWS is
 * shipped locally; OpenXR and SteamVR were never submitted to it.
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
  AWS: logo("aws", 120, 120),
  OpenXR: logo("open-xr", 120, 120),
  SteamVR: logo("steam-vr", 120, 120),
};

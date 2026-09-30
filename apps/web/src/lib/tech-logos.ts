/**
 * Brand marks shipped in /public/tech-stack. Keys must match the `name` of an
 * item in TechStack's DOMAINS, and they take precedence over the Simple Icons
 * path in TECH_ICONS — so only the marks no vector set can give us belong
 * here. Everything else resolves to an SVG.
 *
 * OpenXR and SteamVR were never submitted to Simple Icons, and no icon set
 * carries them.
 *
 * The crypto infrastructure and Vuforia marks are the companies' own: the
 * avatars of their GitHub organisations (INFURA, quiknode-labs,
 * LayerZero-Labs, wormhole-foundation, debridge-finance), which no icon set
 * carries. Vuforia has no organisation of its own and is a PTC product, so it
 * takes PTC's (ptcinc). Each is a square tile with the brand's own ground, so
 * it renders as one — `tile` rounds its corners.
 *
 * AWS used to live here too. It no longer does: TECH_MARKS carries real AWS
 * vector artwork and is resolved first.
 *
 * `width`/`height` are the intrinsic pixel sizes so next/image can size the
 * box without a layout shift.
 */
export type TechLogo = {
  src: string;
  width: number;
  height: number;
  /** A square brand tile with its own background, drawn with rounded corners. */
  tile?: boolean;
};

const logo = (file: string, width: number, height: number): TechLogo => ({
  src: `/tech-stack/${file}.webp`,
  width,
  height,
});

const tile = (file: string): TechLogo => ({ ...logo(file, 120, 120), tile: true });

export const TECH_LOGOS: Record<string, TechLogo> = {
  OpenXR: logo("open-xr", 120, 120),
  SteamVR: logo("steam-vr", 120, 120),

  // Node providers and cross-chain bridges.
  Infura: tile("infura"),
  QuickNode: tile("quicknode"),
  LayerZero: tile("layerzero"),
  Wormhole: tile("wormhole"),
  deBridge: tile("debridge"),

  // Augmented reality: PTC's mark, which Vuforia ships under.
  Vuforia: tile("ptc"),
};

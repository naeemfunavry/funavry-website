/**
 * The Work page's shared vocabulary: filter categories and the view-model
 * types. Kept apart from `work.ts` so client components (the filter, the
 * lightbox) can import it without pulling the full case-study briefs into the
 * browser bundle.
 */

export const PROJECT_CATEGORIES = [
  { id: "enterprise", label: "Enterprise" },
  { id: "web", label: "Web Apps" },
  { id: "mobile", label: "Mobile" },
  { id: "ai", label: "AI" },
  { id: "commerce", label: "E-Commerce" },
  { id: "government", label: "Government" },
  { id: "healthcare", label: "Healthcare" },
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]["id"];

export type ProjectPhase = "Build" | "Automate" | "Operate";

/** What a capture is, read from its shape: a full desktop screen, a phone
    screen, or a crop of an interface. */
export type ShotKind = "desktop" | "mobile" | "crop";

export type Shot = {
  src: string;
  alt: string;
  width: number;
  height: number;
  ratio: number;
  kind: ShotKind;
  /** The brief chose this capture to lead the product visual. */
  lead?: boolean;
  /** Already a composed presentation (a marketing render with its own device
      and backdrop), not a raw screen. Shown as it is, never put inside
      another device; a raw screen of the same project is preferred to it. */
  presented?: boolean;
};

/** A project's captures, arranged for a product visual. */
export type ProjectMedia = {
  /** The dominant screen — the widest desktop capture, else a crop. */
  primary: Shot | null;
  /** Up to two further non-phone captures, shown as smaller windows/panels. */
  supporting: Shot[];
  /** Up to three phone captures. */
  phones: Shot[];
};

export type WorkProject = {
  slug: string;
  title: string;
  tagline: string;
  sector: string;
  phase: ProjectPhase;
  categories: ProjectCategory[];
  /** Industry · product type · capability, all taken from the brief. */
  facts: string[];
  /** Up to three short labels ("Healthcare · Enterprise · Web Application"),
      from the project's categories — domain first, platform last. */
  tags: string[];
  media: ProjectMedia;
  hasVisuals: boolean;
  /** How the portfolio presents it — see `lib/mockup-assign.ts`. */
  mockup: ProjectMockupPlan;
};

/** The portfolio's 3D scenes. Each is a different arrangement of the same
    devices; which ones a project may use depends on the captures it has. */
export const MOCKUP_SCENES = [
  "floating-laptop",
  "desktop-monitor",
  "floating-browser",
  "multi-screen",
  "offset-laptop",
  "laptop-mobile",
  "stacked-screens",
  "floating-dashboard",
  "full-bleed",
  "device-collage",
] as const;

export type MockupScene = (typeof MOCKUP_SCENES)[number];

/** The backdrops a scene sits on — a dark cinematic family from the brand's
    navy, steel and ink, kept quieter than any screen placed on them, so a page
    of different scenes still reads as one portfolio. */
export const MOCKUP_GROUNDS = [
  "navy",
  "midnight",
  "steel",
  "charcoal",
  "graphite",
  "abyss",
] as const;

export type MockupGround = (typeof MOCKUP_GROUNDS)[number];

export type ProjectMockupPlan = {
  scene: MockupScene;
  ground: MockupGround;
  /** Turn the scene the other way — so a scene used twice never repeats. */
  mirror: boolean;
};

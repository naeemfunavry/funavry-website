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
};

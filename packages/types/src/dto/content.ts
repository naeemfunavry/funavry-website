import type {
  CaseStudyFrame,
  CaseStudySurface,
  DeliveryPhase,
  PostKind,
  ServiceGroup,
} from "../enums";
import type { ContentLifecycle, MediaRef, SeoMeta } from "./common";

/* ========================================================== case studies == */

/**
 * A capability claimed by a case study. Modelled as a row rather than a string
 * because the deck's leader-line callouts must name one verbatim — making the
 * callout point at a capability row is what stops a callout claiming something
 * the study never listed.
 */
export interface CaseStudyCapability {
  id: string;
  label: string;
  position: number;
}

/** A leader-line callout drawn over the capture on the home deck. */
export interface CaseStudyCallout {
  id: string;
  /** Always the linked capability's label — resolved server-side. */
  label: string;
  capabilityId: string;
  /** lucide-react icon name. */
  icon: string;
  /** Anchor as a fraction of the capture. Keep x below ~0.3 (see web deck). */
  x: number;
  y: number;
  position: number;
}

/** Approved fact from the corporate deck. The one place a metric is allowed. */
export interface CaseStudyHighlight {
  id: string;
  value: string;
  detail: string;
  position: number;
}

/** A chip in the detail hero's stat strip. */
export interface CaseStudyStat {
  id: string;
  value: string;
  label: string;
  position: number;
}

/** A row of the detail page's Project Meta table. */
export interface CaseStudyMetaRow {
  id: string;
  label: string;
  value: string;
  position: number;
}

/** A challenge/solution pair from the content brief. */
export interface CaseStudyChallenge {
  id: string;
  title: string;
  challenge: string;
  solution: string;
  position: number;
}

export interface CaseStudyScreenshot {
  id: string;
  media: MediaRef;
  /** `cover` fills the 16:10 tile, `contain` shows a tall capture whole. */
  fit: "cover" | "contain";
  /** Overrides the widest-desktop rule for the laptop screen. */
  lead: boolean;
  position: number;
}

/** The light shape the home deck and the /case-studies index render. */
export interface CaseStudySummary extends ContentLifecycle {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  sector: string;
  phase: DeliveryPhase;
  surface: CaseStudySurface;
  frame: CaseStudyFrame;
  summary: string;
  client: string | null;
  team: string | null;
  featured: boolean;
  position: number;
  image: MediaRef | null;
  mobileImage: MediaRef | null;
  capabilities: CaseStudyCapability[];
  callouts: CaseStudyCallout[];
  highlights: CaseStudyHighlight[];
}

/** Everything `/case-studies/[slug]` needs, in one response. */
export interface CaseStudyDetail extends CaseStudySummary {
  introHeading: string;
  /** Ordered paragraphs of the lede section. */
  intro: string[];
  challengesLead: string;
  challenges: CaseStudyChallenge[];
  resultsLead: string;
  /** Ordered result lines. */
  results: string[];
  stats: CaseStudyStat[];
  meta: CaseStudyMetaRow[];
  screenshots: CaseStudyScreenshot[];
  seo: SeoMeta;
  /** Slugs of the industries this study is filed under. */
  industrySlugs: string[];
  /** Slugs of the practices that list this study as proof. */
  serviceSlugs: string[];
}

/* =============================================================== services == */

export interface ServiceSub {
  id: string;
  title: string;
  description: string;
  position: number;
}

export interface Service extends ContentLifecycle {
  id: string;
  slug: string;
  /** The display number, "01".."16". Presentation, not the sort key. */
  number: string;
  title: string;
  group: ServiceGroup;
  phase: DeliveryPhase;
  /** lucide-react icon name. */
  icon: string;
  summary: string;
  position: number;
  subs: ServiceSub[];
  seo: SeoMeta;
}

export interface ServiceDetail extends Service {
  /** Curated proof, strongest example first. */
  caseStudies: CaseStudySummary[];
}

/* ============================================================= industries == */

export interface Industry extends ContentLifecycle {
  id: string;
  slug: string;
  name: string;
  /** Two lines on the card; anything longer is clipped. */
  description: string;
  /** The client names shown as proof, e.g. "Mayo Clinic · CitiMed". */
  proof: string;
  image: MediaRef | null;
  position: number;
  seo: SeoMeta;
}

export interface IndustryDetail extends Industry {
  caseStudies: CaseStudySummary[];
}

/* ================================================================== posts == */

export interface Post extends ContentLifecycle {
  id: string;
  slug: string;
  kind: PostKind;
  title: string;
  excerpt: string;
  /** Rendered body. Null while the row is still only a slot. */
  body: string | null;
  /** Display date. Null renders "Coming soon", which is how the slots ship. */
  date: string | null;
  image: MediaRef | null;
  /** External URL when the piece lives elsewhere; otherwise null. */
  externalUrl: string | null;
  /** The one post the landing deck blows up into its 2×2 lead tile. */
  featured: boolean;
  position: number;
  readingMinutes: number | null;
  seo: SeoMeta;
}

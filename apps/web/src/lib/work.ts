/**
 * The Work page's view of the case studies.
 *
 * `case-study-details.ts` is the long-form brief for each project. This turns
 * a brief into what the portfolio needs to present it: what shape each capture
 * is, how the captures compose into a product visual, which filters the
 * project answers to, and the one-line fact strip under it.
 *
 * All of it is derived from the brief and the capture files — nothing is
 * written per project — so a project added to the details file shows up on the
 * Work page correctly filtered and composed, with no markup of its own. The
 * one curated input is `FEATURED_SLUGS`.
 */
import mediaManifest from "./case-study-media.json";
import { planMockups } from "./mockup-assign";
import type { CaseStudyDetail, DetailScreenshot } from "./case-study-details";
import {
  PROJECT_CATEGORIES,
  type ProjectCategory,
  type ProjectMedia,
  type Shot,
  type ShotKind,
  type WorkProject,
} from "./work-model";

/**
 * The flagship projects, in running order. Chosen for the strength of their
 * captures and to cover each kind of product the studio ships: a clinical ERP,
 * an AI automation product, an enterprise platform with a field app, a
 * government ERP, a consumer mobile app and an e-commerce product.
 */
export const FEATURED_SLUGS: string[] = [
  "integrated-healthcare-platform",
  "ai-medical-billing-automation",
  "qfs",
  "restate",
  "normies",
  "style-bytes",
];

/* Pixel sizes, written by `scripts/case-study-media.mjs`. */
const MEDIA = mediaManifest as Record<string, number[]>;

/** Reads a capture's kind from its shape. A phone screen is tall and narrow;
    a desktop screen is either large or screen-shaped; anything else — a
    700x250 strip of a form, a 151x202 card — is a crop of an interface. */
function classify(width: number, height: number): ShotKind {
  const ratio = width / height;
  if (ratio <= 0.62 && width <= 1300) return "mobile";
  if (width >= 1100 || (ratio >= 1.4 && ratio <= 2.1 && width >= 600)) {
    return "desktop";
  }
  return "crop";
}

/** Captures that are already composed renders — a laptop, a plant, floating
    cards — rather than screens. The CMS has no field for this, so they are
    named here by the end of their path; give the CMS a flag and this list can
    go. A new render only needs adding if it would otherwise lead a project. */
const PRESENTED_CAPTURES = [
  "/Integrated_Healthcare_Practice/ihp.webp",
  "/AI-Powered_Medical_Billing/ai-powered-mb.webp",
  "/MedSim/medsim.webp",
];

const isPresented = (src: string) =>
  PRESENTED_CAPTURES.some((tail) => decodeURIComponent(src).endsWith(tail));

/** Captures chosen to lead their project's visual, where the CMS hasn't
    flagged one. Same as above: give the CMS's `lead` flag priority and these
    can go once it is set there. */
const LEAD_CAPTURES = ["/AI-Powered_Medical_Billing/ai-powered-mb.webp"];

const isLead = (src: string) =>
  LEAD_CAPTURES.some((tail) => decodeURIComponent(src).endsWith(tail));

function resolveShot(shot: DetailScreenshot): Shot {
  /* The manifest first, then the size the CMS recorded on upload. A capture
     known to neither is treated as a 16:10 desktop screen — the commonest
     shape, and one that composes safely. */
  const [width, height] =
    MEDIA[shot.src] ??
    (shot.width && shot.height ? [shot.width, shot.height] : [1600, 1000]);
  return {
    src: shot.src,
    alt: shot.alt,
    width,
    height,
    ratio: width / height,
    kind: classify(width, height),
    lead: shot.lead || isLead(shot.src) || undefined,
    presented: isPresented(shot.src) || undefined,
  };
}

function composeMedia(shots: Shot[]): ProjectMedia {
  /* A capture the brief marks `lead` goes first. Otherwise the widest desktop
     capture leads; within 10% of each other, the brief's own order decides,
     since it lists the key screen first. A full raw screen (1100px and up)
     beats a composed render (`presented`); a narrow panel does not — the
     render is the better lead than a 700px strip of a form. */
  const widest = (candidates: Shot[]) =>
    candidates.reduce<Shot | null>(
      (best, s) => (!best || s.width > best.width * 1.1 ? s : best),
      null,
    );
  const desktops = shots.filter((s) => s.kind === "desktop");
  const primary =
    shots.find((s) => s.lead && s.kind !== "mobile") ??
    widest(desktops.filter((s) => !s.presented && s.width >= 1100)) ??
    widest(desktops.filter((s) => s.presented)) ??
    widest(desktops) ??
    shots.find((s) => s.kind === "crop") ??
    null;

  return {
    primary,
    supporting: shots
      .filter((s) => s !== primary && s.kind !== "mobile")
      .slice(0, 2),
    phones: shots.filter((s) => s.kind === "mobile").slice(0, 3),
  };
}

const metaValue = (d: CaseStudyDetail, label: RegExp) =>
  d.meta.find((m) => label.test(m.label))?.value ?? "";

/** A brief's "·"-separated value as its parts, trailing "— notes" dropped. */
export const metaParts = (value: string) =>
  value
    .split("·")
    .map((part) => part.split("—")[0].trim())
    .filter(Boolean);

function categorize(d: CaseStudyDetail, shots: Shot[]): ProjectCategory[] {
  const industry = metaValue(d, /^industry$/i);
  const service = metaValue(d, /^service$/i);
  const tech = metaValue(d, /technolog/i);
  const stats = d.stats.map((s) => `${s.value} ${s.label}`).join(" ");
  const has = (pattern: RegExp, ...texts: string[]) =>
    pattern.test(texts.join("\n"));

  const found = new Set<ProjectCategory>();

  if (has(/enterprise|\berp\b|\bcrm\b/i, d.sector, industry, service)) {
    found.add("enterprise");
  }
  if (
    shots.some((s) => s.kind === "desktop") ||
    has(/\bweb\b|portal|\bcms\b|dashboard|saas/i, service, tech, stats)
  ) {
    found.add("web");
  }
  if (
    shots.some((s) => s.kind === "mobile") ||
    has(
      /mobile|android|\bios\b|react native|app \+ web|web (?:&|and) mobile/i,
      service,
      tech,
      stats,
    )
  ) {
    found.add("mobile");
  }
  if (
    /\bAI\b/.test([d.title, d.sector, service].join("\n")) ||
    has(
      /artificial intelligence|machine learning|computer vision|generative|retrieval-augmented|\bnlp\b|\bllm\b|multi-agent/i,
      service,
      tech,
    )
  ) {
    found.add("ai");
  }
  if (has(/commerce|retail|marketplace|shoppable/i, d.sector, service)) {
    found.add("commerce");
  }
  if (has(/government|public sector/i, d.sector, industry)) {
    found.add("government");
  }
  if (has(/health|medical|clinic|pharma/i, d.sector, industry)) {
    found.add("healthcare");
  }

  return PROJECT_CATEGORIES.map((c) => c.id).filter((id) => found.has(id));
}

/** Industry · product type · capability, in the brief's own words. */
function factsFor(d: CaseStudyDetail): string[] {
  const service = metaParts(metaValue(d, /^service$/i)).map((s) =>
    s.replace(/\s+Development$/i, ""),
  );
  const tech = metaParts(metaValue(d, /technolog/i));
  const facts = [d.sector.split("·")[0].trim(), service[0], service[1] ?? tech[0]];
  return facts.filter(
    (fact, i): fact is string => Boolean(fact) && facts.indexOf(fact) === i,
  );
}

/* Domain first, then capability, then platform — so a tag line reads
   "Healthcare · Enterprise · Web Application". */
const TAG_ORDER: ProjectCategory[] = [
  "healthcare",
  "government",
  "commerce",
  "ai",
  "enterprise",
  "web",
  "mobile",
];

const TAG_LABEL: Record<ProjectCategory, string> = {
  healthcare: "Healthcare",
  government: "Government",
  commerce: "E-Commerce",
  ai: "AI",
  enterprise: "Enterprise",
  web: "Web Application",
  mobile: "Mobile",
};

function tagsFor(d: CaseStudyDetail, categories: ProjectCategory[]): string[] {
  const tags = TAG_ORDER.filter((c) => categories.includes(c))
    .slice(0, 3)
    .map((c) => TAG_LABEL[c]);
  return tags.length > 0 ? tags : [d.sector.split("·")[0].trim()];
}

/** Placeholder until `planMockups` has seen the whole set. */
const UNPLANNED: WorkProject["mockup"] = { scene: "floating-laptop", ground: "navy", mirror: false };

function toWorkProject(d: CaseStudyDetail): WorkProject {
  const shots = d.screenshots.map(resolveShot);
  const categories = categorize(d, shots);
  return {
    slug: d.slug,
    title: d.title,
    tagline: d.tagline,
    sector: d.sector,
    phase: d.phase,
    categories,
    facts: factsFor(d),
    tags: tagsFor(d, categories),
    media: composeMedia(shots),
    hasVisuals: shots.length > 0,
    mockup: UNPLANNED,
  };
}

/*
 * These were module constants derived from the bundled briefs. The briefs now
 * come from the CMS, so each one becomes a function over the fetched set —
 * the derivation is unchanged, it just takes its input as an argument instead
 * of reaching for an import.
 */

export function buildWorkProjects(details: CaseStudyDetail[]): WorkProject[] {
  const projects = details.map(toWorkProject);
  /* Scenes are planned over the order the portfolio grid shows — featured
     first, then those with captures — so neighbours on the page are the ones
     kept apart. Every page builds from the same set, so a project wears the
     same scene wherever it appears. */
  const featured = buildFeaturedProjects(projects);
  const plans = planMockups([
    ...featured,
    ...byVisuals(projects).filter((p) => !featured.includes(p)),
  ]);
  return projects.map((p) => ({ ...p, mockup: plans.get(p.slug) ?? UNPLANNED }));
}

export const buildFeaturedProjects = (projects: WorkProject[]): WorkProject[] =>
  FEATURED_SLUGS.map((slug) => projects.find((p) => p.slug === slug)).filter(
    (p): p is WorkProject => Boolean(p),
  );

/** Every project, those with captures first so the grid leads with product
    rather than placeholders. The brief order holds within each group. */
export const byVisuals = (projects: WorkProject[]): WorkProject[] =>
  [...projects].sort((a, b) => Number(b.hasVisuals) - Number(a.hasVisuals));

export const getWorkProject = (projects: WorkProject[], slug: string) =>
  projects.find((p) => p.slug === slug);

/** A project's captures with their shapes, in the brief's order. */
export function getProjectShots(detail: CaseStudyDetail | null | undefined): Shot[] {
  return detail ? detail.screenshots.map(resolveShot) : [];
}

/** The next project in the brief order that has captures to show, wrapping. */
export function getNextProject(projects: WorkProject[], slug: string): WorkProject | null {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) return null;
  const count = projects.length;
  for (let step = 1; step < count; step++) {
    const candidate = projects[(i + step) % count];
    if (candidate.hasVisuals) return candidate;
  }
  return projects[(i + 1) % count] ?? null;
}

/** Up to `count` other projects most like this one — shared categories first,
    then the same sector — with captures preferred, the brief order breaking
    ties. */
export function getRelatedProjects(
  projects: WorkProject[],
  slug: string,
  count = 3,
): WorkProject[] {
  const self = projects.find((p) => p.slug === slug);
  if (!self) return [];
  const sector = self.sector.split("·")[0].trim();
  const score = (p: WorkProject) =>
    p.categories.filter((c) => self.categories.includes(c)).length * 2 +
    (p.sector.split("·")[0].trim() === sector ? 3 : 0) +
    (p.hasVisuals ? 1 : 0);
  return projects
    .filter((p) => p.slug !== slug)
    .map((p, i) => ({ p, i, s: score(p) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, count)
    .map(({ p }) => p);
}

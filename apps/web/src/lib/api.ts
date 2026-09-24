/**
 * Server-side reads from the CMS API.
 *
 * Every function here runs on the server only — the API's public endpoints are
 * unauthenticated but the browser has no reason to talk to them directly, and
 * fetching on the server is what lets Next cache and revalidate the result.
 *
 * Two things make the "publish in the panel, see it on the site" loop work:
 *
 * `next: { tags }` files each response under a cache tag. The API's write path
 * calls /api/revalidate with the tags it touched, which purges every page that
 * declared them — so an edit to a case study re-renders the home deck, the
 * index, its own page and the industry pages that list it, without the API
 * knowing any of those routes exist.
 *
 * The adapters below return the exact shapes the components already consume.
 * That is deliberate: it keeps this migration to "where does the data come
 * from" rather than also rewriting every component's field access, which is a
 * much larger and riskier change to make in one step.
 */
import type {
  ApiResponse,
  CaseStudyDetail as ApiCaseStudyDetail,
  CaseStudySummary as ApiCaseStudySummary,
  Client as ApiClient,
  Industry as ApiIndustry,
  Leader as ApiLeader,
  MediaRef,
  Office as ApiOffice,
  Post as ApiPost,
  Service as ApiService,
  SocialLink as ApiSocialLink,
  Stat as ApiStat,
  Testimonial as ApiTestimonial,
} from "@funavry/types";
import type { StaticImageData } from "next/image";

import cmsSnapshot from "@/data/cms-snapshot.json";

import type { CaseStudy } from "./case-studies";
import type { CaseStudyDetail, DetailScreenshot } from "./case-study-details";
import type { Industry } from "./industries";
import type { Office } from "./offices";
import type { Post } from "./posts";
import type { Service } from "./services";

const API_URL =
  process.env.API_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000/api/v1";

/**
 * The CMS content as of the last `npm run cms:snapshot`, keyed by request path,
 * with its media served from the web app itself (see the script).
 *
 * A production build with no API configured reads it outright — that is how
 * the site deploys before the API has a public home. Where an API is
 * configured it is only the fallback for a call that failed: stale content
 * is a better outcome than a failed build or a 500, and unlike an empty list
 * it can't be mistaken for "this has no case studies".
 */
const SNAPSHOT = cmsSnapshot as Record<string, unknown>;
const SNAPSHOT_ONLY =
  process.env.NODE_ENV === "production" &&
  !process.env.API_URL &&
  !process.env.NEXT_PUBLIC_API_URL;

/** Mirrors the API's tag names. */
export const CacheTag = {
  CASE_STUDIES: "case-studies",
  SERVICES: "services",
  INDUSTRIES: "industries",
  POSTS: "posts",
  LEADERS: "leaders",
  TEAM: "team",
  OFFICES: "offices",
  CLIENTS: "clients",
  TESTIMONIALS: "testimonials",
  TECHNOLOGIES: "technologies",
  STATS: "stats",
  SOCIALS: "socials",
  SETTINGS: "settings",
} as const;

export type CacheTagValue = (typeof CacheTag)[keyof typeof CacheTag];

/** Thrown when the CMS could not be reached or answered with a server error. */
export class CmsUnavailableError extends Error {
  constructor(path: string, detail: string) {
    super(`[cms] ${path}: ${detail}`);
    this.name = "CmsUnavailableError";
  }
}

/**
 * Fetches and unwraps the API envelope.
 *
 * The important distinction is between a resource that is genuinely absent and
 * a call that failed. A 404 from the API means the slug does not exist, and the
 * page should render Next's not-found. Anything else — a connection refused, a
 * 500, a malformed body — means we do not know, and treating "we do not know"
 * as "it does not exist" is how a CMS restart during a build gets baked into a
 * permanently prerendered 404. That is not hypothetical; it is what happened
 * here before this distinction existed.
 *
 * So: a 404 returns null, and everything else throws. List endpoints opt back
 * into a soft failure with `fallback`, because a section rendering short is a
 * reasonable degradation where a hard 500 on the whole page is not.
 */
async function apiFetch<T>(
  path: string,
  tags: CacheTagValue[],
): Promise<T | null> {
  if (SNAPSHOT_ONLY) return (SNAPSHOT[path] as T | undefined) ?? null;

  try {
    return await fetchFromApi<T>(path, tags);
  } catch (error) {
    if (!(path in SNAPSHOT)) throw error;
    console.warn(`${String(error)} — serving the snapshot`);
    return SNAPSHOT[path] as T;
  }
}

async function fetchFromApi<T>(
  path: string,
  tags: CacheTagValue[],
): Promise<T | null> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      next: {
        tags,
        /* A safety net under the on-demand purge: if a revalidate call is ever
           lost — the API was mid-restart, the network blipped — the page is
           still no more than an hour stale rather than stale until the next
           deploy. */
        revalidate: 3600,
      },
      headers: { accept: "application/json" },
    });
  } catch (error) {
    throw new CmsUnavailableError(path, `unreachable (${String(error)})`);
  }

  /* A 404 means "no such record" only when the API itself says so. Any other
     404 — an HTML page from a host that isn't the API, say — is a
     misconfigured API_URL, and reading it as absence would build a site with
     every list empty and every detail page missing. */
  if (response.status === 404) {
    const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;
    if (body && body.success === false && body.error.code === "NOT_FOUND") return null;
    throw new CmsUnavailableError(path, "responded 404 without an API body — is API_URL right?");
  }

  if (!response.ok) {
    throw new CmsUnavailableError(path, `responded ${response.status}`);
  }

  let body: ApiResponse<T>;

  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new CmsUnavailableError(path, "returned an unreadable body");
  }

  if (!body.success) {
    if (body.error.code === "NOT_FOUND") return null;
    throw new CmsUnavailableError(path, `${body.error.code} ${body.error.message}`);
  }

  return body.data;
}

/**
 * A list read that degrades rather than failing the page.
 *
 * Used where an empty result is a survivable outcome — the clients marquee, the
 * testimonials carousel. Never used for the data a page's existence depends on.
 */
async function apiList<T>(path: string, tags: CacheTagValue[], fallback: T): Promise<T> {
  try {
    const data = await apiFetch<T>(path, tags);
    return data ?? fallback;
  } catch (error) {
    console.error(String(error));
    return fallback;
  }
}

/** A read whose failure must not be mistaken for absence. Throws. */
async function apiGet<T>(path: string, tags: CacheTagValue[]): Promise<T | null> {
  return apiFetch<T>(path, tags);
}

/**
 * Turns a MediaRef into something `next/image` can take as `src`.
 *
 * Shaped as StaticImageData rather than passed as a bare URL string so the
 * intrinsic dimensions and the blur placeholder survive — those are what stop
 * the frame reflowing and what the statically-imported images gave us for free.
 */
function toImage(media: MediaRef | null): StaticImageData | undefined {
  if (!media?.url) return undefined;

  return {
    src: media.url,
    width: media.width ?? 1600,
    height: media.height ?? 1000,
    blurDataURL: media.blurDataUrl ?? undefined,
    blurWidth: media.blurDataUrl ? 16 : undefined,
    blurHeight: media.blurDataUrl ? 10 : undefined,
  } as StaticImageData;
}

const imageUrl = (media: MediaRef | null): string => media?.url ?? "";

/* ========================================================== case studies == */

function toDeckCaseStudy(study: ApiCaseStudySummary): CaseStudy {
  return {
    slug: study.slug,
    title: study.title,
    tagline: study.tagline,
    sector: study.sector,
    phase: study.phase as CaseStudy["phase"],
    surface: study.surface as CaseStudy["surface"],
    frame: study.frame as CaseStudy["frame"],
    summary: study.summary,
    capabilities: study.capabilities.map((c) => c.label),
    image: toImage(study.image) as StaticImageData,
    mobileImage: toImage(study.mobileImage),
    callouts: study.callouts.length
      ? study.callouts.map((c) => ({
          label: c.label,
          icon: c.icon,
          at: { x: c.x, y: c.y },
        }))
      : undefined,
    highlights: study.highlights.length
      ? study.highlights.map((h) => ({ value: h.value, detail: h.detail }))
      : undefined,
    client: study.client ?? undefined,
    team: study.team ?? undefined,
    featured: study.featured,
  };
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const studies = await apiList<ApiCaseStudySummary[]>("/case-studies/public", [CacheTag.CASE_STUDIES], []);

  /* Only the ones with a capture belong on a deck built around one. */
  return studies.filter((s) => s.image).map(toDeckCaseStudy);
}

export async function getFeaturedCaseStudies(): Promise<CaseStudy[]> {
  const studies = await apiList<ApiCaseStudySummary[]>("/case-studies/public?featured=true", [CacheTag.CASE_STUDIES], []);

  return studies.filter((s) => s.image).map(toDeckCaseStudy);
}

function toDetail(study: ApiCaseStudyDetail): CaseStudyDetail {
  return {
    slug: study.slug,
    title: study.title,
    tagline: study.tagline,
    sector: study.sector,
    phase: study.phase as CaseStudyDetail["phase"],
    summary: study.summary,
    stats: study.stats.map((s) => ({ value: s.value, label: s.label })),
    meta: study.meta.map((m) => ({ label: m.label, value: m.value })),
    introHeading: study.introHeading,
    intro: study.intro,
    challengesLead: study.challengesLead,
    challenges: study.challenges.map((c) => ({
      title: c.title,
      challenge: c.challenge,
      solution: c.solution,
    })),
    resultsLead: study.resultsLead,
    results: study.results,
    screenshots: study.screenshots.map(
      (s): DetailScreenshot => ({
        src: imageUrl(s.media),
        alt: s.media.alt,
        fit: s.fit,
        lead: s.lead || undefined,
      }),
    ),
  };
}

export async function getCaseStudyDetails(): Promise<CaseStudyDetail[]> {
  const details = await apiList<ApiCaseStudyDetail[]>(
    "/case-studies/public/details",
    [CacheTag.CASE_STUDIES],
    [],
  );

  return details.map(toDetail);
}

export async function getCaseStudyDetail(slug: string): Promise<CaseStudyDetail | null> {
  const study = await apiGet<ApiCaseStudyDetail>(
    `/case-studies/public/${encodeURIComponent(slug)}`,
    [CacheTag.CASE_STUDIES],
  );

  return study ? toDetail(study) : null;
}

/** Slugs, for generateStaticParams. */
export async function getCaseStudySlugs(): Promise<string[]> {
  const studies = await apiList<ApiCaseStudySummary[]>("/case-studies/public", [CacheTag.CASE_STUDIES], []);

  return studies.map((s) => s.slug);
}

/* =============================================================== services == */

function toService(service: ApiService): Service {
  return {
    n: service.number,
    slug: service.slug,
    title: service.title,
    group: service.group as Service["group"],
    phase: service.phase as Service["phase"],
    icon: service.icon,
    summary: service.summary,
    subs: service.subs.map((s) => ({ title: s.title, desc: s.description })),
  };
}

export async function getServices(): Promise<Service[]> {
  const services = await apiList<ApiService[]>("/services/public", [CacheTag.SERVICES], []);
  return services.map(toService);
}

export async function getService(slug: string): Promise<{
  service: Service;
  caseStudySlugs: string[];
} | null> {
  const detail = await apiGet<ApiService & { caseStudies: ApiCaseStudySummary[] }>(
    `/services/public/${encodeURIComponent(slug)}`,
    [CacheTag.SERVICES, CacheTag.CASE_STUDIES],
  );

  if (!detail) return null;

  return {
    service: toService(detail),
    caseStudySlugs: (detail.caseStudies ?? []).map((c) => c.slug),
  };
}

/* ============================================================= industries == */

function toIndustry(industry: ApiIndustry): Industry {
  return {
    slug: industry.slug,
    name: industry.name,
    desc: industry.description,
    proof: industry.proof,
    image: imageUrl(industry.image),
  };
}

export async function getIndustries(): Promise<Industry[]> {
  const industries = await apiList<ApiIndustry[]>("/industries/public", [CacheTag.INDUSTRIES], []);

  return industries.map(toIndustry);
}

export async function getIndustry(slug: string): Promise<{
  industry: Industry;
  caseStudySlugs: string[];
} | null> {
  const detail = await apiGet<ApiIndustry & { caseStudies: ApiCaseStudySummary[] }>(
    `/industries/public/${encodeURIComponent(slug)}`,
    [CacheTag.INDUSTRIES, CacheTag.CASE_STUDIES],
  );

  if (!detail) return null;

  return {
    industry: toIndustry(detail),
    caseStudySlugs: (detail.caseStudies ?? []).map((c) => c.slug),
  };
}

/* ================================================================== posts == */

export async function getPosts(): Promise<Post[]> {
  const posts = await apiList<ApiPost[]>("/posts/public", [CacheTag.POSTS], []);

  return posts.map((post) => ({
    slug: post.slug,
    kind: post.kind as Post["kind"],
    title: post.title,
    excerpt: post.excerpt,
    /* A null date renders as "Coming soon" — the article slots ship without
       invented dates, and that stays true through the API. */
    date: post.date
      ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(post.date))
      : "Coming soon",
    image: imageUrl(post.image),
    href: post.externalUrl ?? "",
    featured: post.featured || undefined,
  }));
}

/* ================================================================ offices == */

export async function getOffices(): Promise<Office[]> {
  const offices = await apiList<ApiOffice[]>("/offices/public", [CacheTag.OFFICES], []);

  return offices.map((office) => ({
    flag: imageUrl(office.flag),
    country: office.country,
    city: office.city,
    role: office.role,
    blurb: office.blurb,
    address: office.addressLines,
    at: { lon: office.location.lon, lat: office.location.lat },
  }));
}

export async function getDeliveryCountries(): Promise<string[]> {
  const countries = await apiList<{ name: string }[]>("/delivery-countries/public", [CacheTag.OFFICES], []);

  return countries.map((c) => c.name);
}

/* ========================================================== people & org == */

export interface LeaderCard {
  name: string;
  role: string;
  initials: string;
  photo: string;
  points: string[];
}

export async function getLeaders(): Promise<LeaderCard[]> {
  const leaders = await apiList<ApiLeader[]>("/leaders/public", [CacheTag.LEADERS], []);

  return leaders.map((leader) => ({
    name: leader.name,
    role: leader.role,
    initials: leader.initials,
    photo: imageUrl(leader.photo),
    points: leader.points.map((p) => p.text),
  }));
}

export interface TestimonialCard {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
  pending?: boolean;
}

export async function getTestimonials(): Promise<TestimonialCard[]> {
  const testimonials = await apiList<ApiTestimonial[]>("/testimonials/public", [CacheTag.TESTIMONIALS], []);

  return testimonials.map((t) => ({
    quote: t.quote,
    author: t.author,
    role: t.role,
    company: t.company,
    image: imageUrl(t.avatar),
    /* Carried through, not dropped: the badge on an unapproved quote is what
       stops sample copy reading as a real endorsement. */
    pending: t.pending || undefined,
  }));
}

export interface ClientMark {
  name: string;
  src: string;
}

export async function getClients(): Promise<ClientMark[]> {
  const clients = await apiList<ApiClient[]>("/clients/public/clients", [CacheTag.CLIENTS], []);

  return clients
    .filter((c) => c.logo)
    .map((c) => ({ name: c.name, src: imageUrl(c.logo) }));
}

export async function getStats(group?: string): Promise<{ value: string; label: string }[]> {
  const stats = await apiList<ApiStat[]>("/stats/public", [CacheTag.STATS], []);

  return stats
    .filter((s) => !group || s.group === group)
    .map((s) => ({ value: s.value, label: s.label }));
}

export async function getSocials(): Promise<{ label: string; href: string; icon: string }[]> {
  const socials = await apiList<ApiSocialLink[]>("/social-links/public", [CacheTag.SOCIALS], []);

  return socials.map((s) => ({ label: s.label, href: s.url, icon: s.icon }));
}

/* ======================================================= cross-references == */

/**
 * The project ↔ taxonomy maps the service and industry pages cross-reference
 * against.
 *
 * Built from the detail responses, which name each project's industries and
 * practices directly — the associations are join tables in the CMS now, so
 * this reads them rather than inferring them from a brief's prose as the old
 * hand-maintained mapping did.
 */
export interface WorkIndex {
  details: CaseStudyDetail[];
  /** project slug → industry slugs */
  industriesByProject: Map<string, string[]>;
  /** project slug → service slugs */
  servicesByProject: Map<string, string[]>;
}

export async function getWorkIndex(): Promise<WorkIndex> {
  /* One request, not one per project. This runs on every work, service and
     industry page, so the fan-out it replaced cost several hundred requests per
     build — slow, and fragile in a way that mattered: a single failure among
     them silently produced a page with the wrong content. */
  const loaded = await apiList<ApiCaseStudyDetail[]>(
    "/case-studies/public/details",
    [CacheTag.CASE_STUDIES],
    [],
  );

  const details: CaseStudyDetail[] = [];
  const industriesByProject = new Map<string, string[]>();
  const servicesByProject = new Map<string, string[]>();

  for (const detail of loaded) {
    details.push(toDetail(detail));
    industriesByProject.set(detail.slug, detail.industrySlugs);
    servicesByProject.set(detail.slug, detail.serviceSlugs);
  }

  return { details, industriesByProject, servicesByProject };
}

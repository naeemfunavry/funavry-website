/**
 * How practices, industries and projects point at each other.
 *
 * This file used to carry the mapping itself: a hand-maintained
 * `SERVICE_WORK` record, plus a set of regexes matching each industry against
 * the prose in a brief's "Industry" meta row. Both are gone. The CMS holds
 * those associations as real rows now — a join table for services, another for
 * industries — so the API answers "which projects belong to this practice"
 * authoritatively and this file only has to arrange the answer.
 *
 * What remains here is the cross-referencing the API does not do: which
 * industries a practice has delivered into, and which practices sit behind an
 * industry's work. Both are derived from the same fetched sets, so they cannot
 * disagree with the pages that render them.
 */
import type { Industry } from "./industries";
import type { Service } from "./services";
import type { WorkProject } from "./work-model";

/**
 * Projects for a set of slugs, keeping the Work page's order — captures first,
 * so a section leads with product rather than typographic covers.
 */
export function projectsFor(
  projectsByVisuals: WorkProject[],
  slugs: Iterable<string>,
): WorkProject[] {
  const wanted = new Set(slugs);
  return projectsByVisuals.filter((p) => wanted.has(p.slug));
}

/** The neighbours in list order, wrapping — for the prev/next footer. */
export function neighbours<T>(list: T[], item: T): { prev: T; next: T } {
  const i = list.indexOf(item);
  return {
    prev: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}

/** Finds by slug, for pages that already hold the full set. */
export const findBySlug = <T extends { slug: string }>(list: T[], slug: string): T | undefined =>
  list.find((item) => item.slug === slug);

/**
 * Industries a practice has delivered into, most projects first.
 *
 * `industrySlugsByProject` comes from the API — each case study's detail
 * response names the industries it is filed under — so this counts real
 * associations rather than re-deriving them from prose.
 */
export function industriesForService(
  industries: Industry[],
  serviceProjectSlugs: string[],
  industrySlugsByProject: Map<string, string[]>,
): Industry[] {
  const counts = new Map<string, number>();

  for (const projectSlug of serviceProjectSlugs) {
    for (const industrySlug of industrySlugsByProject.get(projectSlug) ?? []) {
      counts.set(industrySlug, (counts.get(industrySlug) ?? 0) + 1);
    }
  }

  return industries
    .map((industry) => ({ industry, count: counts.get(industry.slug) ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((r) => r.industry);
}

/** Practices behind an industry's projects, most projects first. */
export function servicesForIndustry(
  services: Service[],
  industryProjectSlugs: string[],
  serviceSlugsByProject: Map<string, string[]>,
): Service[] {
  const counts = new Map<string, number>();

  for (const projectSlug of industryProjectSlugs) {
    for (const serviceSlug of serviceSlugsByProject.get(projectSlug) ?? []) {
      counts.set(serviceSlug, (counts.get(serviceSlug) ?? 0) + 1);
    }
  }

  return services
    .map((service) => ({ service, count: counts.get(service.slug) ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((r) => r.service);
}

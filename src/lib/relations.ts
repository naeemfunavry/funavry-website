/**
 * How the practices, the industries and the case studies point at each other,
 * for the service and industry detail pages.
 *
 * Industries are read off each brief's own "Industry" meta row, so a project
 * added to `case-study-details.ts` shows up on its industry pages untouched.
 * Services can't be read that way — the briefs describe deliverables ("Custom
 * CMS Development"), not practice names — so the one curated input here is
 * `SERVICE_WORK`. Practices with no published case study yet map to nothing
 * and their pages simply omit the work section.
 *
 * Server-only: this pulls in the full briefs.
 */
import { CASE_STUDY_DETAILS } from "./case-study-details";
import { INDUSTRIES, type Industry } from "./industries";
import { SERVICES, type Service } from "./services";
import { WORK_PROJECTS_BY_VISUALS } from "./work";
import type { WorkProject } from "./work-model";

/** Practice slug → case study slugs, strongest example first. */
const SERVICE_WORK: Record<string, string[]> = {
  "ai-automation": [
    "ai-orchestration-platform",
    "second-brain",
    "ai-medical-billing-automation",
    "ai-tax-assistant",
    "genai-marketing",
    "ai-nigraan",
    "ai-trading-assistant",
    "crypto-ai-hub",
  ],
  "digital-engineering": [
    "integrated-healthcare-platform",
    "restate",
    "qfs",
    "cnbc-arabia",
    "smart-municipality",
    "skillyah",
    "talentedxpert",
    "virtual-gym-trainer",
    "travel-expense-management",
    "global-claims",
  ],
  "blockchain-fintech": [
    "normies",
    "launchpad",
    "aivm",
    "crypto-ai-hub",
    "ai-trading-assistant",
    "ai-nft-generator",
  ],
  "immersive-technologies": ["medsim", "style-bytes"],
  "robotics-iot-computer-vision": [
    "ai-vehicle-classification",
    "secure-home",
    "contxtual",
    "style-bytes",
    "digital-agriculture-platform",
  ],
  "geospatial-ai": ["digital-agriculture-platform"],
  "data-business-intelligence": [
    "pharma-sales-intelligence",
    "construction-intelligence",
    "airline-financial-planning",
    "ai-nigraan",
  ],
  "finance-transformation": [
    "ai-medical-billing-automation",
    "travel-expense-management",
    "airline-financial-planning",
  ],
  "ai-process-transformation": [
    "ai-medical-billing-automation",
    "ai-orchestration-platform",
    "transportation-management-system",
    "dm-flow",
  ],
  "business-process-excellence": ["global-claims", "restate", "dm-flow"],
};

/** Industry slug → what that industry is called in a brief's Industry row,
    including the narrower names some briefs use ("Public Sector"). */
const INDUSTRY_MATCH: Record<string, RegExp> = {
  healthcare: /health|clinical|medical/i,
  "financial-services": /financ|fintech|blockchain|digital assets/i,
  media: /media|broadcast/i,
  government: /government|public sector/i,
  "supply-chain": /supply chain|logistic/i,
  manufacturing: /manufactur|consumer products/i,
  "industrial-iot": /industrial iot/i,
  education: /education/i,
  commerce: /commerce|marketplace/i,
  "enterprise-systems": /enterprise business/i,
};

const industryRow = (slug: string) =>
  CASE_STUDY_DETAILS.find((d) => d.slug === slug)?.meta.find((m) =>
    /^industry$/i.test(m.label),
  )?.value ?? "";

/* Projects keep the Work page's order — captures first — so a section leads
   with product rather than typographic covers. */
const projectsFor = (slugs: Set<string>): WorkProject[] =>
  WORK_PROJECTS_BY_VISUALS.filter((p) => slugs.has(p.slug));

export const getService = (slug: string) =>
  SERVICES.find((s) => s.slug === slug);

export const getIndustry = (slug: string) =>
  INDUSTRIES.find((i) => i.slug === slug);

export function getServiceWork(service: Service): WorkProject[] {
  return projectsFor(new Set(SERVICE_WORK[service.slug] ?? []));
}

export function getIndustryWork(industry: Industry): WorkProject[] {
  const match = INDUSTRY_MATCH[industry.slug];
  return projectsFor(
    new Set(
      CASE_STUDY_DETAILS.filter((d) => match?.test(industryRow(d.slug))).map(
        (d) => d.slug,
      ),
    ),
  );
}

/** Industries a practice has delivered into, most projects first. */
export function getServiceIndustries(service: Service): Industry[] {
  const work = SERVICE_WORK[service.slug] ?? [];
  return INDUSTRIES.map((industry) => ({
    industry,
    count: work.filter((slug) =>
      INDUSTRY_MATCH[industry.slug]?.test(industryRow(slug)),
    ).length,
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((r) => r.industry);
}

/** Practices behind an industry's projects, most projects first. */
export function getIndustryServices(industry: Industry): Service[] {
  const work = new Set(getIndustryWork(industry).map((p) => p.slug));
  return SERVICES.map((service) => ({
    service,
    count: (SERVICE_WORK[service.slug] ?? []).filter((slug) => work.has(slug))
      .length,
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((r) => r.service);
}

/** The neighbours in list order, wrapping — for the prev/next footer. */
export function neighbours<T>(list: T[], item: T): { prev: T; next: T } {
  const i = list.indexOf(item);
  return {
    prev: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}

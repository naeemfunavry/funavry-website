/**
 * The case studies, shared by the Work deck on the home page and the
 * /case-studies index. The deck runs FEATURED; the index runs all of them.
 *
 * Captures come from /public/case-studies/optimized — the delivered sources are
 * full-page PNGs and 4K photographs in six different shapes, cropped there to
 * one 16:10 frame so they read as one set. Replacing a screenshot means
 * re-running `node scripts/crop-case-studies.mjs`.
 *
 * Imported rather than referenced by path: Next then knows each file's real
 * dimensions and generates the blur placeholder, so the frame never reflows and
 * the image resolves instead of popping in.
 */
import type { StaticImageData } from "next/image";

import qfs from "../../public/case-studies/optimized/qfs.webp";
import globalClaims from "../../public/case-studies/optimized/global-claims.webp";
import contxtual from "../../public/case-studies/optimized/contxtual.webp";
import skillyah from "../../public/case-studies/optimized/skillyah.webp";
import cnbcArabia from "../../public/case-studies/optimized/cnbc-arabia.webp";
import smartMunicipality from "../../public/case-studies/optimized/smart-municipality.webp";

export type CaseStudy = {
  slug: string;
  title: string;
  /** Stands in for the client name, which is not ours to publish. */
  sector: string;
  /** Which phase of Build → Automate → Operate the work mostly sat in. */
  phase: "Build" | "Automate" | "Operate";
  summary: string;
  /** What the platform does. Never a metric — this work is not counted. */
  capabilities: string[];
  image: StaticImageData;
  /** The four the home page carries. The rest live on /case-studies. */
  featured?: boolean;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "qfs",
    title: "QFS — Quality & Food Safety Inspections",
    sector: "Food & Agriculture",
    phase: "Operate",
    summary:
      "Paper inspection forms replaced by a live quality system: deviations raised on the plant floor, corrective actions tracked to closure, and the whole programme visible to QA management as it happens.",
    capabilities: [
      "Digital inspection forms",
      "Deviation tracking",
      "Corrective actions",
      "Live QA dashboards",
    ],
    image: qfs,
    featured: true,
  },
  {
    slug: "global-claims",
    title: "Global Claims Management System",
    sector: "Supply Chain",
    phase: "Build",
    summary:
      "One claim, one workflow, every market. Sales, port QA, procurement, surveyors, and finance each pick the claim up in their own queue and hand it on — submission through to settlement, with the trail intact.",
    capabilities: [
      "Role-based queues",
      "Claim lifecycle",
      "Surveyor assignment",
      "Reporting & export",
    ],
    image: globalClaims,
    featured: true,
  },
  {
    slug: "contxtual",
    title: "Contxtual — Shoppable Video Commerce",
    sector: "Media",
    phase: "Automate",
    summary:
      "Streaming content turned into a storefront. Scenes are indexed frame by frame, the apparel in them matched to buyable products through AI-assisted visual search, and the placements sold as ad inventory.",
    capabilities: [
      "Scene indexing",
      "Visual product matching",
      "AI-assisted annotation",
      "Ad inventory",
    ],
    image: contxtual,
    featured: true,
  },
  {
    slug: "skillyah",
    title: "SkillYah — Skills Marketplace & Live Classrooms",
    sector: "Education",
    phase: "Build",
    summary:
      "A marketplace pairing people who have a skill with people who want it — live video classes and a shared whiteboard in the browser, and the admin, payments, and dispute tooling that keeps the market running.",
    capabilities: [
      "Live classrooms",
      "Collaborative whiteboard",
      "Marketplace & bookings",
      "Payments & disputes",
    ],
    image: skillyah,
    featured: true,
  },
  {
    slug: "cnbc-arabia",
    title: "CNBC Arabia News Portal",
    sector: "Media",
    phase: "Build",
    summary:
      "A right-to-left Arabic business news portal, where live market data — indices, movers, and tickers — is published alongside the newsroom's editorial feed.",
    capabilities: [
      "Right-to-left Arabic",
      "Live market data",
      "Editorial publishing",
      "High-traffic delivery",
    ],
    image: cnbcArabia,
  },
  {
    slug: "smart-municipality",
    title: "Smart Municipality — Citizen Services Portal",
    sector: "Public Sector",
    phase: "Build",
    summary:
      "Municipal services in one place: residents apply, file an instant report, and follow an application through to completion, while the municipality works the same cases from a single desk. Bilingual throughout.",
    capabilities: [
      "Citizen self-service",
      "Application tracking",
      "Case management",
      "Arabic & English",
    ],
    image: smartMunicipality,
  },
];

export const FEATURED_CASE_STUDIES = CASE_STUDIES.filter((c) => c.featured);

/** Each phase keeps its colour, as it does everywhere else on the site. */
export const CASE_PHASE = {
  Build: { text: "text-azure-ink", dot: "bg-azure", tint: "68,158,216" },
  Automate: { text: "text-amber-ink", dot: "bg-amber", tint: "245,159,19" },
  Operate: { text: "text-steel-ink", dot: "bg-steel", tint: "55,96,121" },
} as const;

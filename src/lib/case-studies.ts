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
  /**
   * What kind of window the capture belongs in. Every one of these is a desktop
   * web interface — there are no mobile or tablet captures — so the only honest
   * distinction left is who the thing was built for: `site` is public and gets
   * browser chrome, `app` is signed-in and gets an application toolbar. Anything
   * finer than that would be a device the screenshot never came from.
   */
  surface: "site" | "app";
  /**
   * What the capture is presented *in* on the home deck. Purely rhythm: a deck
   * where every card wears the same body reads as a template, so the frames
   * alternate.
   *
   * This is allowed to be an aesthetic choice in a way `surface` is not, and the
   * line between them is worth keeping straight. A laptop asserts nothing — all
   * six of these are desktop web apps, and a laptop is exactly where you'd use
   * one. A phone or tablet frame would assert a product that doesn't exist, and
   * there are no portrait captures anywhere in this repo to put in one. So:
   * laptop and window, and nothing that claims a device we never shipped.
   */
  frame: "laptop" | "window";
  summary: string;
  /** What the platform does. Never a metric — this work is not counted. */
  capabilities: string[];
  image: StaticImageData;
  /**
   * Leader-line callouts over the capture, on the home deck only.
   *
   * Two rules, and both are load-bearing:
   *
   * `label` must be one of this study's own `capabilities`, verbatim. A callout
   * is a claim about a client's system printed on a picture of it, so it does
   * not get its own copy — "AI-Powered Claims Processing" over a claims system
   * with no AI in it is not a flourish, it's a lie about delivered work.
   *
   * `at` is where that capability is actually *visible* in the capture, as a
   * fraction of the capture itself — so the line lands on the thing it names:
   * the sidebar rail for role-based queues, the literal Surveyor Assignment nav
   * item for surveyor assignment. If a capability isn't on screen it doesn't get
   * a callout. Keep `at.x` under ~0.3: the chip hangs to the *left* of its
   * anchor, and past that it stops clearing the window and sits on the capture.
   */
  callouts?: { label: string; icon: string; at: { x: number; y: number } }[];
  /** The four the home page carries. The rest live on /case-studies. */
  featured?: boolean;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "qfs",
    title: "QFS — Quality & Food Safety Inspections",
    sector: "Food & Agriculture",
    phase: "Operate",
    surface: "app",
    frame: "window",
    summary:
      "Paper inspection forms replaced by a live quality system: deviations raised on the plant floor, corrective actions tracked to closure, and the whole programme visible to QA management as it happens.",
    capabilities: [
      "Digital inspection forms",
      "Deviation tracking",
      "Corrective actions",
      "Live QA dashboards",
    ],
    callouts: [
      // The "Form History" rail item.
      {
        label: "Digital inspection forms",
        icon: "ClipboardList",
        at: { x: 0.07, y: 0.285 },
      },
      // The "573 Deviations (Today)" counter.
      {
        label: "Deviation tracking",
        icon: "TriangleAlert",
        at: { x: 0.27, y: 0.21 },
      },
      // The "Overall Activity Stats" chart.
      {
        label: "Live QA dashboards",
        icon: "BarChart3",
        at: { x: 0.2, y: 0.8 },
      },
    ],
    image: qfs,
    featured: true,
  },
  {
    slug: "global-claims",
    title: "Global Claims Management System",
    sector: "Supply Chain",
    phase: "Build",
    surface: "app",
    frame: "laptop",
    summary:
      "One claim, one workflow, every market. Sales, port QA, procurement, surveyors, and finance each pick the claim up in their own queue and hand it on — submission through to settlement, with the trail intact.",
    capabilities: [
      "Role-based queues",
      "Claim lifecycle",
      "Surveyor assignment",
      "Reporting & export",
    ],
    callouts: [
      // The sidebar rail itself — Admin, DM Sales, Port QA, Procurement, Finance.
      { label: "Role-based queues", icon: "Users", at: { x: 0.12, y: 0.35 } },
      // The counter row IS the lifecycle: Submitted, In Progress, Rejected,
      // Completed, Draft. The line lands on its first stage.
      { label: "Claim lifecycle", icon: "GitBranch", at: { x: 0.25, y: 0.16 } },
      // The literal "Surveyor Assignment" nav item.
      {
        label: "Surveyor assignment",
        icon: "ClipboardCheck",
        at: { x: 0.12, y: 0.85 },
      },
    ],
    image: globalClaims,
    featured: true,
  },
  {
    slug: "contxtual",
    title: "Contxtual — Shoppable Video Commerce",
    sector: "Media",
    phase: "Automate",
    surface: "app",
    frame: "window",
    summary:
      "Streaming content turned into a storefront. Scenes are indexed frame by frame, the apparel in them matched to buyable products through AI-assisted visual search, and the placements sold as ad inventory.",
    capabilities: [
      "Scene indexing",
      "Visual product matching",
      "AI-assisted annotation",
      "Ad inventory",
    ],
    callouts: [
      // The "Annotator" rail item — the one place this set's AI claim is real.
      {
        label: "AI-assisted annotation",
        icon: "Sparkles",
        at: { x: 0.07, y: 0.415 },
      },
      // The indexed-episode card: season, episode, "91% Indexed".
      { label: "Scene indexing", icon: "Film", at: { x: 0.28, y: 0.245 } },
      // The scene frame, with its product markers dotted onto the apparel.
      {
        label: "Visual product matching",
        icon: "ScanSearch",
        at: { x: 0.3, y: 0.66 },
      },
    ],
    image: contxtual,
    featured: true,
  },
  {
    slug: "skillyah",
    title: "SkillYah — Skills Marketplace & Live Classrooms",
    sector: "Education",
    phase: "Build",
    surface: "app",
    frame: "laptop",
    summary:
      "A marketplace pairing people who have a skill with people who want it — live video classes and a shared whiteboard in the browser, and the admin, payments, and dispute tooling that keeps the market running.",
    capabilities: [
      "Live classrooms",
      "Collaborative whiteboard",
      "Marketplace & bookings",
      "Payments & disputes",
    ],
    callouts: [
      // The "Skillers" rail item — the marketplace's own directory.
      {
        label: "Marketplace & bookings",
        icon: "Store",
        at: { x: 0.11, y: 0.4 },
      },
      // The "Lectures" rail item.
      { label: "Live classrooms", icon: "Video", at: { x: 0.11, y: 0.645 } },
      // "Transactions" and "Disputes", which sit together at the rail's foot.
      { label: "Payments & disputes", icon: "Scale", at: { x: 0.11, y: 0.89 } },
    ],
    image: skillyah,
    featured: true,
  },
  {
    slug: "cnbc-arabia",
    title: "CNBC Arabia News Portal",
    sector: "Media",
    phase: "Build",
    surface: "site",
    frame: "window",
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
    surface: "site",
    frame: "window",
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

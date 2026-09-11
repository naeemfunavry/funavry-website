/**
 * The case studies, shared by the Work deck on the home page and the
 * /case-studies index. The deck runs FEATURED; the index runs all of them.
 *
 * Copy — titles, summaries, capabilities, highlights — follows the portfolio
 * content briefs (Funavry_Portfolio_Page_Content_MASTER_1.pdf), the same
 * source of truth as the per-project detail pages in case-study-details.ts,
 * so the deck, the index cards, and the detail pages tell one story.
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

/* Portrait captures of the two products that also shipped a mobile surface.
   Unlike the desktop set these are not produced by crop-case-studies.mjs — its
   JOBS list is explicit and writes 16:10 only, so these were added to
   /optimized by hand and the script will neither regenerate nor overwrite them.
   Add the phone capture there and a `mobileImage` line below; do not add a job
   for it, or the next run will crop the phone to a landscape frame. */
import qfsMobile from "../../public/case-studies/optimized/qfs-mobile.webp";
import cnbcArabiaMobile from "../../public/case-studies/optimized/cnbc-arabia-mobile.webp";

export type CaseStudy = {
  slug: string;
  title: string;
  /**
   * The one-line "what it is", shown as the subheading under the title on the
   * home deck and the index card — the same string the detail page's hero runs,
   * so the three surfaces open with one identical heading → subheading →
   * paragraph. Kept verbatim in sync with `tagline` in case-study-details.ts.
   */
  tagline: string;
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
   * The product's mobile surface, where one shipped — a real portrait capture,
   * never a crop of the desktop one.
   *
   * This is the field that earns a phone frame. The note on `frame` above holds:
   * a device on the page is a claim about what was built, so a study without
   * this key gets no phone, and nothing stands in for the missing capture. Two
   * of the six have one today; the other four are desktop-only work and should
   * look it.
   */
  mobileImage?: StaticImageData;
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
  /**
   * Portfolio highlights, taken verbatim from Section 03 of the corporate deck
   * (`Funavry_Corporate_Deck_v3.0`). These are the one place a metric is allowed
   * on the home deck: they are approved facts from the deck, not numbers invented
   * for the site. Shown as the floating stat cards on the Work showcase — `value`
   * is the headline, `detail` the context line beneath it. Featured studies only.
   */
  highlights?: { value: string; detail: string }[];
  /** The delivery footprint the deck prints beside each engagement. */
  client?: string;
  team?: string;
  /** The four the home page carries. The rest live on /case-studies. */
  featured?: boolean;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "qfs",
    title: "QFS — Quality Inspection & Food Safety",
    tagline: "A quality inspection & food safety application",
    sector: "Manufacturing",
    phase: "Operate",
    surface: "app",
    frame: "window",
    summary:
      "Paper-based quality checks replaced by a digital quality-inspection and food-safety platform: no-code check-sheets configured per facility, offline mobile capture on the production floor, and real-time deviation and corrective-action dashboards — live across 14 plants in the US and MENA.",
    capabilities: [
      "No-code inspection forms",
      "Deviation tracking",
      "Corrective actions",
      "Offline mobile capture",
      "Live QA dashboards",
    ],
    callouts: [
      // The "Form History" rail item.
      {
        label: "No-code inspection forms",
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
    highlights: [
      { value: "14 Plants", detail: "US + MENA" },
      { value: "No-Code Forms", detail: "Per-Facility Config" },
      { value: "Offline Mobile", detail: "Field Inspection" },
    ],
    client: "US · UAE · KSA",
    team: "10+ Engineers",
    image: qfs,
    mobileImage: qfsMobile,
    featured: true,
  },
  {
    slug: "global-claims",
    title: "Global Claims Management System",
    tagline: "An end-to-end, multi-region claims workflow platform",
    sector: "Supply Chain",
    phase: "Build",
    surface: "app",
    frame: "laptop",
    summary:
      "Excel-based claim tracking replaced by a standardized, global workflow platform: claims move from creation through review, survey, approval, and settlement, routed across Sales, QA, Procurement, Regional Office, Surveyors, and Finance under a configurable, multi-level approval matrix.",
    capabilities: [
      "Claim lifecycle",
      "Role-based routing",
      "Approval matrix",
      "Surveyor assignment",
      "Dashboards & reporting",
    ],
    callouts: [
      // The sidebar rail itself — Admin, DM Sales, Port QA, Procurement, Finance.
      { label: "Role-based routing", icon: "Users", at: { x: 0.12, y: 0.35 } },
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
    highlights: [
      { value: "End-to-End", detail: "Claim Lifecycle" },
      { value: "Approval Matrix", detail: "Multi-Level Routing" },
      { value: "Global Rollout", detail: "Regions · Sites" },
    ],
    client: "United States",
    team: "6+ Engineers",
    image: globalClaims,
    featured: true,
  },
  {
    slug: "contxtual",
    title: "Contxtual — Shoppable Video Commerce",
    tagline: "A shoppable video commerce platform",
    sector: "Media",
    phase: "Automate",
    surface: "app",
    frame: "window",
    summary:
      "Streaming content transformed into a storefront: computer-vision scene analysis detects on-screen clothing and accessories frame by frame, AI visual-similarity matching connects them to purchasable retail products, and streamers gain a new revenue channel without added commercials.",
    capabilities: [
      "Scene analysis",
      "Visual product matching",
      "AI-assisted annotation",
      "In-video product discovery",
    ],
    callouts: [
      // The "Annotator" rail item — the one place this set's AI claim is real.
      {
        label: "AI-assisted annotation",
        icon: "Sparkles",
        at: { x: 0.07, y: 0.415 },
      },
      // The indexed-episode card: season, episode, "91% Indexed".
      { label: "Scene analysis", icon: "Film", at: { x: 0.28, y: 0.245 } },
      // The scene frame, with its product markers dotted onto the apparel.
      {
        label: "Visual product matching",
        icon: "ScanSearch",
        at: { x: 0.3, y: 0.66 },
      },
    ],
    image: contxtual,
  },
  {
    slug: "skillyah",
    title: "SkillYah — One-to-One Tutoring Marketplace",
    tagline: "An online one-to-one tutoring marketplace",
    sector: "Education",
    phase: "Build",
    surface: "app",
    frame: "laptop",
    summary:
      "An online marketplace connecting students with expert tutors for one-to-one live lessons — three role-based portals for students, tutors, and administrators, managing the full journey from discovery and booking through scheduling, payment, live video lessons, and post-lesson reviews.",
    capabilities: [
      "Role-based portals",
      "Tutor discovery & booking",
      "Live video lessons",
      "Payments & cancellations",
      "Reviews & messaging",
    ],
    callouts: [
      // The "Skillers" rail item — the marketplace's own directory.
      {
        label: "Tutor discovery & booking",
        icon: "Store",
        at: { x: 0.11, y: 0.4 },
      },
      // The "Lectures" rail item.
      { label: "Live video lessons", icon: "Video", at: { x: 0.11, y: 0.645 } },
      // "Transactions" and "Disputes", which sit together at the rail's foot.
      {
        label: "Payments & cancellations",
        icon: "Scale",
        at: { x: 0.11, y: 0.89 },
      },
    ],
    image: skillyah,
  },
  {
    slug: "cnbc-arabia",
    title: "CNBC Arabia News Portal",
    tagline: "A high-traffic, bilingual business & financial news platform",
    sector: "Media",
    phase: "Build",
    surface: "site",
    frame: "window",
    summary:
      "A high-traffic, bilingual business and financial news platform — breaking news, live market data, and stock quotes across web and mobile, built on a custom CMS with Elasticsearch-powered search and engineered to scale to over a million hits per day.",
    capabilities: [
      "Custom editorial CMS",
      "Elasticsearch search",
      "Live market data",
      "Bilingual Arabic & English",
    ],
    highlights: [
      { value: "1M+", detail: "Hits per Day" },
      { value: "Live Market Data", detail: "Tickers · Indices" },
      { value: "Elasticsearch", detail: "Instant Search" },
    ],
    client: "United States",
    team: "10+ Engineers",
    image: cnbcArabia,
    mobileImage: cnbcArabiaMobile,
    featured: true,
  },
  {
    slug: "smart-municipality",
    title: "Smart Municipality — Citizen Services & Municipal CRM",
    tagline: "A citizen services & municipal CRM platform",
    sector: "Public Sector",
    phase: "Build",
    surface: "site",
    frame: "window",
    summary:
      "Citizen services moved online through a bilingual app and web experience backed by a municipal CRM: residents request, pay for, and track services from a single app — with UAE Pass digital identity, Tahseel payments, and multi-level, role-based routing across departments.",
    capabilities: [
      "Citizen self-service",
      "UAE Pass & Tahseel payments",
      "Multi-level CRM routing",
      "Instant issue reporting",
      "Arabic & English",
    ],
    highlights: [
      { value: "Bilingual", detail: "Arabic · English" },
      { value: "Citizen CRM", detail: "Multi-Level Workflow" },
      { value: "App + Web", detail: "Online Services" },
    ],
    client: "United Arab Emirates",
    team: "10+ Engineers",
    image: smartMunicipality,
    featured: true,
  },
];

export const FEATURED_CASE_STUDIES = CASE_STUDIES.filter((c) => c.featured);

/** Each phase keeps its colour, as it does everywhere else on the site. */
export const CASE_PHASE = {
  Build: { text: "text-azure-ink", dot: "bg-azure", tint: "68,158,216" },
  Automate: { text: "text-amber-ink", dot: "bg-amber", tint: "245,159,19" },
  Operate: { text: "text-steel-ink", dot: "bg-steel", tint: "55,96,121" },
} as const;

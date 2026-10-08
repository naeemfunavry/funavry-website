/**
 * The eleven industries Funavry delivers into, shared by the Industries section
 * and the nav mega-menu. Verbatim from the section — do not invent entries.
 * Ordered as the site lists them; the CMS carries the same order.
 */
export type Industry = {
  /** URL segment of the industry page, `/industries/[slug]`. */
  slug: string;
  name: string;
  /** Two lines on the card. Anything longer is clipped, so it's written to fit. */
  desc: string;
  proof: string;
  image: string;
  /** A 16px blurred copy of `image` as a data URL, shown while it loads. */
  blur?: string;
};

/**
 * A wide hero photograph per industry, keyed by slug, for the industry detail
 * page's `DetailHero` only. The `image` on each entry is portrait — it is sized
 * for the 4:5 tiles in the Industries section and the nav mega-menu, so in the
 * wide hero it cover-crops to a thin vertical slice. These are 1920×800 (the
 * hero's shape) so the photo reads whole under the ink-to-clear fade instead.
 * Same source as `image` (Unsplash, free for commercial use); an industry with
 * no entry here falls back to its portrait `image`. Files in /public/industries/hero.
 */
export const INDUSTRY_HERO_IMAGES: Record<string, string> = {
  healthcare: "/industries/hero/healthcare.webp",
  "financial-services": "/industries/hero/financial-services.webp",
  government: "/industries/hero/government.webp",
  "industrial-iot": "/industries/hero/industrial-iot.webp",
  "supply-chain": "/industries/hero/supply-chain.webp",
  commerce: "/industries/hero/commerce.webp",
  "enterprise-systems": "/industries/hero/enterprise-systems.webp",
  media: "/industries/hero/media.webp",
  education: "/industries/hero/education.webp",
  manufacturing: "/industries/hero/manufacturing.webp",
  agriculture: "/industries/hero/agriculture.webp",
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "healthcare",
    name: "Healthcare & Life Sciences",
    desc: "EHR, claims automation and telehealth — built inside HIPAA, HL7 and SureScripts.",
    proof: "Mayo Clinic · CitiMed",
    image: "/industries/healthcare.webp",
  },
  {
    slug: "financial-services",
    name: "Financial Services & FinTech",
    desc: "Digital banking, payments and blockchain rails bridging traditional finance and Web3.",
    proof: "Al Jazeera Finance · LodgeiT",
    image: "/industries/financial.webp",
  },
  {
    slug: "government",
    name: "Government & Public Sector",
    desc: "Citizen service platforms, e-government CRM and smart municipality programmes.",
    proof: "Ministry of Housing · DWTC",
    image: "/industries/government.webp",
  },
  {
    slug: "industrial-iot",
    name: "Industrial IoT, Automation & Connected Operations",
    desc: "Connected operations — IoT platforms, computer vision and predictive maintenance.",
    proof: "Digital twins",
    image: "/industries/industrial-iot.webp",
  },
  {
    slug: "supply-chain",
    name: "Supply Chain, Logistics & Operations",
    desc: "Transport, warehousing and distribution platforms with predictive analytics.",
    proof: "Del Monte",
    image: "/industries/supply-chain.webp",
  },
  {
    slug: "commerce",
    name: "Commerce, Retail & Digital Marketplaces",
    desc: "Enterprise e-commerce, multi-vendor marketplaces and AI-driven product discovery.",
    proof: "Style Bytes · Contxtual",
    image: "/industries/commerce.webp",
  },
  {
    slug: "enterprise-systems",
    name: "Enterprise Business Systems",
    desc: "ERP, CRM, HRMS and workflow automation running entire organisations.",
    proof: "EY · Systems Limited",
    image: "/industries/enterprise.webp",
  },
  {
    slug: "media",
    name: "Media, Broadcasting & Infotainment",
    desc: "News, streaming and audience platforms engineered for a million hits a day.",
    proof: "CNBC Arabia",
    image: "/industries/media.webp",
  },
  {
    slug: "education",
    name: "Education & Workforce Development",
    desc: "Learning platforms, tutoring marketplaces and simulation-based training.",
    proof: "Manchester Met · SkillYah",
    image: "/industries/education.webp",
  },
  {
    slug: "manufacturing",
    name: "Consumer Products & Manufacturing",
    desc: "Quality management, traceability and vision-based inspection across production plants.",
    proof: "14 plants, US + MENA",
    image: "/industries/manufacturing.webp",
  },
  {
    slug: "agriculture",
    name: "AgriTech",
    desc: "Digital agriculture: crop diagnostics, satellite and geospatial analytics, and AI advisory that reaches farmers in the field.",
    proof: "Crop diagnostics · Satellite analytics",
    image: "/industries/agriculture.webp",
  },
];

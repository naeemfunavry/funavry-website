/**
 * The ten industries Funavry delivers into, shared by the Industries section
 * and the nav mega-menu. Verbatim from the section — do not invent entries.
 */
export type Industry = {
  name: string;
  /** Two lines on the card. Anything longer is clipped, so it's written to fit. */
  desc: string;
  proof: string;
  image: string;
};

export const INDUSTRIES: Industry[] = [
  {
    name: "Healthcare & Life Sciences",
    desc: "EHR, claims automation and telehealth — built inside HIPAA, HL7 and SureScripts.",
    proof: "Mayo Clinic · CitiMed",
    image: "/industries/healthcare.jpg",
  },
  {
    name: "Financial Services & FinTech",
    desc: "Digital banking, payments and blockchain rails bridging traditional finance and Web3.",
    proof: "Al Jazeera Finance · LodgeiT",
    image: "/industries/financial.jpg",
  },
  {
    name: "Media, Broadcasting & Infotainment",
    desc: "News, streaming and audience platforms engineered for a million hits a day.",
    proof: "CNBC Arabia",
    image: "/industries/media.jpg",
  },
  {
    name: "Government & Public Sector",
    desc: "Citizen service platforms, e-government CRM and smart municipality programmes.",
    proof: "Ministry of Housing · DWTC",
    image: "/industries/government.jpg",
  },
  {
    name: "Supply Chain, Logistics & Operations",
    desc: "Transport, warehousing and distribution platforms with predictive analytics.",
    proof: "Del Monte",
    image: "/industries/supply-chain.jpg",
  },
  {
    name: "Consumer Products & Manufacturing",
    desc: "Quality management, traceability and vision-based inspection across production plants.",
    proof: "14 plants, US + MENA",
    image: "/industries/manufacturing.jpg",
  },
  {
    name: "Industrial IoT, Automation & Connected Operations",
    desc: "Connected operations — IoT platforms, computer vision and predictive maintenance.",
    proof: "Digital twins",
    image: "/industries/industrial-iot.jpg",
  },
  {
    name: "Education & Workforce Development",
    desc: "Learning platforms, tutoring marketplaces and simulation-based training.",
    proof: "Manchester Met · SkillYah",
    image: "/industries/education.jpg",
  },
  {
    name: "Commerce, Retail & Digital Marketplaces",
    desc: "Enterprise e-commerce, multi-vendor marketplaces and AI-driven product discovery.",
    proof: "Style Bytes · Contxtual",
    image: "/industries/commerce.jpg",
  },
  {
    name: "Enterprise Business Systems",
    desc: "ERP, CRM, HRMS and workflow automation running entire organisations.",
    proof: "EY · Systems Limited",
    image: "/industries/enterprise.jpg",
  },
];

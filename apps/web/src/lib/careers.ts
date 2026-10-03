/* Open positions on the Careers page.

   PLACEHOLDER ROLES — replace with the real openings before launch. Remove a
   role by deleting its entry; the department and location filters are built
   from whatever is listed here, so they never offer an empty choice. */

export type Job = {
  /** Stable key, used for the anchor too. */
  id: string;
  title: string;
  department: string;
  location: string;
  /** On-site, Hybrid or Remote. */
  mode: "On-site" | "Hybrid" | "Remote";
  type: "Full-time" | "Contract" | "Internship";
  /** One line on the role. */
  summary: string;
  skills: string[];
  /** ISO date, shown as "3 days ago". */
  posted: string;
};

export const JOBS: Job[] = [
  {
    id: "senior-full-stack-developer",
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Islamabad, Pakistan",
    mode: "Hybrid",
    type: "Full-time",
    summary: "Design and ship end-to-end features across our web platforms and APIs.",
    skills: ["Node.js", "React", "AWS"],
    posted: "2026-10-01",
  },
  {
    id: "ai-ml-engineer",
    title: "AI / ML Engineer",
    department: "Engineering",
    location: "Islamabad, Pakistan",
    mode: "Remote",
    type: "Full-time",
    summary: "Build LLM-powered agents and retrieval pipelines that run in production.",
    skills: ["Python", "LLMs", "RAG"],
    posted: "2026-09-30",
  },
  {
    id: "mobile-developer",
    title: "Mobile Developer",
    department: "Engineering",
    location: "Islamabad, Pakistan",
    mode: "On-site",
    type: "Full-time",
    summary: "Craft fast, polished cross-platform apps for enterprise clients.",
    skills: ["React Native", "TypeScript", "Firebase"],
    posted: "2026-09-27",
  },
  {
    id: "product-manager",
    title: "Product Manager",
    department: "Product",
    location: "Islamabad, Pakistan",
    mode: "Hybrid",
    type: "Full-time",
    summary: "Own the roadmap for a client platform, from discovery to delivery.",
    skills: ["Strategy", "Roadmap", "Agile"],
    posted: "2026-09-28",
  },
  {
    id: "ui-ux-designer",
    title: "UI / UX Designer",
    department: "Design",
    location: "Islamabad, Pakistan",
    mode: "Remote",
    type: "Full-time",
    summary: "Turn complex workflows into clear, accessible product experiences.",
    skills: ["Figma", "User Research", "Prototyping"],
    posted: "2026-09-26",
  },
  {
    id: "project-manager",
    title: "Project Manager",
    department: "Project Management",
    location: "Riyadh, Saudi Arabia",
    mode: "On-site",
    type: "Full-time",
    summary: "Lead delivery for enterprise engagements across teams and time zones.",
    skills: ["PMP", "Scrum", "Stakeholders"],
    posted: "2026-09-24",
  },
  {
    id: "sqa-engineer",
    title: "SQA Engineer",
    department: "QA & Testing",
    location: "Islamabad, Pakistan",
    mode: "Hybrid",
    type: "Full-time",
    summary: "Own test strategy and automation for web and mobile releases.",
    skills: ["Playwright", "Cypress", "API Testing"],
    posted: "2026-09-22",
  },
  {
    id: "business-development-executive",
    title: "Business Development Executive",
    department: "Business & Operations",
    location: "New York, USA",
    mode: "Remote",
    type: "Full-time",
    summary: "Grow relationships with enterprise and government clients.",
    skills: ["B2B Sales", "CRM", "Proposals"],
    posted: "2026-09-20",
  },
];

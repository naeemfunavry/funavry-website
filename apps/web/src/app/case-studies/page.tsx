import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Contact from "@/components/sections/Contact";
import WorkHero, { type WorkHeroStat } from "@/components/work/WorkHero";
import WorkShowcase from "@/components/work/WorkShowcase";
import { getIndustries, getWorkIndex } from "@/lib/api";
import {
  buildFeaturedProjects,
  byVisuals,
  buildWorkProjects,
} from "@/lib/work";
import type { Shot, WorkProject } from "@/lib/work-model";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "Our Work",
  description:
    "Enterprise platforms, AI products and mobile applications Funavry has designed, engineered and deployed for organizations solving complex problems.",
};

/* The company's published figures — the same ones the home page's Proof
   section and the About page carry — plus the industries the site lists. */
const heroStats = (industryCount: number): WorkHeroStat[] => [
  { value: 500, suffix: "+", label: "Projects Delivered" },
  { value: industryCount, label: "Industries" },
  { value: 2018, label: "Founded", count: false },
];

/** The hero's capture wall: each project's lead screen, where it is a
    screen-shaped desktop capture — a full-page scroll or a phone would break
    the wall's rhythm. */
const wallShots = (projects: WorkProject[]): Shot[] =>
  projects
    .map((p) => p.media.primary)
    .filter(
      (s): s is Shot =>
        s !== null && s.kind === "desktop" && s.ratio >= 1.2 && s.ratio <= 2.3,
    )
    .slice(0, 15);

/**
 * The Work page, as a portfolio rather than a directory: a dark hero over a
 * wall of the work itself, then every project as a filterable horizontal showcase — one row per
 * project, the flagships first. All of it is generated from the case-study
 * briefs — see `@/lib/work`.
 */
export default async function CaseStudiesPage() {
  const [chrome, workIndex, industries] = await Promise.all([
    getChrome(),
    getWorkIndex(),
    getIndustries(),
  ]);

  const projects = buildWorkProjects(workIndex.details);
  /* The flagships lead, then the rest with captures first. */
  const featured = buildFeaturedProjects(projects);
  const SHOWCASE = [
    ...featured,
    ...byVisuals(projects).filter((p) => !featured.includes(p)),
  ];
  const HERO_STATS = heroStats(industries.length);

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        {/* ------------------------------------------------------ Hero ---- */}
        <WorkHero shots={wallShots(SHOWCASE)} stats={HERO_STATS} />

        {/* ------------------------------------------------ Showcase ---- */}
        <WorkShowcase projects={SHOWCASE} />

        <Contact />
      </main>
      <Footer
        offices={chrome.offices}
        deliveryCountries={chrome.deliveryCountries}
        socials={chrome.socials}
      />
    </>
  );
}

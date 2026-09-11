import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import { KineticWords } from "@/components/ui/Kinetic";
import FeaturedProject from "@/components/work/FeaturedProject";
import MoreWork from "@/components/work/MoreWork";
import { INDUSTRIES } from "@/lib/industries";
import {
  FEATURED_PROJECTS,
  FEATURED_SLUGS,
  WORK_PROJECTS_BY_VISUALS,
} from "@/lib/work";

export const metadata: Metadata = {
  title: "Our Work — Funavry Technologies",
  description:
    "Enterprise platforms, AI products and mobile applications Funavry has designed, engineered and deployed for organizations solving complex problems.",
};

/* The company's published figures — the same ones the home page's Proof
   section and the About page carry — plus the industries the site lists. */
const HERO_STATS = [
  { value: "500+", label: "Projects Delivered" },
  { value: String(INDUSTRIES.length), label: "Industries" },
  { value: "2018", label: "Founded" },
];

/**
 * The Work page, as a portfolio rather than a directory: a short editorial
 * hero, a curated set of flagship projects in alternating rows, then every
 * other project in a filterable two-column grid. All of it is generated from
 * the case-study briefs — see `@/lib/work`.
 */
export default function CaseStudiesPage() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* ------------------------------------------------------ Hero ---- */}
        <section className="bg-paper pt-[130px]">
          <Container wide className="pb-16 pt-12 lg:pb-24 lg:pt-16">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
              <div>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-8 flex-none bg-azure" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                    Our Work
                  </span>
                </div>
                <h1 className="mt-6 text-h2 text-ink">
                  <KineticWords
                    text="Platforms in production,"
                    trigger="mount"
                  />
                  <br />
                  <KineticWords
                    text="outcomes in the field."
                    delay={0.12}
                    trigger="mount"
                  />
                </h1>
              </div>
              <div>
                <p className="max-w-[46ch] text-[16px] leading-[1.75] text-ink-500">
                  We design, engineer and deploy digital products for
                  organizations solving complex problems. From enterprise
                  systems to AI-powered solutions, we turn ideas into reliable,
                  scalable platforms.
                </p>
                <dl className="grid grid-cols-3 border-t border-line pt-6 lg:border-t-0 lg:pb-2">
                  {HERO_STATS.map((stat, i) => (
                    <div
                      key={stat.label}
                      className={
                        i === 0
                          ? "flex flex-col-reverse justify-end gap-2 pr-4 lg:pr-10"
                          : "flex flex-col-reverse justify-end gap-2 border-l border-line px-4 lg:px-10"
                      }
                    >
                      <dt className="font-mono text-[9.5px] uppercase leading-[1.5] tracking-[0.18em] text-ink-400">
                        {stat.label}
                      </dt>
                      <dd className="text-[26px] font-medium leading-none tracking-[-0.03em] text-ink lg:text-[34px]">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Container>
        </section>

        {/* -------------------------------------------- Featured work ---- */}
        <section aria-labelledby="featured-work-heading" className="bg-paper">
          <Container wide className="pb-20 lg:pb-28">
            <h2
              id="featured-work-heading"
              className="flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink"
            >
              <span aria-hidden className="h-px w-8 flex-none bg-azure" />
              Featured Work
            </h2>

            <div className="mt-8 space-y-16 lg:mt-12 lg:space-y-24">
              {FEATURED_PROJECTS.map((project, i) => (
                <FeaturedProject
                  key={project.slug}
                  project={project}
                  index={i}
                />
              ))}
            </div>
          </Container>
        </section>

        {/* ------------------------------------------------ More work ---- */}
        <MoreWork
          projects={WORK_PROJECTS_BY_VISUALS}
          featuredSlugs={FEATURED_SLUGS}
        />

        <Contact />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import CaseStudyHero from "@/components/work/CaseStudyHero";
import DetailHeading from "@/components/work/DetailHeading";
import ProjectGlance from "@/components/work/ProjectGlance";
import ProductShowcase from "@/components/work/ProductShowcase";
import KeyFeatures from "@/components/work/KeyFeatures";
import TechStack from "@/components/work/TechStack";
import WorkCard from "@/components/work/WorkCard";
import { getCaseStudyDetail, getCaseStudySlugs, getWorkIndex } from "@/lib/api";
import {
  buildWorkProjects,
  getProjectShots,
  getRelatedProjects,
  getWorkProject,
} from "@/lib/work";
import {
  featureOf,
  glanceRows,
  showcaseViews,
  techStack,
} from "@/lib/case-study-view";

type Params = { slug: string };

/**
 * `true`, and it has to be.
 *
 * With `false`, Next serves only the paths that existed at build time and
 * answers anything else with a 404 it will not even attempt to render. That is
 * right for a fixed set of routes and wrong for a CMS in two ways: a case study
 * published in the panel would 404 until the next deploy, and — less obviously
 * — revalidating the cache tag that `generateStaticParams` itself reads
 * invalidates the prerendered list, after which every existing path 404s too.
 *
 * With `true`, a path not in the build-time list is rendered on demand and
 * cached. A slug that genuinely does not exist still 404s, via the `notFound()`
 * below, which is the check that should be making that decision anyway.
 */
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const detail = await getCaseStudyDetail((await params).slug);
  if (!detail) return {};
  return {
    /* The root layout's template appends the company name; see the note on
       the industry page. */
    title: detail.title,
    description: detail.summary,
  };
}

/**
 * A case study:
 *
 *   hero → project at a glance → product showcase → technology stack →
 *   key features → related projects
 *
 * Every word and figure comes from the project's brief in the CMS — see
 * `@/lib/case-study-view` for how it is regrouped; nothing is written for the
 * layout. A section with nothing to show (no captures, no listed stack) is
 * left out rather than drawn empty.
 */
export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const [chrome, detail, workIndex] = await Promise.all([
    getChrome(),
    getCaseStudyDetail(slug),
    getWorkIndex(),
  ]);

  const projects = buildWorkProjects(workIndex.details);
  const project = getWorkProject(projects, slug);

  if (!detail || !project) notFound();

  const shots = getProjectShots(detail);
  const views = showcaseViews(project, shots);
  const features = detail.challenges.map(featureOf);
  const related = getRelatedProjects(projects, slug);
  /* The brief's opening sentence introduces the product on its devices. */
  const showcaseLead = (detail.intro[0] ?? detail.summary).match(
    /^.*?[.!?](?=\s|$)/,
  )?.[0];

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        <CaseStudyHero project={project} hasShowcase={views.length > 0} />

        <ProjectGlance rows={glanceRows(detail, project)} />

        <ProductShowcase views={views} lead={showcaseLead} />

        <TechStack
          tech={techStack(
            detail,
            workIndex.industriesByProject.get(slug) ?? [],
          )}
        />

        <KeyFeatures
          features={features}
          shots={shots.filter((s) => s.kind !== "mobile")}
          lead={detail.challengesLead}
        />

        {/* --------------------------------------------- Related projects -- */}
        {related.length > 0 && (
          <section
            aria-labelledby="related-heading"
            className="relative overflow-hidden bg-paper-deep"
          >
            <div
              aria-hidden
              className="absolute inset-0 grid-paper opacity-60"
            />
            <Container wide className="relative py-8 sm:py-12 lg:py-14">
              <DetailHeading
                id="related-heading"
                eyebrow="More Work"
                title="Related Projects"
                aside={
                  <Button
                    href="/case-studies"
                    variant="accent"
                    size="md"
                    arrow
                    className="flex-none self-start lg:self-auto"
                  >
                    View All Projects
                  </Button>
                }
              />
              <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:mt-6 lg:grid-cols-3">
                {related.map((p, i) => (
                  <WorkCard key={p.slug} project={p} delay={i * 0.06} compact />
                ))}
              </ul>
            </Container>
          </section>
        )}

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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Wipe } from "@/components/ui/Kinetic";
import { HOUSE_LABEL, SERVICE_IMAGES } from "@/lib/service-style";
import DetailHero from "@/components/ui/DetailHero";
import WorkTiles from "@/components/work/WorkTiles";
import Governance from "@/components/sections/Governance";
import ServiceIndustries from "@/components/sections/ServiceIndustries";
import { industriesForService, projectsFor } from "@/lib/relations";
import { byVisuals, buildWorkProjects } from "@/lib/work";
import {
  getService,
  getServices,
  getWorkIndex,
  getIndustries,
} from "@/lib/api";

type Params = { slug: string };

/* For a practice added in the CMS before it has a photograph of its own. */
const FALLBACK_PHOTO = "/services/digital-engineering.webp";

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
  const services = await getServices();
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const found = await getService((await params).slug);
  if (!found) return {};
  return {
    /* The root layout's template appends the company name; see the note on
       the industry page. */
    title: found.service.title,
    description: found.service.summary,
  };
}

/**
 * A practice, drawn like an industry page:
 *
 *   hero → expertise (with what's included) → governance → selected work →
 *   industries served → contact
 *
 * The copy is the practice's CMS entry; the work and industry links come from
 * `relations.ts`, read off the case study briefs. Sections with nothing to
 * show are omitted.
 */
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const [chrome, found, workIndex, allIndustries] = await Promise.all([
    getChrome(),
    getService(slug),
    getWorkIndex(),
    getIndustries(),
  ]);

  if (!found) notFound();

  const service = found.service;


  const projects = byVisuals(buildWorkProjects(workIndex.details));
  const allWork = projectsFor(projects, found.caseStudySlugs);
  const work = allWork.slice(0, 4);

  const industries = industriesForService(
    allIndustries,
    found.caseStudySlugs,
    workIndex.industriesByProject,
  );

  const workCount = allWork.length;
  const industryCount = industries.length;

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        {/* ------------------------------------------------------ Hero ----
            The same hero as the industry pages. */}
        <DetailHero
          image={SERVICE_IMAGES[service.slug] ?? FALLBACK_PHOTO}
          eyebrow={`Service ${service.n}`}
          title={service.title}
          body={service.summary}
          actions={
            <>
              <Button href="/contact" variant="accent" size="md" arrow>
                Discuss your project
              </Button>
              <Button href="/#capabilities" variant="outline" size="md">
                All services
              </Button>
            </>
          }
        />

        {/* ------------------------------------------------- Expertise ----
            Laid out like the industry page's: the statement on the left,
            built from what the CMS knows about the practice, and the services
            it covers as an open list on the right — a line each, ruled off
            from the next, no boxes. */}
        <section className="relative overflow-hidden border-b border-line bg-paper-deep">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
          <Container wide className="relative z-10 py-8 sm:py-12 lg:py-14">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
              <div>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 flex-none bg-azure" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                    Expertise
                  </span>
                </div>
                <h2 className="mt-6 text-h3 text-ink">
                  {service.title} Expertise
                </h2>
                <p className="mt-6 text-[16px] leading-[1.9] text-ink-500 lg:text-[17px]">
                {workCount > 0 && (
                  <>
                    <strong className="font-semibold text-ink">
                      {workCount} published{" "}
                      {workCount === 1 ? "case study" : "case studies"}
                    </strong>
                    {industryCount > 0 && (
                      <>
                        {" across "}
                        <strong className="font-semibold text-ink">
                          {industryCount}{" "}
                          {industryCount === 1 ? "industry" : "industries"}
                        </strong>
                      </>
                    )}
                    {" — "}
                  </>
                )}
                {workCount > 0 ? "a " : "A "}
                <strong className="font-semibold text-ink">
                  {service.phase}
                </strong>{" "}
                practice within{" "}
                <strong className="font-semibold text-ink">
                  {HOUSE_LABEL[service.group]}
                </strong>
                .
                </p>
              </div>

              {/* The services, where the industry page lists its offerings.
                  A practice's services carry no icons of their own, so each
                  row leads with its number in the azure the glyphs use. */}
              {service.subs.length > 0 && (
                <div>
                  <p className="border-b border-line-strong pb-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-500">
                    What&apos;s included
                  </p>
                  <ul className="grid sm:grid-cols-2 sm:gap-x-10">
                    {service.subs.map((sub, i) => (
                      <li key={sub.title} className="border-b border-line">
                        <Wipe delay={(i % 2) * 0.05}>
                          <div className="flex gap-4 py-5">
                            <span
                              aria-hidden
                              className="mt-[3px] w-[22px] flex-none font-mono text-[12px] font-semibold tracking-[0.04em] text-azure"
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <h3 className="text-[15.5px] font-medium leading-snug tracking-[-0.01em] text-ink">
                                {sub.title}
                              </h3>
                              <p className="mt-1.5 text-[13.5px] leading-[1.6] text-ink-500 first-letter:uppercase">
                                {sub.desc}
                              </p>
                            </div>
                          </div>
                        </Wipe>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* ------------------------------------- Compliance & governance ---- */}
        <Governance />

        {/* ------------------------------------------- Selected work ---- */}
        <WorkTiles
          id="service-work"
          title="Selected Work"
          body={
            workCount > work.length
              ? `Platforms we've designed, engineered and run through this practice — ${work.length} of the ${workCount} in our portfolio.`
              : "Platforms we've designed, engineered and run through this practice."
          }
          projects={work}
        />

        {/* --------------------------------------------- Industries ---- */}
        <ServiceIndustries id="service-industries" industries={industries} />

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

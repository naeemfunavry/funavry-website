import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Wipe } from "@/components/ui/Kinetic";
import DetailHero from "@/components/ui/DetailHero";
import WorkTiles from "@/components/work/WorkTiles";
import PracticesSplit from "@/components/sections/PracticesSplit";
import TechStack from "@/components/work/TechStack";
import { INDUSTRY_OVERVIEWS } from "@/lib/industry-overviews";
import { INDUSTRY_TECHNOLOGIES } from "@/lib/industry-technologies";
import { projectsFor, servicesForIndustry } from "@/lib/relations";
import { byVisuals, buildWorkProjects } from "@/lib/work";
import {
  getIndustries,
  getIndustry,
  getServices,
  getWorkIndex,
} from "@/lib/api";

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
  const industries = await getIndustries();
  return industries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const found = await getIndustry((await params).slug);
  if (!found) return {};
  return {
    /* The suffix comes from the root layout's title template — appending it
       here too produced "… — Funavry Technologies — Funavry Technologies". */
    title: found.industry.name,
    description: found.industry.desc,
  };
}

/**
 * An industry:
 *
 *   hero → expertise → practices we bring → technologies → selected work
 *   → contact
 *
 * The copy is the industry's CMS entry; the work and practices come from
 * `relations.ts`, read off the case study briefs. Nothing on the page is
 * written per industry.
 */
export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const [chrome, found, workIndex, allServices] = await Promise.all([
    getChrome(),
    getIndustry(slug),
    getWorkIndex(),
    getServices(),
  ]);

  if (!found) notFound();

  const industry = found.industry;
  const overview = INDUSTRY_OVERVIEWS[industry.slug];
  const frameworks = overview?.frameworks ?? [];

  const projects = byVisuals(buildWorkProjects(workIndex.details));
  const allWork = projectsFor(projects, found.caseStudySlugs);
  const work = allWork.slice(0, 4);

  const services = servicesForIndustry(
    allServices,
    found.caseStudySlugs,
    workIndex.servicesByProject,
  );

  /* Resolved by slug: `industry` came from its own fetch, so it is not the same
     object as the matching entry in the chrome's list. */
  const currentIndex = chrome.industries.findIndex(
    (i) => i.slug === industry.slug,
  );
  const index = String(currentIndex + 1).padStart(2, "0");

  const workCount = allWork.length;

  const practiceCount = services.length;

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        {/* ------------------------------------------------------ Hero ---- */}
        <DetailHero
          image={industry.image}
          eyebrow={`Industry ${index}`}
          title={industry.name}
          body={industry.desc}
          actions={
            <>
              <Button href="/contact" variant="accent" size="md" arrow>
                Discuss your project
              </Button>
              <Button href="/#industries" variant="outline" size="md">
                All industries
              </Button>
            </>
          }
        />

        {/* ------------------------------------------------- Expertise ----
            The industry's own expertise statement where one is written
            (`industry-overviews.ts`), laid out as its offerings and the
            frameworks it names; otherwise one centred statement built from
            what the CMS knows about the industry. */}
        {overview ? (
          <section className="relative overflow-hidden border-b border-line bg-paper-deep">
            <div
              aria-hidden
              className="absolute inset-0 grid-paper opacity-60"
            />
            <Container wide className="relative z-10 py-8 sm:py-12 lg:py-14">
              <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
                {/* The statement: heading, the opening sentence where the
                    paragraph has one, then the closing sentence with any
                    frameworks it names set as badges. */}
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-px w-10 flex-none bg-azure"
                    />
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                      Expertise
                    </span>
                  </div>
                  <h2 className="mt-6 text-h3 text-ink">
                    {industry.name} Expertise
                  </h2>
                  {overview.intro && (
                    <p className="mt-6 text-[16px] leading-[1.9] text-ink-500 lg:text-[17px]">
                      {overview.intro}
                    </p>
                  )}
                  {overview.closing && (
                    <p className="mt-6 text-[16px] leading-[1.9] text-ink-500 lg:text-[17px]">
                      {overview.closing}
                      {frameworks.length > 0 && " "}
                      {frameworks.map((f, i) => (
                        <span key={f}>
                          <span className="mx-0.5 inline-flex items-center border border-azure/40 bg-azure-50 px-2 py-0.5 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-azure-ink">
                            {f}
                          </span>
                          {i < frameworks.length - 2
                            ? ", "
                            : i === frameworks.length - 2
                              ? ", and "
                              : " "}
                        </span>
                      ))}
                      {overview.tail}
                    </p>
                  )}
                </div>

                {/* The offerings, as an open list: a glyph and a line each,
                    ruled off from the next — no boxes. */}
                <div>
                  <p className="border-b border-line-strong pb-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-500">
                    {overview.lead}
                  </p>
                  <ul className="grid sm:grid-cols-2 sm:gap-x-10">
                    {overview.offerings.map(({ text, icon: Icon }, i) => (
                      <li key={text} className="border-b border-line">
                        <Wipe delay={(i % 2) * 0.05}>
                          <div className="group flex items-center gap-4 py-5">
                            <Icon
                              size={22}
                              strokeWidth={1.5}
                              aria-hidden
                              className="flex-none text-azure transition-transform duration-500 ease-expo group-hover:scale-110"
                            />
                            <span className="text-[15.5px] font-medium leading-snug tracking-[-0.01em] text-ink first-letter:uppercase">
                              {text}
                            </span>
                          </div>
                        </Wipe>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Container>
          </section>
        ) : (
          (workCount > 0 || industry.proof) && (
            <section className="relative overflow-hidden border-b border-line bg-paper-deep">
              <div
                aria-hidden
                className="absolute inset-0 grid-paper opacity-60"
              />
              <Container wide className="relative z-10 py-16 lg:py-20">
                <div className="mx-auto max-w-[860px] text-center">
                  <h2 className="text-h3 text-ink">
                    {industry.name} Expertise
                  </h2>
                  <span
                    aria-hidden
                    className="mx-auto mt-6 block h-px w-full bg-line-strong"
                  />
                  <p className="mx-auto mt-6 max-w-[62ch] text-[17px] leading-[1.75] text-ink-500 lg:text-[18px]">
                    {workCount > 0 ? (
                      <>
                        <strong className="font-semibold text-ink">
                          {workCount} published{" "}
                          {workCount === 1 ? "case study" : "case studies"}
                        </strong>
                        {practiceCount > 0 && (
                          <>
                            {" across "}
                            <strong className="font-semibold text-ink">
                              {practiceCount}{" "}
                              {practiceCount === 1 ? "practice" : "practices"}
                            </strong>
                          </>
                        )}
                        {industry.proof ? ", trusted by " : "."}
                      </>
                    ) : (
                      "Trusted by "
                    )}
                    {industry.proof && (
                      <>
                        <strong className="font-semibold text-ink">
                          {industry.proof}
                        </strong>
                        .
                      </>
                    )}
                  </p>
                </div>
              </Container>
            </section>
          )
        )}

        {/* ---------------------------------------------- Practices ---- */}
        <PracticesSplit
          id="industry-practices"
          title="Key Practices We Bring"
          services={services}
        />
        {/* ------------------------------------------- Technologies ---- */}
        <TechStack
          id="industry-tech"
          lead={`The modern, scalable stack behind our ${industry.name} work — built for performance, security and long-term growth.`}
          tech={INDUSTRY_TECHNOLOGIES[industry.slug] ?? []}
        />

        {/* ------------------------------------------- Selected work ---- */}
        <WorkTiles
          id="industry-work"
          title="Selected Work"
          body={
            workCount > work.length
              ? `Platforms we've designed, engineered and run for ${industry.name.toLowerCase()} clients — ${work.length} of the ${workCount} in our portfolio.`
              : `Platforms we've designed, engineered and run for ${industry.name.toLowerCase()} clients.`
          }
          projects={work}
        />

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

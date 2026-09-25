import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Frame from "@/components/ui/Frame";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { CardFoot, ProjectShot, SectionLabel } from "@/components/ui/DetailParts";
import { HOUSE_LABEL, PHASE, SERVICE_ICONS } from "@/lib/service-style";
import { industriesForService, projectsFor } from "@/lib/relations";
import { byVisuals, buildWorkProjects } from "@/lib/work";
import { getService, getServices, getWorkIndex, getIndustries } from "@/lib/api";

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
 *   hero → expertise → what's included → selected work → industries served →
 *   contact
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

  const Icon = SERVICE_ICONS[service.icon];
  const phase = PHASE[service.phase];

  const projects = byVisuals(buildWorkProjects(workIndex.details));
  const allWork = projectsFor(projects, found.caseStudySlugs);
  const work = allWork.slice(0, 3);

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
            The industry page's dark stage. A practice has no photograph, so
            its icon stands in on the right, lit in its phase's hue. `id="top"`
            puts the nav in its on-dark style while it sits over this. */}
        <section
          id="top"
          className="relative overflow-hidden bg-ink-900 pb-20 pt-[150px] lg:flex lg:min-h-[640px] lg:items-center lg:pb-24"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(60%_80%_at_12%_30%,rgba(68,158,216,0.22),transparent_70%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `radial-gradient(40% 60% at 78% 50%, rgba(${phase.tint},0.2), transparent 70%)`,
            }}
          />
          <div aria-hidden className="absolute inset-0 grid-paper-dark" />
          {Icon && (
            <div
              aria-hidden
              className="pointer-events-none absolute right-[8%] top-1/2 hidden -translate-y-1/2 lg:block"
            >
              <Icon
                size={340}
                strokeWidth={0.6}
                style={{ color: `rgba(${phase.tint},0.55)` }}
              />
            </div>
          )}

          <Container wide className="relative z-10 w-full">
            <div className="max-w-[600px]">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber">
                Service {service.n}
              </span>
              <h1 className="mt-5 text-h1 text-paper">
                <KineticWords text={service.title} trigger="mount" />
              </h1>
              <Wipe delay={0.2}>
                <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.7] text-paper/70">
                  {service.summary}
                </p>
              </Wipe>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button href="/contact" variant="accent" size="md" arrow>
                  Discuss your project
                </Button>
                <Button href="/services" variant="outline" size="md">
                  All services
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* ------------------------------------------------- Expertise ----
            One centred statement, built from what the CMS knows about the
            practice rather than written for it. */}
        <section className="relative overflow-hidden border-b border-line bg-paper-deep">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
          <Container wide className="relative z-10 py-16 lg:py-20">
            <div className="mx-auto max-w-[860px] text-center">
              <h2 className="text-h3 text-ink">{service.title} Expertise</h2>
              <span
                aria-hidden
                className="mx-auto mt-6 block h-px w-full bg-line-strong"
              />
              <p className="mx-auto mt-6 max-w-[62ch] text-[17px] leading-[1.75] text-ink-500 lg:text-[18px]">
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
          </Container>
        </section>

        {/* ------------------------------------------- What's included ---- */}
        <section
          aria-labelledby="service-included"
          className="border-b border-line bg-paper-white"
        >
          <Container wide className="py-16 lg:py-24">
            <SectionLabel id="service-included">What&apos;s Included</SectionLabel>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 xl:grid-cols-4">
              {service.subs.map((sub, i) => (
                <li key={sub.title} className="h-full">
                  <Wipe delay={(i % 4) * 0.06} className="h-full">
                    <Frame
                      tint={phase.tint}
                      className="h-full"
                      innerClassName="flex h-full flex-col px-6 pb-6 pt-5"
                    >
                      <h3 className="text-[18px] font-medium leading-snug tracking-[-0.02em] text-ink">
                        {sub.title}
                      </h3>
                      <span aria-hidden className="mt-5 block h-px bg-line" />
                      <ul className="mt-5 grid gap-2.5">
                        {sub.desc.split(/,\s*/).map((item) => (
                          <li key={item} className="flex gap-3">
                            <span
                              aria-hidden
                              className="mt-[8px] h-1 w-1 flex-none rounded-full"
                              style={{ background: `rgb(${phase.tint})` }}
                            />
                            <span className="block text-[14px] leading-snug text-ink-500 first-letter:uppercase">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Frame>
                  </Wipe>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* ------------------------------------------- Selected work ---- */}
        {work.length > 0 && (
          <section
            aria-labelledby="service-work"
            className="border-b border-line bg-paper"
          >
            <Container wide className="py-16 lg:py-24">
              <SectionLabel id="service-work">Selected Work</SectionLabel>
              <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:mt-10 xl:grid-cols-3">
                {work.map((project, i) => (
                  <li key={project.slug} className="h-full">
                    <Wipe delay={(i % 3) * 0.06} className="h-full">
                      <Frame
                        as="a"
                        href={`/case-studies/${project.slug}`}
                        className="group block h-full"
                        innerClassName="flex h-full flex-col"
                      >
                        <ProjectShot project={project} />
                        <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                          <h3 className="text-[18px] font-medium leading-snug tracking-[-0.02em] text-ink">
                            {project.title}
                          </h3>
                          <CardFoot>View details</CardFoot>
                        </div>
                      </Frame>
                    </Wipe>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )}

        {/* --------------------------------------------- Industries ---- */}
        {industries.length > 0 && (
          <section
            aria-labelledby="service-industries"
            className="border-b border-line bg-paper-white"
          >
            <Container wide className="py-16 lg:py-24">
              <SectionLabel id="service-industries">
                Industries We Serve
              </SectionLabel>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
                {industries.map((industry) => (
                  <li key={industry.slug} className="h-full">
                    <Frame
                      as="a"
                      href={`/industries/${industry.slug}`}
                      tint={phase.tint}
                      className="block h-full"
                      innerClassName="flex h-full flex-col px-6 pb-6 pt-5"
                    >
                      <div className="flex items-center gap-3.5">
                        {industry.image && (
                          <span className="relative h-10 w-10 flex-none overflow-hidden border border-line">
                            <Image
                              src={industry.image}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </span>
                        )}
                        <h3 className="text-[16px] font-medium leading-snug tracking-[-0.015em] text-ink">
                          {industry.name}
                        </h3>
                      </div>
                      <CardFoot>View industry</CardFoot>
                    </Frame>
                  </li>
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

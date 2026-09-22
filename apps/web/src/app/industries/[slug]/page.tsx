import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Frame from "@/components/ui/Frame";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { PHASE, SERVICE_ICONS } from "@/lib/service-style";
import CaseStudySection from "@/components/work/CaseStudySection";
import ProjectCard from "@/components/work/ProjectCard";
import { neighbours, projectsFor, servicesForIndustry } from "@/lib/relations";
import { byVisuals, buildWorkProjects } from "@/lib/work";
import { getIndustries, getIndustry, getServices, getWorkIndex } from "@/lib/api";
import { cn } from "@/lib/utils";

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
 *   hero → at a glance → selected work → practices we bring →
 *   prev / next industry
 *
 * The copy is the industry's entry in `industries.ts`; the work and practices
 * come from `relations.ts`, read off the case study briefs.
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
  const INDUSTRIES = chrome.industries;

  const projects = byVisuals(buildWorkProjects(workIndex.details));
  const allWork = projectsFor(projects, found.caseStudySlugs);
  const work = allWork.slice(0, 6);

  const services = servicesForIndustry(
    allServices,
    found.caseStudySlugs,
    workIndex.servicesByProject,
  );

  /* Resolved by slug: `industry` came from its own fetch, so it is not the same
     object as the matching entry in the chrome's list. */
  const currentIndex = INDUSTRIES.findIndex((i) => i.slug === industry.slug);
  const current = INDUSTRIES[currentIndex] ?? industry;
  const { prev, next } = neighbours(INDUSTRIES, current);
  const index = String(currentIndex + 1).padStart(2, "0");

  const glance = [
    { value: String(allWork.length), label: "Published case studies" },
    { value: String(services.length), label: "Practices engaged" },
    { value: industry.proof, label: "Selected clients & proof" },
  ];

  return (
    <>
      <Nav services={chrome.services} industries={chrome.industries} socials={chrome.socials} />
      <main id="main">
        {/* ------------------------------------------------------ Hero ---- */}
        <section className="relative overflow-hidden border-b border-line bg-paper-deep pt-[130px]">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />

          <Container
            wide
            className="relative z-10 pb-20 pt-12 lg:pb-24 lg:pt-16"
          >
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400"
            >
              <Link
                href="/industries"
                className="transition-colors hover:text-ink"
              >
                Industries
              </Link>
              <span aria-hidden>/</span>
              <span className="text-ink-500">{index}</span>
            </nav>

            <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-center lg:gap-20">
              <div>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 flex-none bg-azure" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                    Industry {index}
                  </span>
                </div>
                <h1 className="mt-6 max-w-[18ch] text-h2 text-ink">
                  <KineticWords text={industry.name} trigger="mount" />
                </h1>
                <Wipe delay={0.2}>
                  <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.75] text-ink-500">
                    {industry.desc}
                  </p>
                </Wipe>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button href="/contact" variant="ink" size="md" arrow>
                    Discuss your project
                  </Button>
                  <Button href="/industries" variant="secondary" size="md">
                    All industries
                  </Button>
                </div>
              </div>

              <Wipe delay={0.1}>
                <Frame interactive={false} innerClassName="p-2">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={industry.image}
                      alt={industry.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 92vw, 560px"
                      className="object-cover"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-ink-900/30 to-transparent"
                    />
                  </div>
                </Frame>
              </Wipe>
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------- At a glance ---- */}
        <section className="border-b border-line bg-paper-white">
          <Container wide>
            <dl className="grid border-l border-line sm:grid-cols-3">
              {glance.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col-reverse justify-end gap-3 border-b border-r border-line p-6 sm:border-b-0 lg:p-8"
                >
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-400">
                    {item.label}
                  </dt>
                  <dd className="text-[22px] font-medium leading-[1.15] tracking-[-0.025em] text-ink lg:text-[28px]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        {/* ------------------------------------------- Selected work ---- */}
        {work.length > 0 && (
          <CaseStudySection
            id="work"
            label="Selected Work"
            title="Platforms we've shipped in this industry."
            tone="paper"
          >
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
              {work.map((project, i) => (
                <Wipe key={project.slug} delay={(i % 3) * 0.06} className="h-full">
                  <ProjectCard project={project} />
                </Wipe>
              ))}
            </div>
            <Link
              href="/case-studies"
              className="mt-12 inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-500 transition-colors hover:text-ink"
            >
              All case studies
              <ArrowRight size={13} aria-hidden />
            </Link>
          </CaseStudySection>
        )}

        {/* ---------------------------------------------- Practices ---- */}
        {services.length > 0 && (
          <CaseStudySection
            id="practices"
            label="Practices We Bring"
            title="The capabilities behind the work."
            tone="white"
          >
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = SERVICE_ICONS[service.icon];
                const phase = PHASE[service.phase];
                return (
                  <li key={service.slug} className="h-full">
                    <Frame
                      as="a"
                      href={`/services/${service.slug}`}
                      tint={phase.tint}
                      className="block h-full"
                      innerClassName="flex h-full flex-col p-6 lg:p-7"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className={cn("h-1 w-1 rounded-full", phase.dot)}
                          />
                          <span
                            className={cn(
                              "font-mono text-[9.5px] uppercase tracking-[0.16em]",
                              phase.text,
                            )}
                          >
                            {service.phase}
                          </span>
                        </span>
                        {Icon && (
                          <Icon
                            size={18}
                            strokeWidth={1.5}
                            aria-hidden
                            className="text-ink-400"
                          />
                        )}
                      </div>
                      <h3 className="mt-4 text-[18px] font-medium leading-snug tracking-[-0.02em] text-ink">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-[13.5px] leading-[1.7] text-ink-500">
                        {service.summary}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[13px] font-medium text-ink">
                        View practice
                        <ArrowRight
                          size={14}
                          aria-hidden
                          className="transition-transform duration-500 ease-smooth group-hover/frame:translate-x-1"
                        />
                      </span>
                    </Frame>
                  </li>
                );
              })}
            </ul>
          </CaseStudySection>
        )}

        {/* ---------------------------------------- Prev / next industry ---- */}
        <nav
          aria-label="More industries"
          className="border-t border-line bg-paper"
        >
          <Container wide>
            <div className="grid md:grid-cols-2">
              {(
                [
                  ["Previous industry", prev, ArrowLeft],
                  ["Next industry", next, ArrowRight],
                ] as const
              ).map(([label, item, Arrow], i) => (
                <Link
                  key={label}
                  href={`/industries/${item.slug}`}
                  className={cn(
                    "group flex flex-col gap-3 py-10 lg:py-14",
                    i === 0
                      ? "border-b border-line md:border-b-0 md:border-r md:pr-10"
                      : "md:items-end md:pl-10 md:text-right",
                  )}
                >
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                    {i === 0 && <Arrow size={13} aria-hidden />}
                    {label}
                    {i === 1 && <Arrow size={13} aria-hidden />}
                  </span>
                  <span className="text-[20px] font-medium leading-snug tracking-[-0.02em] text-ink transition-colors group-hover:text-azure-ink lg:text-[24px]">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </nav>

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

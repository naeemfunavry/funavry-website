import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Frame from "@/components/ui/Frame";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { PHASE, SERVICE_ICONS } from "@/lib/service-style";
import type { WorkProject } from "@/lib/work-model";
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
 *   hero → expertise → selected work → practices we bring → contact
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

  const projects = byVisuals(buildWorkProjects(workIndex.details));
  const allWork = projectsFor(projects, found.caseStudySlugs);
  const work = allWork.slice(0, 3);

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
        {/* ------------------------------------------------------ Hero ----
            The dark stage, with the industry's photograph filling the right
            and fading into the ink under the copy. `id="top"` puts the nav in
            its on-dark style while it sits over this. */}
        <section
          id="top"
          className="relative overflow-hidden bg-ink-900 pb-20 pt-[150px] lg:flex lg:min-h-[640px] lg:items-center lg:pb-24"
        >
          <div aria-hidden className="absolute inset-0 lg:left-[34%]">
            <Image
              src={industry.image}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </div>
          {/* Ink over the photo: solid under the copy, clearing to the right.
              On a phone the photo sits behind everything, so it is dimmed
              evenly instead. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-ink-900/80 lg:bg-transparent lg:bg-[linear-gradient(90deg,#21262A_0%,#21262A_34%,rgba(33,38,42,0.82)_46%,rgba(33,38,42,0.25)_72%,rgba(33,38,42,0.05)_100%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(60%_80%_at_12%_30%,rgba(68,158,216,0.22),transparent_70%)]"
          />
          <div aria-hidden className="absolute inset-0 grid-paper-dark" />

          <Container wide className="relative z-10 w-full">
            <div className="max-w-[560px]">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber">
                Industry {index}
              </span>
              <h1 className="mt-5 text-h1 text-paper">
                <KineticWords text={industry.name} trigger="mount" />
              </h1>
              <Wipe delay={0.2}>
                <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.7] text-paper/70">
                  {industry.desc}
                </p>
              </Wipe>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button href="/contact" variant="accent" size="md" arrow>
                  Discuss your project
                </Button>
                <Button href="/industries" variant="outline" size="md">
                  All industries
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* ------------------------------------------------- Expertise ----
            One centred statement, built from what the CMS knows about the
            industry rather than written for it. */}
        {(workCount > 0 || industry.proof) && (
          <section className="relative overflow-hidden border-b border-line bg-paper-deep">
            <div
              aria-hidden
              className="absolute inset-0 grid-paper opacity-60"
            />
            <Container wide className="relative z-10 py-16 lg:py-20">
              <div className="mx-auto max-w-[860px] text-center">
                <h2 className="text-h3 text-ink">{industry.name} Expertise</h2>
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
        )}

        {/* ------------------------------------------- Selected work ---- */}
        {work.length > 0 && (
          <section
            aria-labelledby="industry-work"
            className="border-b border-line bg-paper"
          >
            <Container wide className="py-16 lg:py-24">
              <SectionLabel id="industry-work">Selected Work</SectionLabel>
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

        {/* ---------------------------------------------- Practices ---- */}
        {services.length > 0 && (
          <section
            aria-labelledby="industry-practices"
            className="border-b border-line bg-paper-white"
          >
            <Container wide className="py-16 lg:py-24">
              <SectionLabel id="industry-practices">
                Key Practices We Bring
              </SectionLabel>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
                {services.map((service) => {
                  const Icon = SERVICE_ICONS[service.icon];
                  return (
                    <li key={service.slug} className="h-full">
                      <Frame
                        as="a"
                        href={`/services/${service.slug}`}
                        tint={PHASE[service.phase].tint}
                        className="block h-full"
                        innerClassName="flex h-full flex-col px-6 pb-6 pt-5"
                      >
                        <div className="flex items-center gap-3.5">
                          {Icon && (
                            <Icon
                              size={26}
                              strokeWidth={1.5}
                              aria-hidden
                              className="flex-none text-azure-ink"
                            />
                          )}
                          <h3 className="text-[16px] font-medium leading-snug tracking-[-0.015em] text-ink">
                            {service.title}
                          </h3>
                        </div>
                        <CardFoot>View services</CardFoot>
                      </Frame>
                    </li>
                  );
                })}
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

/** A project's lead capture, plain — no device frame — and whole: fitted
    inside a 16:10 area rather than cropped to it. A project with no capture
    gets its sector as a quiet placeholder. */
function ProjectShot({ project }: { project: WorkProject }) {
  const shot = project.media.primary ?? project.media.phones[0] ?? null;

  return (
    <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-paper-deep">
      {shot ? (
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 46vw, 30vw"
          className="object-contain p-3 transition-transform duration-700 ease-expo group-hover/frame:scale-[1.03]"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
          {project.sector.split("·")[0].trim()}
        </span>
      )}
    </div>
  );
}

/** The site's section eyebrow — azure hairline beside a mono label. */
function SectionLabel({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={id}
      className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-ink"
    >
      <span aria-hidden className="h-px w-10 flex-none bg-azure" />
      {children}
    </h2>
  );
}

/** A card's foot: a hairline, then the link label. The card itself is the
    anchor, so this is only its label, moving with the card's hover. Pinned to
    the bottom so a row of cards lines its feet up. */
function CardFoot({ children }: { children: string }) {
  return (
    <div className="mt-auto pt-5">
      <span aria-hidden className="block h-px bg-line" />
      <span className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-semibold text-azure-ink">
        {children}
        <ArrowRight
          size={14}
          aria-hidden
          className="transition-transform duration-500 ease-smooth group-hover/frame:translate-x-1"
        />
      </span>
    </div>
  );
}

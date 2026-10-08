import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
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
 * Per-practice page copy that the CMS does not model.
 *
 * The [slug] template is otherwise driven entirely by the service's CMS entry
 * and its case-study relations. A practice listed here replaces that generic,
 * data-derived copy with written-out marketing prose for its own page — the
 * hero loses its generic actions, and the expertise statement is prose rather
 * than a case-study tally.
 */
type ServiceOverride = {
  /** Hide the hero's "Discuss your project / All services" actions. */
  hideHeroActions?: boolean;
  /** Replaces the left expertise statement. */
  expertiseBody?: React.ReactNode;
  /** Give the expertise section a white (paper) ground instead of paper-deep. */
  expertiseWhiteBg?: boolean;
  /** Replaces each sub-service's description, keyed by sub title. */
  subDescs?: Record<string, string>;
  /** Overrides the Selected Work section's head and portfolio link. */
  work?: {
    label?: string;
    title?: React.ReactNode;
    body?: string;
    more?: { label: string; href: string };
  };
  /** Overrides the Industries We Serve section's head text (cards unchanged). */
  industries?: {
    label?: string;
    title?: React.ReactNode;
    body?: React.ReactNode;
    /** Drop the proof point (project tag) from each card. */
    hideProof?: boolean;
  };
};

const SERVICE_OVERRIDES: Record<string, ServiceOverride> = {
  "digital-engineering": {
    hideHeroActions: true,
    expertiseWhiteBg: true,
    expertiseBody: (
      <>
        We build scalable digital products, platforms, and business applications
        that drive growth and efficiency. From custom software and SaaS
        platforms to enterprise applications, web and mobile solutions, we help
        businesses design, develop, and modernize technology that delivers
        real-world impact.
        <br />
        <br />
        Our expertise covers the complete product lifecycle — from product
        discovery and design to development, integration, modernization, and
        ongoing support.
      </>
    ),
    subDescs: {
      "Product Engineering":
        "Develop scalable software products, SaaS platforms, and enterprise solutions.",
      "Web & Mobile Solutions":
        "Create modern web and mobile experiences across devices and platforms.",
      "Experience Design": "Design intuitive and engaging user experiences.",
      "Systems Integration & Modernization":
        "Connect, modernize, and optimize enterprise technology ecosystems.",
    },
    work: {
      label: "Selected Work",
      title: (
        <>
          Real Solutions. <br /> <span className="">Measurable Impact.</span>
        </>
      ),
      body: "From enterprise platforms to customer-facing applications, we build digital solutions that solve real business challenges.",
      more: { label: "View All Work", href: "/case-studies" },
    },
    industries: {
      label: "Industries We Serve",
      title: (
        <>
          Transforming Industries
          <br />
          with <span className="">Digital Engineering</span>
        </>
      ),
      body: "We apply digital engineering expertise across industries to build innovative products, modernize systems, and create scalable digital experiences.",
      hideProof: true,
    },
  },
  "ai-automation": {
    hideHeroActions: true,
    expertiseWhiteBg: true,
    expertiseBody: (
      <>
        We design, build, and deploy intelligent systems that automate complex
        processes, augment decision-making, and help businesses create new
        digital capabilities. From AI-powered applications and intelligent
        automation to enterprise knowledge systems and AI operations, we build
        solutions that are practical, scalable, and built for real-world impact.
        <br />
        <br />
        Our expertise spans the complete AI lifecycle — from strategy and
        application development to deployment, optimization, governance, and
        continuous improvement.
      </>
    ),
    subDescs: {
      "AI Solutions & Applications":
        "Build intelligent AI-powered products, enterprise assistants, agentic systems, and generative AI applications.",
      "Intelligent Automation":
        "Automate workflows, business processes, operational tasks, and decision-support activities.",
      "Document & Knowledge Intelligence":
        "Transform documents and unstructured information into searchable, structured, and actionable business knowledge using OCR, extraction, knowledge systems, and RAG.",
      "AI Engineering & Operations":
        "Deploy, monitor, evaluate, optimize, and govern AI systems through MLOps, LLMOps, model evaluation, prompt optimization, and AI governance.",
    },
    work: {
      label: "Selected Work",
      title: (
        <>
          Real Solutions. <br /> <span className="">Measurable Impact.</span>
        </>
      ),
      body: "From AI-powered applications to intelligent automation and knowledge systems, we build solutions that solve real business challenges.",
      more: { label: "View All Work", href: "/case-studies" },
    },
    industries: {
      label: "Industries We Serve",
      title: (
        <>
          Transforming Industries
          <br />
          with <span className="">AI &amp; Automation</span>
        </>
      ),
      body: "We apply AI, automation, and digital engineering expertise across industries to solve complex operational challenges, improve decision-making, and create scalable digital experiences.",
      hideProof: true,
    },
  },
};

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
 *   industries served
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
  const override = SERVICE_OVERRIDES[slug];

  const projects = byVisuals(buildWorkProjects(workIndex.details));
  const allWork = projectsFor(projects, found.caseStudySlugs);
  const work = allWork.slice(0, 4);

  const industries = industriesForService(
    allIndustries,
    found.caseStudySlugs,
    workIndex.industriesByProject,
  );

  /* The sub-services, with their descriptions replaced where the page overrides
     them; titles and order stay as the CMS entry defines. */
  const subs = override?.subDescs
    ? service.subs.map((sub) => ({
        ...sub,
        desc: override.subDescs?.[sub.title] ?? sub.desc,
      }))
    : service.subs;

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
          eyebrow={`Service ${service.phase}`}
          title={service.title}
          body={service.summary}
          actions={
            override?.hideHeroActions ? undefined : (
              <>
                <Button href="/contact" variant="accent" size="md" arrow>
                  Discuss your project
                </Button>
                <Button href="/#capabilities" variant="outline" size="md">
                  All services
                </Button>
              </>
            )
          }
        />

        {/* ------------------------------------------------- Expertise ----
            Laid out like the industry page's: the statement on the left,
            built from what the CMS knows about the practice, and the services
            it covers as an open list on the right — a line each, ruled off
            from the next, no boxes. */}
        <section
          className={`relative overflow-hidden border-b border-line ${
            override?.expertiseWhiteBg ? "bg-paper" : "bg-paper-deep"
          }`}
        >
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
                  {override?.expertiseBody ?? (
                    <>
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
                                {industryCount === 1
                                  ? "industry"
                                  : "industries"}
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
                    </>
                  )}
                </p>
              </div>

              {/* The services, where the industry page lists its offerings.
                  A practice's services carry no icons of their own, so each
                  row leads with its number in the azure the glyphs use. */}
              {subs.length > 0 && (
                <div>
                  <p className="border-b border-line-strong pb-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-500">
                    What we do
                  </p>
                  <ul className="grid sm:grid-cols-1 sm:gap-x-10">
                    {subs.map((sub, i) => (
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
        {/* <Governance /> */}

        {/* ------------------------------------------- Selected work ---- */}
        <WorkTiles
          id="service-work"
          ground="azure"
          label={override?.work?.label}
          title={override?.work?.title ?? "Selected Work"}
          body={
            override?.work?.body ??
            (workCount > work.length
              ? `Platforms we've designed, engineered and run through this practice — ${work.length} of the ${workCount} in our portfolio.`
              : "Platforms we've designed, engineered and run through this practice.")
          }
          more={override?.work?.more}
          projects={work}
        />

        {/* --------------------------------------------- Industries ---- */}
        <ServiceIndustries
          id="service-industries"
          industries={industries}
          label={override?.industries?.label}
          title={override?.industries?.title}
          body={override?.industries?.body}
          hideProof={override?.industries?.hideProof}
        />
      </main>
      <Footer
        offices={chrome.offices}
        deliveryCountries={chrome.deliveryCountries}
        socials={chrome.socials}
      />
    </>
  );
}

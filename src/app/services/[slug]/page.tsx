import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Frame from "@/components/ui/Frame";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import { HOUSE_LABEL, PHASE, SERVICE_ICONS } from "@/lib/service-style";
import CaseStudySection from "@/components/work/CaseStudySection";
import ProjectCard from "@/components/work/ProjectCard";
import {
  getService,
  getServiceIndustries,
  getServiceWork,
  neighbours,
} from "@/lib/relations";
import { SERVICES } from "@/lib/services";
import { cn } from "@/lib/utils";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return SERVICES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return {
    title: `${service.title} — Funavry Technologies`,
    description: service.summary,
  };
}

const CHAIN = [
  ["Build", "Engineer the platform"],
  ["Automate", "Put AI to work"],
  ["Operate", "Run it at scale"],
] as const;

/**
 * A practice:
 *
 *   hero → what's included → where it sits in the chain → selected work →
 *   industries served → prev / next practice
 *
 * The copy is the practice's own entry in `services.ts`; the work and industry
 * links come from `relations.ts`. Sections with nothing to show are omitted.
 */
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const service = getService((await params).slug);
  if (!service) notFound();

  const Icon = SERVICE_ICONS[service.icon];
  const phase = PHASE[service.phase];
  const work = getServiceWork(service).slice(0, 6);
  const industries = getServiceIndustries(service);
  const { prev, next } = neighbours(SERVICES, service);
  const samePhase = SERVICES.filter(
    (s) => s.phase === service.phase && s !== service,
  );

  return (
    <>
      <Nav />
      <main id="main">
        {/* ------------------------------------------------------ Hero ---- */}
        <section className="relative overflow-hidden border-b border-line bg-paper-deep pt-[130px]">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `radial-gradient(55% 60% at 88% 20%, rgba(${phase.tint},0.12), transparent 70%)`,
            }}
          />

          <Container
            wide
            className="relative z-10 pb-20 pt-12 lg:pb-24 lg:pt-16"
          >
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400"
            >
              <Link href="/services" className="transition-colors hover:text-ink">
                Services
              </Link>
              <span aria-hidden>/</span>
              <span className="text-ink-500">{HOUSE_LABEL[service.group]}</span>
            </nav>

            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end lg:gap-20">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10.5px] tracking-[0.2em] text-ink-400">
                    {service.n}
                  </span>
                  <span aria-hidden className="h-px w-6 bg-line-strong" />
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={cn("h-1.5 w-1.5 rounded-full", phase.dot)}
                    />
                    <span
                      className={cn(
                        "font-mono text-[10.5px] uppercase tracking-[0.2em]",
                        phase.text,
                      )}
                    >
                      {service.phase}
                    </span>
                  </span>
                </div>
                <h1 className="mt-6 max-w-[20ch] text-h2 text-ink">
                  <KineticWords text={service.title} trigger="mount" />
                </h1>
              </div>

              <Wipe delay={0.2}>
                <div className="flex flex-col gap-8">
                  {Icon && (
                    <span className="flex h-14 w-14 items-center justify-center border border-line-strong bg-paper-white">
                      <Icon size={24} strokeWidth={1.5} className="text-ink" />
                    </span>
                  )}
                  <p className="text-[16px] leading-[1.75] text-ink-500">
                    {service.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button href="/contact" variant="ink" size="md" arrow>
                      Discuss this service
                    </Button>
                    <Button href="/services" variant="secondary" size="md">
                      All services
                    </Button>
                  </div>
                </div>
              </Wipe>
            </div>
          </Container>
        </section>

        {/* ------------------------------------------- What's included ---- */}
        <CaseStudySection
          id="included"
          label="What's Included"
          title={`${service.subs.length} capabilities inside the practice.`}
          tone="white"
        >
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {service.subs.map((sub, i) => (
              <li key={sub.title} className="h-full">
                <Wipe delay={i * 0.06} className="h-full">
                  <Frame
                    tint={phase.tint}
                    className="h-full"
                    innerClassName="flex h-full flex-col p-6 lg:p-7"
                  >
                    <span className="font-mono text-[10px] tracking-[0.16em] text-ink-400">
                      {service.n}.{i + 1}
                    </span>
                    <h3 className="mt-5 text-[18px] font-medium leading-snug tracking-[-0.02em] text-ink">
                      {sub.title}
                    </h3>
                    <ul className="mt-5 grid gap-2.5 border-t border-line pt-5">
                      {sub.desc.split(/,\s*/).map((item) => (
                        <li key={item} className="flex gap-3">
                          <span
                            aria-hidden
                            className="mt-[8px] h-1 w-1 flex-none rounded-full"
                            style={{ background: `rgb(${phase.tint})` }}
                          />
                          <span className="block text-[13.5px] leading-snug text-ink-500 first-letter:uppercase">
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
        </CaseStudySection>

        {/* ------------------------------------- Where it sits (chain) ---- */}
        <CaseStudySection
          id="delivery-model"
          label="Delivery Model"
          title="Where it sits in build, automate, operate."
          tone="paper"
        >
          <ol className="grid border-l border-t border-line md:grid-cols-3">
            {CHAIN.map(([name, blurb], i) => {
              const active = name === service.phase;
              const style = PHASE[name];
              const members = SERVICES.filter((s) => s.phase === name);
              return (
                <li
                  key={name}
                  className={cn(
                    "relative border-b border-r border-line p-6 lg:p-8",
                    active ? "bg-paper-white" : "bg-paper",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className={cn("absolute inset-x-0 top-0 h-[3px]", style.dot)}
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-ink-400">
                      0{i + 1}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10.5px] uppercase tracking-[0.2em]",
                        style.text,
                      )}
                    >
                      {name}
                    </span>
                    {active && (
                      <span className="ml-auto border border-line-strong px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-500">
                        This practice
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-4 text-[20px] font-medium tracking-[-0.02em]",
                      active ? "text-ink" : "text-ink-400",
                    )}
                  >
                    {blurb}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
                    {members.length} practices
                  </p>
                </li>
              );
            })}
          </ol>

          {samePhase.length > 0 && (
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="flex-none font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-400">
                Also in {service.phase}
              </span>
              <ul className="flex flex-wrap gap-2">
                {samePhase.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="inline-block border border-line bg-paper-white px-3 py-1.5 text-[13px] leading-[1.5] text-ink-700 transition-colors hover:border-ink hover:text-ink"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CaseStudySection>

        {/* ------------------------------------------- Selected work ---- */}
        {work.length > 0 && (
          <CaseStudySection
            id="work"
            label="Selected Work"
            title="The practice, delivered."
            tone="white"
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

        {/* -------------------------------------------- Industries ---- */}
        {industries.length > 0 && (
          <CaseStudySection
            id="industries"
            label="Industries Served"
            title="Where this practice has shipped."
            tone="paper"
          >
            <ul className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
              {industries.map((industry) => (
                <li key={industry.slug} className="border-b border-r border-line">
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="group flex h-full items-center justify-between gap-6 bg-paper p-6 transition-colors hover:bg-paper-white"
                  >
                    <span>
                      <span className="block text-[16px] font-medium leading-snug tracking-[-0.015em] text-ink">
                        {industry.name}
                      </span>
                      <span className="mt-1.5 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-400">
                        {industry.proof}
                      </span>
                    </span>
                    <ArrowRight
                      size={15}
                      aria-hidden
                      className="flex-none text-ink-400 transition-transform duration-500 ease-smooth group-hover:translate-x-1 group-hover:text-ink"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </CaseStudySection>
        )}

        {/* ---------------------------------------- Prev / next practice ---- */}
        <nav
          aria-label="More practices"
          className="border-t border-line bg-paper-white"
        >
          <Container wide>
            <div className="grid md:grid-cols-2">
              {(
                [
                  ["Previous practice", prev, ArrowLeft],
                  ["Next practice", next, ArrowRight],
                ] as const
              ).map(([label, s, Arrow], i) => (
                <Link
                  key={label}
                  href={`/services/${s.slug}`}
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
                    {s.title}
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </nav>

        <Contact />
      </main>
      <Footer />
    </>
  );
}

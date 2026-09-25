import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
// import ScreenshotGallery from "@/components/ui/ScreenshotGallery";
import FactLine from "@/components/work/FactLine";
// import { Wipe } from "@/components/ui/Kinetic"; — only the commented-out screenshots use it
import CaseStudyHero from "@/components/work/CaseStudyHero";
import CaseStudySection from "@/components/work/CaseStudySection";
import Frame from "@/components/ui/Frame";
import { CardFoot, ProjectShot } from "@/components/ui/DetailParts";
import { FactGrid, factRows } from "@/components/work/ProjectSpecs";
import ChallengeShowcase from "@/components/work/ChallengeShowcase";
import { PHASE_STYLE } from "@/components/work/phase";
import {
  getCaseStudyDetail,
  getCaseStudySlugs,
  getWorkIndex,
} from "@/lib/api";
import {
  buildWorkProjects,
  getNextProject,
  getWorkProject,
} from "@/lib/work";
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

/** Section eyebrow: index number, hairline, mono label. Only the commented-out
    Project Screenshots section below still uses it. */
function Eyebrow({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {/* <span className="font-mono text-[10.5px] tracking-[0.24em] text-azure-ink">
        {index}
      </span> */}
      <span aria-hidden className="h-px w-10 flex-none bg-azure" />
      <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
        {label}
      </span>
    </div>
  );
}

// Unused while the Project Screenshots section is commented out below.
//
// /** A screenshot slot awaiting its capture — replaced by adding a real path to
//     `screenshots` in case-study-details.ts. The layout does not change. */
// function ScreenshotPlaceholder({ label }: { label: string }) {
//   return (
//     <figure className="group/shot">
//       <div className="overflow-hidden border border-line bg-paper-white shadow-[0_22px_50px_-26px_rgba(46,52,54,0.35)]">
//         <div className="flex items-center gap-1.5 border-b border-line px-3.5 py-2.5">
//           <span
//             aria-hidden
//             className="h-1.5 w-1.5 rounded-full bg-line-strong"
//           />
//           <span
//             aria-hidden
//             className="h-1.5 w-1.5 rounded-full bg-line-strong"
//           />
//           <span
//             aria-hidden
//             className="h-1.5 w-1.5 rounded-full bg-line-strong"
//           />
//         </div>
//         <div className="relative aspect-[16/10]">
//           <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />
//           <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
//             <span
//               aria-hidden
//               className="flex h-10 w-10 items-center justify-center border border-line-strong bg-paper-white"
//             >
//               <svg
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.5"
//                 className="text-ink-400"
//               >
//                 <rect x="3" y="5" width="18" height="14" rx="1" />
//                 <circle cx="9" cy="10" r="1.6" />
//                 <path d="m5 17 4.5-4 3 2.5L17 11l4 4" />
//               </svg>
//             </span>
//             <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-400">
//               Screenshot coming soon
//             </span>
//           </div>
//         </div>
//       </div>
//       <figcaption className="mt-3 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-400">
//         <span aria-hidden className="h-px w-4 flex-none bg-line-strong" />
//         {label}
//       </figcaption>
//     </figure>
//   );
// }

/**
 * A case study:
 *
 *   hero → introduction → key challenges & solutions → key capabilities →
 *   project screenshots → technology & capabilities → outcome & impact →
 *   next project
 *
 * Every word and figure comes from the project's brief in
 * `case-study-details.ts`; nothing is written for the layout.
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

  const next = getNextProject(projects, slug);
  const phase = PHASE_STYLE[project.phase];

  /* The first screenshot leads the hero's product visual; the rest fill the
     gallery below. A project with a single screenshot spends it on the hero
     and shows no gallery, so the same image never appears twice. */
  // const galleryShots = detail.screenshots.slice(1);

  return (
    <>
      <Nav services={chrome.services} industries={chrome.industries} socials={chrome.socials} />
      <main id="main">
        <CaseStudyHero
          project={project}
          stats={detail.stats}
          meta={detail.meta}
        />

        {/* -------------------------------------------------- Overview ----
            One centred statement, as the industry page opens with: the
            brief's summary and the project's facts, then the brief's own
            rows — industry, scale, client — as a grid. */}
        <section className="relative overflow-hidden border-b border-line bg-paper-deep">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />
          <Container wide className="relative z-10 py-16 lg:py-20">
            <div className="mx-auto max-w-[860px] text-center">
              <h2 className="text-h3 text-ink">Project Overview</h2>
              <span
                aria-hidden
                className="mx-auto mt-6 block h-px w-full bg-line-strong"
              />
              <p className="mx-auto mt-6 max-w-[62ch] text-[17px] leading-[1.75] text-ink-500 lg:text-[18px]">
                {detail.summary}
              </p>
              <FactLine
                facts={project.facts}
                className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-400"
              />
            </div>
            <FactGrid rows={factRows(detail.meta)} />
          </Container>
        </section>

        {/* ---------------------------------- Challenges & solutions ---- */}
        <ChallengeShowcase
          lead={detail.challengesLead}
          challenges={detail.challenges}
        />

        {/* --------------------------------------------- Screenshots ----
            Hidden for now. The lead capture sits in the hero; restore this
            block (and `galleryShots`, `ScreenshotGallery` and
            `ScreenshotPlaceholder` above) to bring the gallery back. Inner
            comment markers are written as `{/ * … * /}` so this one comment
            can hold them.

          {/ * --------------------------------------------- Screenshots ----
              The lead image sits in the hero, so this carries the rest. A
              project with exactly one screenshot spent it up top and skips this
              section entirely; one with none shows the placeholder frames. * /}
          {(detail.screenshots.length === 0 || galleryShots.length > 0) && (
            <section className="relative overflow-hidden border-b border-line bg-paper-deep">
              <div
                aria-hidden
                className="absolute inset-0 grid-paper opacity-70"
              />
              <Container wide className="py-14 lg:py-20">
                <Eyebrow index="04" label="Project Screenshots" />
                <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
                  <h2 className="text-h3 text-ink">The platform, on screen.</h2>
                  {detail.screenshots.length === 0 && (
                    <p className="max-w-[46ch] pb-1 text-[13.5px] leading-[1.7] text-ink-400">
                      Screenshots for this project are being prepared — the frames
                      below will carry them as they arrive.
                    </p>
                  )}
                </div>

                {galleryShots.length > 0 ? (
                  <ScreenshotGallery shots={galleryShots} />
                ) : (
                  <div className="mt-10 grid max-w-full gap-6 lg:mt-12 lg:gap-8 sm:grid-cols-3">
                    {[1, 2].map((n, i) => (
                      <Wipe key={n} delay={i * 0.08}>
                        <ScreenshotPlaceholder
                          label={`${detail.title} — view ${n}`}
                        />
                      </Wipe>
                    ))}
                  </div>
                )}
              </Container>
            </section>
          )}
        */}

        {/* ------------------------------------------ Outcome & impact ----
            Light, so the page keeps its rhythm after the dark challenges. */}
        <CaseStudySection
          id="outcome"
          label="Outcome & Impact"
          title="What it delivered."
          tone="white"
          lead={<p>{detail.resultsLead}</p>}
        >
          <ul className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 md:[&>li:last-child:nth-child(odd)]:col-span-2">
            {detail.results.map((result, i) => (
              <li
                key={i}
                className="flex items-start gap-4 bg-paper-white p-6 transition-colors duration-500 hover:bg-azure-50/60 lg:p-8"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-azure text-paper"
                >
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="text-[15px] leading-[1.7] text-ink-700">
                  {result}
                </span>
              </li>
            ))}
          </ul>
        </CaseStudySection>

        {/* --------------------------------------------- Next project ----
            One wide card: the project's lead screen, drawn as the Selected
            Work cards draw it, beside its name and line. */}
        {next && (
          <section
            aria-labelledby="next-project-heading"
            className="border-t border-line bg-paper"
          >
            <Container wide className="py-16 lg:py-24">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 flex-none bg-azure" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                    Next Project
                  </span>
                </div>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500 transition-colors hover:text-ink"
                >
                  <ArrowLeft size={13} aria-hidden />
                  All work
                </Link>
              </div>

              <Frame
                as="a"
                href={`/case-studies/${next.slug}`}
                tint={PHASE_STYLE[next.phase].tint}
                className="mt-8 block lg:mt-10"
                innerClassName="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
              >
                <ProjectShot
                  project={next}
                  className="border-b lg:border-b-0 lg:border-r"
                />
                <div className="flex flex-col p-6 lg:p-10 xl:p-12">
                  <span
                    className={cn(
                      "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]",
                      PHASE_STYLE[next.phase].text,
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn("h-1.5 w-1.5 rounded-full", PHASE_STYLE[next.phase].dot)}
                    />
                    {next.sector.split("·")[0].trim()}
                  </span>
                  <h2
                    id="next-project-heading"
                    className="mt-5 text-h3 text-ink"
                  >
                    {next.title}
                  </h2>
                  <p className="mt-4 max-w-[46ch] text-[15.5px] leading-[1.7] text-ink-500">
                    {next.tagline}
                  </p>
                  <CardFoot>View details</CardFoot>
                </div>
              </Frame>
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

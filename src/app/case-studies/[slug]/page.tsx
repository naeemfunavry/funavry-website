import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  KeyRound,
  Languages,
  Layers,
  Plug,
  Search,
  Shield,
  Stethoscope,
  TrendingUp,
  Truck,
  Video,
  Wallet,
  WifiOff,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import ScreenshotGallery from "@/components/ui/ScreenshotGallery";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import CaseStudyHero from "@/components/work/CaseStudyHero";
import CaseStudySection from "@/components/work/CaseStudySection";
import ProjectVisual from "@/components/work/ProjectVisual";
import { PHASE_STYLE } from "@/components/work/phase";
import {
  CASE_STUDY_DETAILS,
  getCaseStudyDetail,
} from "@/lib/case-study-details";
import { getNextProject, getWorkProject, metaParts } from "@/lib/work";
import { cn } from "@/lib/utils";

type Params = { slug: string };

/** A relevant icon for a challenge, chosen from keywords in its title (first
 *  rule to match wins), with a neutral fallback. Picks the badge glyph without
 *  needing a hand-authored icon on every one of the briefs' challenges. */
const CHALLENGE_ICON_RULES: [RegExp, LucideIcon][] = [
  [/secur|fraud|complian|risk|privacy|blacklist|\bkyc\b|\baml\b/, Shield],
  [/scal|throughput|volume|performance|high-traffic|concurren/, TrendingUp],
  [/offline|connectivity|\bsync\b/, WifiOff],
  [/payment|billing|revenue|reconcil|commission/, CreditCard],
  [
    /form|template|configur|master data|hard-coded|check-sheet|filing/,
    FileText,
  ],
  [/workflow|routing|dispatch|assignment|handoff|sequential|manual/, Workflow],
  [/visibility|dashboard|report|analytic|\bkpi\b|metric|insight/, BarChart3],
  [/prescrib|clinic|patient|health|medical/, Stethoscope],
  [/identity|auth|login|verif|onboard/, KeyRound],
  [/integrat|disconnected|fragment|separate|silo|\berp\b|\bapi\b/, Plug],
  [/search|discover|\bfind\b|research|navigat|buried/, Search],
  [/video|stream|scene|on-screen|\btag|annotat|vision|shop/, Video],
  [/language|bilingual|translat/, Languages],
  [/crypto|wallet|token|chain|custody|launch|yield/, Wallet],
  [/tutor|lesson|student|educat|learn/, GraduationCap],
  [/truck|transport|logistic|driver|vehicle|expired/, Truck],
  [/incident|corrective|audit|trail|lost/, ClipboardList],
  [/data|document|unstructured|extraction|\bocr\b|record/, FileText],
];

function challengeIcon(title: string): LucideIcon {
  const t = title.toLowerCase();
  for (const [re, Icon] of CHALLENGE_ICON_RULES) if (re.test(t)) return Icon;
  return Layers;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return CASE_STUDY_DETAILS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const detail = getCaseStudyDetail((await params).slug);
  if (!detail) return {};
  return {
    title: `${detail.title} — Funavry Technologies`,
    description: detail.summary,
  };
}

/** Section eyebrow: index number, hairline, mono label. */
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

/** A screenshot slot awaiting its capture — replaced by adding a real path to
    `screenshots` in case-study-details.ts. The layout does not change. */
function ScreenshotPlaceholder({ label }: { label: string }) {
  return (
    <figure className="group/shot">
      <div className="overflow-hidden border border-line bg-paper-white shadow-[0_22px_50px_-26px_rgba(46,52,54,0.35)]">
        <div className="flex items-center gap-1.5 border-b border-line px-3.5 py-2.5">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-line-strong"
          />
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-line-strong"
          />
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-line-strong"
          />
        </div>
        <div className="relative aspect-[16/10]">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center border border-line-strong bg-paper-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-ink-400"
              >
                <rect x="3" y="5" width="18" height="14" rx="1" />
                <circle cx="9" cy="10" r="1.6" />
                <path d="m5 17 4.5-4 3 2.5L17 11l4 4" />
              </svg>
            </span>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-400">
              Screenshot coming soon
            </span>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-400">
        <span aria-hidden className="h-px w-4 flex-none bg-line-strong" />
        {label}
      </figcaption>
    </figure>
  );
}

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
  const detail = getCaseStudyDetail(slug);
  const project = getWorkProject(slug);
  if (!detail || !project) notFound();

  const next = getNextProject(slug);
  const phase = PHASE_STYLE[project.phase];

  const services = metaParts(
    detail.meta.find((m) => /^service$/i.test(m.label))?.value ?? "",
  );
  /* Technologies leads the spec sheet; the other rows keep the brief's order. */
  const isTech = (label: string) => /technolog/i.test(label);
  const specRows = [...detail.meta].sort(
    (a, b) => Number(isTech(b.label)) - Number(isTech(a.label)),
  );

  /* The first screenshot leads the hero's product visual; the rest fill the
     gallery below. A project with a single screenshot spends it on the hero
     and shows no gallery, so the same image never appears twice. */
  const galleryShots = detail.screenshots.slice(1);

  return (
    <>
      <Nav />
      <main id="main">
        <CaseStudyHero project={project} summary={detail.summary} />

        {/* -------------------------------------------- Introduction ---- */}
        <section className="relative overflow-hidden border-t border-line bg-white">
          {/* Blueprint paper. */}
          <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />
          {/* Very light washes, one per half of the network. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 42%, rgba(68,158,216,0.06), transparent 70%), radial-gradient(40% 40% at 92% 78%, rgba(245,159,19,0.05), transparent 70%), radial-gradient(40% 40% at 6% 20%, rgba(55,96,121,0.045), transparent 70%)",
            }}
          />

          <Container wide className="py-14 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-20">
              <div>
                <Eyebrow index="01" label="Introduction" />
                <h2 className="mt-6 text-h3 text-ink">{detail.introHeading}</h2>
              </div>
              <div className="space-y-5">
                {detail.intro.map((paragraph, i) => (
                  <Wipe key={i} delay={i * 0.08}>
                    <p className="text-[15.5px] leading-[1.8] text-ink-500">
                      {paragraph}
                    </p>
                  </Wipe>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ---------------------------------- Challenges & solutions ---- */}
        <section className="relative overflow-hidden bg-paper py-10 lg:py-14">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 55% at 88% 0%, rgba(68,158,216,0.10), transparent 62%), radial-gradient(60% 50% at 8% 100%, rgba(245,159,19,0.05), transparent 65%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 grid-paper opacity-[0.5]"
          />
          <Container wide className="py-14 lg:py-20">
            <Eyebrow index="02" label="Key Challenges & Solutions" />
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
              <h2 className="max-w-[24ch] text-h2 text-ink">
                <KineticWords text="The problems, and how they were solved." />
              </h2>
              <p className="max-w-[46ch] pb-1 text-[14.5px] leading-[1.7] text-ink-500">
                {detail.challengesLead}
              </p>
            </div>

            {/* Desktop hint — the solution is revealed on hover. */}
            <p className="mt-8 hidden text-right font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 md:block">
              Hover a card to reveal its solution
            </p>

            {/* Each row: the problem on the left, connected to a card that reads
                its Challenge and crossfades to the Solution on hover. The right
                card is a stacked grid cell (both layers share it, so it sizes to
                the taller and the swap never reflows). On touch — no hover — the
                two simply stack and both stay visible. */}
            <div className="mt-4 space-y-5 lg:space-y-6">
              {detail.challenges.map((item, i) => {
                const Icon = challengeIcon(item.title);
                return (
                  <Wipe key={item.title} delay={i * 0.05}>
                    <div className="group/row grid gap-4 md:grid-cols-[minmax(0,300px)_56px_minmax(0,1fr)] md:gap-0">
                      {/* Left — the problem area */}
                      <div className="flex items-center gap-4 border border-line bg-paper-white p-5 transition-colors duration-500 group-hover/row:border-line-strong lg:p-6">
                        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-ink text-paper">
                          <Icon size={19} strokeWidth={1.6} aria-hidden />
                        </span>
                        <h3 className="text-[16px] font-semibold leading-snug tracking-[-0.015em] text-ink lg:text-[17px]">
                          {item.title}
                        </h3>
                      </div>

                      {/* Connector (desktop) — its node shifts amber → azure as the
                        card turns from challenge to solution. */}
                      <div className="relative hidden items-center md:flex">
                        <span
                          aria-hidden
                          className="h-px w-full bg-line-strong"
                        />
                        <span
                          aria-hidden
                          className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber bg-paper-white transition-colors duration-500 ease-expo group-hover/row:border-azure"
                        />
                      </div>

                      {/* Right — Challenge / Solution stacked in one grid cell */}
                      <div className="relative border border-line bg-paper-white p-5 transition-colors duration-500 group-hover/row:border-line-strong md:grid lg:p-6">
                        {/* Challenge (default) */}
                        <div className="transition-all duration-500 ease-expo md:[grid-area:1/1] md:group-hover/row:-translate-y-1 md:group-hover/row:opacity-0 md:group-hover/row:pointer-events-none">
                          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-5">
                            <span className="shrink-0 text-[16px] font-semibold tracking-[-0.01em] text-amber-ink sm:w-[92px]">
                              Challenge
                            </span>
                            <p className="text-[14px] leading-[1.7] text-ink-500">
                              {item.challenge}
                            </p>
                          </div>
                        </div>

                        {/* Solution (on hover; stacked below on touch) */}
                        <div className="mt-4 border-t border-line pt-4 transition-all duration-500 ease-expo md:mt-0 md:translate-y-1 md:border-t-0 md:pt-0 md:opacity-0 md:[grid-area:1/1] md:pointer-events-none md:group-hover/row:translate-y-0 md:group-hover/row:opacity-100 md:group-hover/row:pointer-events-auto">
                          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-5">
                            <span className="shrink-0 text-[16px] font-semibold tracking-[-0.01em] text-azure-ink sm:w-[92px]">
                              Solution
                            </span>
                            <p className="text-[14px] leading-[1.7] text-ink-700">
                              {item.solution}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Wipe>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ------------------------------------------ Key capabilities ---- */}
        <CaseStudySection
          id="capabilities"
          label="Key Capabilities"
          title="What the platform brings together."
          tone="white"
        >
          <dl className="grid border-l border-t border-line sm:grid-cols-3">
            {detail.stats.map((stat) => (
              <div
                key={stat.value}
                className="flex flex-col-reverse justify-end gap-4 border-b border-r border-line p-6 lg:p-8"
              >
                <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-400">
                  {stat.label}
                </dt>
                <dd className="text-[24px] font-medium leading-[1.1] tracking-[-0.025em] text-ink lg:text-[30px]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          {services.length > 0 && (
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:gap-8">
              <span className="flex-none font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-400">
                Delivered as
              </span>
              <ul className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <li
                    key={service}
                    className="border border-line bg-paper px-3 py-1.5 text-[13px] leading-[1.5] text-ink-700"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CaseStudySection>

        {/* --------------------------------------------- Screenshots ----
            The lead image sits in the hero, so this carries the rest. A
            project with exactly one screenshot spent it up top and skips this
            section entirely; one with none shows the placeholder frames. */}
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

        {/* ------------------------------------ Technology & capabilities ---- */}
        <CaseStudySection
          id="technology"
          label="Technology & Capabilities"
          title="How it was delivered."
          tone="white"
        >
          <dl className="border-t border-line">
            {specRows.map((row) => {
              const tech = isTech(row.label);
              const parts = tech
                ? metaParts(row.value)
                : row.value
                    .split("·")
                    .map((part) => part.trim())
                    .filter(Boolean);
              return (
                <div
                  key={row.label}
                  className="grid gap-3 border-b border-line py-5 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:gap-8"
                >
                  <dt className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-400 sm:pt-2">
                    <span
                      aria-hidden
                      className={cn("h-1 w-1 flex-none rounded-full", phase.dot)}
                    />
                    {row.label}
                  </dt>
                  <dd className="flex flex-wrap gap-2">
                    {parts.map((part) => (
                      <span
                        key={part}
                        className={cn(
                          "px-3 py-1.5 text-[13px] leading-[1.5] text-ink-700",
                          tech
                            ? "rounded-full border border-line-strong bg-paper-white"
                            : "border border-line bg-paper",
                        )}
                      >
                        {part}
                      </span>
                    ))}
                  </dd>
                </div>
              );
            })}
          </dl>
        </CaseStudySection>

        {/* ------------------------------------------ Outcome & impact ---- */}
        <CaseStudySection
          id="outcome"
          label="Outcome & Impact"
          title="What it delivered."
          tone="dark"
          lead={<p>{detail.resultsLead}</p>}
        >
          <ul className="grid gap-px overflow-hidden border border-paper/10 bg-paper/10 md:grid-cols-2 md:[&>li:last-child:nth-child(odd)]:col-span-2">
            {detail.results.map((result, i) => (
              <li key={i} className="flex items-start gap-4 bg-ink-900 p-6 lg:p-8">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-azure text-paper"
                >
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="text-[15px] leading-[1.7] text-paper/80">
                  {result}
                </span>
              </li>
            ))}
          </ul>
        </CaseStudySection>

        {/* --------------------------------------------- Next project ---- */}
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

              {/* The whole block is one link — clicking the visual, the title
                  or the text all open the next project's details. */}
              <Link
                href={`/case-studies/${next.slug}`}
                aria-label={`${next.title} — view details`}
                className="group mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16"
              >
                <div>
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.2em]",
                      PHASE_STYLE[next.phase].text,
                    )}
                  >
                    {next.sector}
                  </span>
                  <h2
                    id="next-project-heading"
                    className="mt-5 text-h2 text-ink transition-transform duration-500 ease-smooth group-hover:translate-x-1"
                  >
                    {next.title}
                  </h2>
                  <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.7] text-ink-500">
                    {next.tagline}
                  </p>
                  <span className="mt-8 inline-flex items-center gap-2 text-[13.5px] font-medium text-ink">
                    View details
                    <ArrowRight
                      size={14}
                      aria-hidden
                      className="transition-transform duration-500 ease-smooth group-hover:translate-x-1"
                    />
                  </span>
                </div>

                <ProjectVisual
                  media={next.media}
                  title={next.title}
                  sector={next.sector}
                  phase={next.phase}
                  variant="card"
                />
              </Link>
            </Container>
          </section>
        )}

        <Contact />
      </main>
      <Footer />
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";
import type { WorkProject } from "@/lib/work-model";

const sectorOf = (p: WorkProject) => p.sector.split("·")[0].trim();
const shotOf = (p: WorkProject) => p.media.primary ?? p.media.phones[0] ?? null;

/**
 * Selected Work: a head in the page's eyebrow-and-title style with the way
 * to the full portfolio beside it, then the lead project as one featured card
 * on the left and up to three more as numbered rows on the right — capture,
 * name, sector, arrow.
 *
 * Every card is one link; its round arrow answers the card's hover as the
 * site's other arrows do — a quarter turn into amber.
 */
export default function WorkTiles({
  id,
  label = "Our Work",
  title,
  body,
  projects,
  more = { label: "View All Projects", href: "/case-studies" },
}: {
  id: string;
  label?: string;
  title: string;
  body: string;
  /** The lead project first; up to three more follow it. */
  projects: WorkProject[];
  more?: { label: string; href: string };
}) {
  if (projects.length === 0) return null;
  const [lead, ...rest] = projects;
  const rows = rest.slice(0, 3);

  return (
    <section
      aria-labelledby={id}
      className="relative overflow-hidden border-b border-line bg-paper"
    >
      {/* The home Industries section's ground: paper under the drafting grid. */}
      <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />
      <Container wide className="relative py-10 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                {label}
              </span>
            </div>
            <h2 id={id} className="mt-6 text-h3 text-ink">
              {title}
            </h2>
            <p className="mt-4 max-w-[56ch] text-[15.5px] leading-[1.7] text-ink-500">
              {body}
            </p>
          </div>
          <Button
            href={more.href}
            variant="primary"
            size="md"
            arrow
            className="flex-none self-start lg:self-auto"
          >
            {more.label}
          </Button>
        </div>

        <div className="mt-8 grid gap-3 lg:mt-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-4">
          <Wipe>
            <Featured project={lead} />
          </Wipe>

          {rows.length > 0 && (
            <ul className="grid gap-3">
              {rows.map((project, i) => (
                <li key={project.slug} className="h-full">
                  <Wipe delay={0.06 * (i + 1)} className="h-full">
                    <Row project={project} index={i + 2} />
                  </Wipe>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}

/** The site's round arrow: solid ink, turning a quarter into amber on the
    card's hover. */
function CardArrow({ large = false }: { large?: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex flex-none items-center justify-center rounded-full bg-ink-900 text-paper transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:bg-amber group-hover:text-ink-900 ${
        large ? "h-11 w-11" : "h-9 w-9"
      }`}
    >
      <ArrowUpRight size={large ? 18 : 16} />
    </span>
  );
}

const CARD =
  "group relative flex h-full overflow-hidden rounded-lg bg-paper-white ring-1 ring-line outline-none transition-[box-shadow,transform] duration-500 ease-smooth hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgba(15,23,42,0.35)] hover:ring-azure/50 focus-visible:ring-2 focus-visible:ring-azure";

function Featured({ project }: { project: WorkProject }) {
  const shot = shotOf(project);

  return (
    <Link
      href={`/case-studies/${project.slug}`}
      aria-label={`${project.title} — view details`}
      className={`${CARD} flex-col`}
    >
      <div className="relative aspect-[16/7] overflow-hidden bg-paper-deep">
        {shot ? (
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            quality={90}
            sizes="(max-width: 1024px) 92vw, 720px"
            className="object-cover object-left-top transition-transform duration-[900ms] ease-expo group-hover:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 grid-paper" />
        )}
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-paper-white py-1 pl-1 pr-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink shadow-[0_8px_24px_-10px_rgba(15,23,42,0.5)] ring-1 ring-line">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-azure text-paper">
            <Star size={11} fill="currentColor" aria-hidden />
          </span>
          Featured Project
        </span>
      </div>

      <div className="flex flex-1 items-end gap-4 p-4 lg:p-5">
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-azure-600">
            <span aria-hidden className="h-px w-6 flex-none bg-azure" />
            {sectorOf(project)}
          </span>
          <h3 className="mt-3 line-clamp-2 text-[17px] font-medium leading-[1.3] tracking-[-0.015em] text-ink lg:text-[19px]">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-1 max-w-[56ch] text-[13.5px] leading-[1.6] text-ink-500">
            {project.tagline}
          </p>
          {project.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-line-strong px-2.5 py-1 text-[11px] leading-none text-ink-500"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
        <CardArrow large />
      </div>
    </Link>
  );
}

function Row({ project, index }: { project: WorkProject; index: number }) {
  const shot = shotOf(project);

  return (
    <Link
      href={`/case-studies/${project.slug}`}
      aria-label={`${project.title} — view details`}
      className={`${CARD} items-center gap-3.5 p-3 sm:gap-4`}
    >
      <span className="hidden w-6 flex-none font-mono text-[13px] tabular-nums tracking-[0.08em] text-ink-400 transition-colors duration-300 group-hover:text-azure-600 sm:block">
        {String(index).padStart(2, "0")}
      </span>

      <div className="relative aspect-[4/3] w-[30%] max-w-[118px] flex-none overflow-hidden rounded-md bg-paper-deep ring-1 ring-line">
        {shot && (
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            sizes="118px"
            className={
              shot.kind === "mobile"
                ? "object-contain p-2"
                : "object-cover object-left-top transition-transform duration-[900ms] ease-expo group-hover:scale-[1.06]"
            }
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3
          title={project.title}
          className="line-clamp-2 text-[15px] font-medium leading-[1.3] tracking-[-0.01em] text-ink lg:text-[15.5px]"
        >
          {project.title}
        </h3>
        <span className="mt-1.5 block truncate font-mono text-[9.5px] uppercase tracking-[0.2em] text-azure-600">
          {sectorOf(project)}
        </span>
      </div>

      <CardArrow />
    </Link>
  );
}

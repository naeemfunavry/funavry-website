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
 * name, short description, arrow.
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
  ground = "paper",
}: {
  /** The section's ground: paper under the drafting grid, or the Industries
      We Serve band's pale azure, for a page where the two sit together. */
  ground?: "paper" | "azure";
  id: string;
  label?: string;
  title: React.ReactNode;
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
      className={`relative overflow-hidden border-b border-line ${
        ground === "azure"
          ? "bg-[linear-gradient(180deg,#EAF4FC_0%,#D6E9F8_100%)]"
          : "bg-paper"
      }`}
    >
      {ground === "azure" ? (
        <>
          {/* Industries We Serve's ground: a faint grid under two azure
              glows. */}
          <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(45% 55% at 90% 8%, rgba(68,158,216,0.24), transparent 70%), radial-gradient(35% 50% at 86% 78%, rgba(68,158,216,0.26), transparent 70%)",
            }}
          />
        </>
      ) : (
        /* The home Industries section's ground: paper under the drafting grid. */
        <div aria-hidden className="absolute inset-0 grid-paper opacity-70" />
      )}
      <Container wide className="relative py-8 sm:py-12 lg:py-14">
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
            variant="accent"
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

/** The site's round arrow, turning a quarter into amber on the card's hover:
    paper on the dark cards. */
function CardArrow({
  onDark = false,
  large = false,
}: {
  onDark?: boolean;
  large?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`relative flex flex-none items-center justify-center rounded-full transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:bg-amber group-hover:text-ink-900 ${
        onDark ? "bg-paper text-ink-900" : "bg-ink-900 text-paper"
      } ${large ? "h-11 w-11" : "h-9 w-9"}`}
    >
      <ArrowUpRight size={large ? 18 : 16} />
    </span>
  );
}

/** Every card's deep navy, the featured card and the rows alike; the
    featured capture fades into it. */
const DEEP = "#102E54";

/** The capture's mask: solid at the top, easing out to nothing at the foot
    over several stops, and softened a touch at either side. */
const FADE =
  "linear-gradient(to bottom, #000 0%, #000 35%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.25) 80%, rgba(0,0,0,0.08) 90%, transparent 100%), linear-gradient(to right, rgba(0,0,0,0.75), #000 18%, #000 82%, rgba(0,0,0,0.75))";

/** Each row's accent, the logo's colours in turn: its number chip, its left
    edge and its sector label. */
const ACCENTS = [
  {
    chip: "bg-azure/15 text-azure-300 ring-azure/30",
    edge: "bg-azure",
    text: "text-steel-100",
  },
  {
    chip: "bg-amber/15 text-amber-300 ring-amber/30",
    edge: "bg-amber",
    text: "text-steel-100",
  },
  {
    chip: "bg-steel-300/15 text-steel-100 ring-steel-300/30",
    edge: "bg-steel-300",
    text: "text-steel-100",
  },
];

const CARD =
  "group relative flex h-full overflow-hidden rounded-lg outline-none transition-[box-shadow,transform] duration-500 ease-smooth hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function Featured({ project }: { project: WorkProject }) {
  const shot = shotOf(project);

  return (
    <Link
      href={`/case-studies/${project.slug}`}
      aria-label={`${project.title} — view details`}
      className={`${CARD} isolate flex-col transform-gpu [backface-visibility:hidden] hover:shadow-[0_30px_60px_-28px_rgba(16,46,84,0.65)]`}
      style={{ background: DEEP }}
    >
      {/* The ground: the dark grid, an azure glow low on the right and a
          touch of amber low on the left. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-paper-dark opacity-40"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(60% 55% at 100% 100%, rgba(68,158,216,0.35), transparent 70%), radial-gradient(40% 40% at 0% 100%, rgba(245,159,19,0.12), transparent 70%)",
        }}
      />

      {/* The capture, full bleed, masked to transparent at the foot and a
          little at the sides, so the ground itself shows through the fade —
          glow, grid and all — and there is no seam. */}
      <div className="relative aspect-[16/8]">
        {shot ? (
          <div
            className="absolute inset-0"
            style={{
              maskImage: FADE,
              WebkitMaskImage: FADE,
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              quality={90}
              sizes="(max-width: 1024px) 92vw, 720px"
              className="object-cover object-left-top opacity-85 transition-opacity duration-700 ease-smooth group-hover:opacity-100"
            />
          </div>
        ) : (
          <span className="absolute inset-0 grid-paper-dark" />
        )}
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-paper-white py-1 pl-1 pr-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink shadow-[0_8px_24px_-10px_rgba(15,23,42,0.5)] ring-1 ring-line">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-azure text-paper">
            <Star size={11} fill="currentColor" aria-hidden />
          </span>
          Featured Project
        </span>
      </div>

      {/* The copy, pulled up over the fade. */}
      <div className="relative -mt-14 flex flex-1 items-end gap-4 p-4 lg:-mt-16 lg:p-6">
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-azure-300">
            <span aria-hidden className="h-px w-6 flex-none bg-current" />
            {sectorOf(project)}
          </span>
          <h3 className="mt-3 line-clamp-2 text-[18px] font-medium leading-[1.3] tracking-[-0.015em] text-paper lg:text-[21px]">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-1 max-w-[56ch] text-[13.5px] leading-[1.6] text-paper/65">
            {project.tagline}
          </p>
          {project.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] leading-none text-paper/75"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
        <CardArrow onDark large />
      </div>
    </Link>
  );
}

function Row({ project, index }: { project: WorkProject; index: number }) {
  const shot = shotOf(project);
  const accent = ACCENTS[(index - 2) % ACCENTS.length];

  return (
    <Link
      href={`/case-studies/${project.slug}`}
      aria-label={`${project.title} — view details`}
      className={`${CARD} isolate items-center gap-3.5 p-3 ring-1 ring-white/10 hover:shadow-[0_30px_60px_-30px_rgba(16,46,84,0.65)] hover:ring-white/25 sm:gap-4`}
      style={{ background: DEEP }}
    >
      {/* The same ground as the featured card: the dark grid and an azure
          glow, here on the right. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-paper-dark opacity-40"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(50% 120% at 100% 50%, rgba(68,158,216,0.28), transparent 70%)",
        }}
      />

      {/* The accent's edge, drawing down on hover. */}
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 transition-transform duration-500 ease-expo group-hover:scale-y-100 ${accent.edge}`}
      />

      <span
        className={`relative hidden h-8 w-8 flex-none items-center justify-center rounded-full font-mono text-[12px] tabular-nums ring-1 sm:flex ${accent.chip}`}
      >
        {String(index).padStart(2, "0")}
      </span>

      <div className="relative aspect-[4/3] w-[30%] max-w-[118px] flex-none overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
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

      <div className="relative min-w-0 flex-1">
        <h3
          title={project.title}
          className="line-clamp-2 text-[15px] font-medium leading-[1.3] tracking-[-0.01em] text-paper lg:text-[15.5px]"
        >
          {project.title}
        </h3>
        {project.tagline && (
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.5] text-paper/70 sm:text-[13px]">
            {project.tagline}
          </p>
        )}
      </div>

      <CardArrow onDark />
    </Link>
  );
}

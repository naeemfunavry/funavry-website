import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";
import type { WorkProject } from "@/lib/work-model";

/* The section's own paper, which the tiles' notches are cut from — the notch
   and its two inverted corners are painted in it, so they read as holes. */
const PAPER = "#F5F6F4";
/** Radius of the notch's curves. */
const R = 20;
/** Side of the notch, button included. */
const NOTCH = 68;

/**
 * Selected Work as image tiles: a head with a pill label, title, a line and a
 * "See more" button, then square captures with rounded corners, each with a
 * notch cut from its bottom-right corner holding a round arrow button. The
 * whole tile is the link; the project's name rises in over its foot on hover.
 */
export default function WorkTiles({
  id,
  label = "Our Work",
  title,
  body,
  projects,
  more = { label: "See more", href: "/case-studies" },
}: {
  id: string;
  label?: string;
  title: string;
  body: string;
  projects: WorkProject[];
  more?: { label: string; href: string };
}) {
  if (projects.length === 0) return null;

  return (
    <section aria-labelledby={id} className="border-b border-line bg-paper">
      <Container wide className="py-16 lg:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <span className="inline-flex items-center rounded-full border border-ink/25 px-3.5 py-1 text-[12.5px] font-medium text-ink">
              {label}
            </span>
            <h2 id={id} className="mt-5 text-h3 text-ink">
              {title}
            </h2>
            <p className="mt-4 max-w-[56ch] text-[15.5px] leading-[1.7] text-ink-500">
              {body}
            </p>
          </div>
          <Link
            href={more.href}
            className="group inline-flex min-h-[46px] flex-none items-center gap-3 self-start rounded-full bg-ink-900 pl-6 pr-5 text-[14px] font-semibold text-paper transition-colors duration-300 hover:bg-ink lg:self-auto"
          >
            {more.label}
            <ArrowUpRight
              size={17}
              aria-hidden
              className="transition-transform duration-300 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {projects.map((project, i) => (
            <li key={project.slug}>
              <Wipe delay={(i % 3) * 0.06}>
                <Tile project={project} />
              </Wipe>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Tile({ project }: { project: WorkProject }) {
  const shot = project.media.primary ?? project.media.phones[0] ?? null;

  return (
    <Link
      href={`/case-studies/${project.slug}`}
      aria-label={`${project.title} — view details`}
      className="group relative block aspect-square overflow-hidden rounded-[28px] bg-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-azure focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
    >
      {shot ? (
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          quality={90}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 460px"
          className="object-cover object-left-top transition-transform duration-[900ms] ease-expo group-hover:scale-[1.05]"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60 grid-paper-dark">
          {project.sector.split("·")[0].trim()}
        </span>
      )}

      {/* The name, rising in over the foot on hover. Kept clear of the
          notch on the right. */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-900/85 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
      />
      <span
        className="absolute bottom-0 left-0 translate-y-3 p-6 text-[16px] font-medium leading-snug tracking-[-0.015em] text-paper opacity-0 transition-all duration-500 ease-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        style={{ right: NOTCH + 8 }}
      >
        {project.title}
      </span>

      {/* The notch, cut from the bottom-right corner: a square of the
          section's paper with a rounded inner corner, and a concave corner
          either side of it so the cut flows into the tile's edges. */}
      <span
        aria-hidden
        className="absolute bottom-0 right-0 flex items-end justify-end pl-2 pt-2"
        style={{
          width: NOTCH,
          height: NOTCH,
          background: PAPER,
          borderTopLeftRadius: R + 4,
        }}
      >
        <span className="flex h-full w-full items-center justify-center rounded-full bg-ink-900 text-paper transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:bg-amber group-hover:text-ink-900">
          <ArrowUpRight size={20} />
        </span>
      </span>
      <span
        aria-hidden
        className="absolute right-0"
        style={{
          bottom: NOTCH,
          width: R,
          height: R,
          background: `radial-gradient(circle at 0 0, transparent ${R}px, ${PAPER} ${R + 0.5}px)`,
        }}
      />
      <span
        aria-hidden
        className="absolute bottom-0"
        style={{
          right: NOTCH,
          width: R,
          height: R,
          background: `radial-gradient(circle at 0 0, transparent ${R}px, ${PAPER} ${R + 0.5}px)`,
        }}
      />
    </Link>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectMockup from "@/components/work/ProjectMockup";
import { getWorkIndex } from "@/lib/api";
import { eligibleScenes } from "@/lib/mockup-assign";
import { buildFeaturedProjects, buildWorkProjects, byVisuals } from "@/lib/work";

export const metadata: Metadata = {
  title: "Mockup lab",
  robots: { index: false, follow: false },
};

/**
 * A workbench for the portfolio scenes: every project in display order, its
 * assigned scene first, then each other scene its captures could fill — from
 * the same data and plan the live cards use. Development only; it 404s in a
 * production build, so it never ships.
 */
export default async function MockupLabPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const projects = buildWorkProjects((await getWorkIndex()).details);
  const featured = buildFeaturedProjects(projects);
  const ordered = [...featured, ...byVisuals(projects).filter((p) => !featured.includes(p))];

  return (
    <main id="main" className="min-h-screen bg-paper px-5 py-12 md:px-10">
      <h1 className="text-h3 text-ink">Project mockup lab</h1>
      <p className="mt-3 max-w-[72ch] text-[15px] leading-[1.7] text-ink-500">
        {ordered.length} projects in grid order. The first frame of each row is
        the scene the card shows; the rest are the other scenes its real
        captures could fill.
      </p>

      <ol className="mt-10 space-y-12">
        {ordered.map((p, i) => {
          const others = eligibleScenes(p).filter((s) => s !== p.mockup.scene);
          return (
            <li key={p.slug}>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                {String(i + 1).padStart(2, "0")} · {p.title}
                <span className="ml-3 text-ink-400">
                  {p.mockup.scene} / {p.mockup.ground}
                  {p.mockup.mirror && " / mirrored"}
                </span>
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <figure className="group">
                  <ProjectMockup
                    project={p}
                    priority={i < 2}
                    sizes="(max-width: 768px) 92vw, 25vw"
                    className="rounded-sm ring-2 ring-amber"
                  />
                  <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink">
                    Assigned
                  </figcaption>
                </figure>
                {others.map((scene) => (
                  <figure key={scene} className="group">
                    <ProjectMockup
                      project={p}
                      scene={scene}
                      sizes="(max-width: 768px) 92vw, 25vw"
                      className="rounded-sm ring-1 ring-line"
                    />
                    <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
                      {scene}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}

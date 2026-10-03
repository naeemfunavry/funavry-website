import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import HeroActions from "@/components/ui/HeroActions";
import { KineticWords, Wipe } from "@/components/ui/Kinetic";
import type { WorkProject } from "@/lib/work-model";

/**
 * The case study opener, laid out as the industry page's hero: the project's
 * lead screen fills the right and fades into the ink under the sector, name
 * and positioning statement on the left, then the project's tags and the way
 * into its Product Showcase.
 *
 * `id="top"` puts the nav in its on-dark style while it sits over this.
 */
export default function CaseStudyHero({
  project,
  hasShowcase,
}: {
  project: WorkProject;
  /** The page has a Product Showcase for the button to scroll to. */
  hasShowcase: boolean;
}) {
  const shot = project.media.primary;

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#102e54] pb-20 pt-[150px] lg:flex lg:min-h-[720px] lg:items-center lg:pb-24"
    >
      {/* The lead screen fills the right, as the industry page's photograph
          does, anchored top-left so the product's header stays in view. */}
      {shot && (
        <div aria-hidden className="absolute inset-0 lg:left-[34%]">
          <Image
            src={shot.src}
            alt=""
            fill
            priority
            quality={90}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover object-left-top"
          />
        </div>
      )}
      {/* Ink over the screen: solid under the copy, clearing to the right. On
          a phone the screen sits behind everything, so it is dimmed evenly. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#102e54]/85 lg:bg-transparent lg:bg-[linear-gradient(90deg,#102E54_0%,#102E54_34%,rgba(16,46,84,0.82)_46%,rgba(16,46,84,0.25)_72%,rgba(16,46,84,0.05)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_80%_at_12%_30%,rgba(68,158,216,0.22),transparent_70%)]"
      />
      <div aria-hidden className="absolute inset-0 grid-paper-dark" />

      <Container wide className="relative z-10 w-full">
        <div className="max-w-[640px]">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber">
            Our Work · {project.sector.split("·")[0].trim()}
          </span>
          <h1 className="mt-5 text-h2 text-paper">
            <KineticWords text={project.title} trigger="mount" />
          </h1>
          <Wipe delay={0.2}>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.7] text-paper/70">
              {project.tagline}
            </p>
          </Wipe>
          {project.tags.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-paper/20 bg-paper/[0.06] px-3.5 py-1.5 text-[12.5px] leading-none text-paper/85 backdrop-blur-sm"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <HeroActions className="mt-9">
            <Button
              href={hasShowcase ? "#showcase" : "/contact"}
              variant="accent"
              size="md"
              arrow
            >
              {hasShowcase ? "View Live Demo" : "Discuss your project"}
            </Button>
          </HeroActions>
        </div>
      </Container>
    </section>
  );
}

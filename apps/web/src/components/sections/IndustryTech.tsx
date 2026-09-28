import Container from "@/components/ui/Container";
import TechIcon from "@/components/ui/TechIcon";

/** One pass of the marquee. Rendered twice so the strip loops without a seam;
    the second copy is hidden from assistive tech. A cell draws an amber
    underline on hover; at rest the strip is plain. */
function Row({
  technologies,
  ariaHidden = false,
}: {
  technologies: string[];
  ariaHidden?: boolean;
}) {
  return (
    <ul aria-hidden={ariaHidden} className="flex flex-none">
      {technologies.map((name) => {
        return (
          <li
            key={name}
            className="group/cell relative flex h-[128px] w-[168px] flex-none flex-col items-center justify-center gap-3 border-r border-line px-6 lg:w-[200px]"
          >
            <TechIcon
              name={name}
              size={34}
              className="flex-none transition-transform duration-300 ease-expo group-hover/cell:scale-110"
            />
            <span className="text-center text-[12.5px] font-medium leading-tight tracking-[-0.01em] text-ink-500 transition-colors duration-300 group-hover/cell:text-ink">
              {name}
            </span>

            {/* Amber underline, drawn in on hover only. */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-amber transition-transform duration-300 ease-expo group-hover/cell:scale-x-100"
            />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The technologies behind an industry's work, as a running strip in the
 * trusted-partner strip's form: a fixed plate on the left, the marks looping
 * past it, paused on hover so a cell can be read. Headed like the page's other
 * sections.
 */
export default function IndustryTech({
  id,
  industry,
  technologies,
}: {
  id: string;
  industry: string;
  technologies: string[];
}) {
  if (technologies.length === 0) return null;

  return (
    <section
      aria-labelledby={id}
      className="border-b border-line bg-paper-white"
    >
      <Container wide className="pt-16 lg:pt-24">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 flex-none bg-azure" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
            Technologies
          </span>
        </div>
        <h2 id={id} className="mt-6 text-h3 text-ink">
          Technologies We Work With
        </h2>

        {/* Stacks below sm, as the trusted-partner strip does, so on a phone
            the marks get the full width rather than a sliver beside the plate. */}
        <div className="mt-10 flex flex-col items-stretch border-y border-line sm:flex-row lg:mt-12">
          <div className="flex flex-none items-center border-b border-line py-6 pr-5 sm:border-b-0 sm:border-r sm:py-8 sm:pr-10 lg:max-w-[300px]">
            <p className="text-[14px] font-medium leading-[1.55] text-ink lg:text-[15px]">
              The stack behind our{" "}
              <span className="text-amber-ink">{industry}</span> work
            </p>
          </div>

          <div className="marquee-mask group/m relative min-w-0 flex-1 overflow-hidden">
            <div className="flex w-max animate-marquee group-hover/m:[animation-play-state:paused]">
              <Row technologies={technologies} />
              <Row technologies={technologies} ariaHidden />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

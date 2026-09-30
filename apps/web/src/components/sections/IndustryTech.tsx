import Container from "@/components/ui/Container";
import TechIcon from "@/components/ui/TechIcon";

/** One pass of the marquee. Rendered twice so the strip loops without a seam;
    the second copy is hidden from assistive tech. Each technology is its own
    white card, mark beside name; the gap lives inside each item (`pr-3`) so
    both passes measure the same and the loop joins cleanly. A card lifts on
    hover. */
function Row({
  technologies,
  ariaHidden = false,
}: {
  technologies: string[];
  ariaHidden?: boolean;
}) {
  return (
    <ul aria-hidden={ariaHidden} className="flex flex-none">
      {technologies.map((name) => (
        <li key={name} className="flex-none pr-3 lg:pr-4">
          <div className="group/cell flex h-[64px] items-center gap-3 rounded-lg border border-line bg-paper-white px-5 shadow-[0_1px_2px_rgba(46,52,54,0.05)] transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_12px_24px_-12px_rgba(46,52,54,0.25)] lg:h-[70px] lg:px-6">
            <TechIcon
              name={name}
              size={26}
              className="flex-none transition-transform duration-300 ease-expo group-hover/cell:scale-110"
            />
            <span className="whitespace-nowrap text-[14px] font-medium tracking-[-0.01em] text-ink-700 transition-colors duration-300 group-hover/cell:text-ink">
              {name}
            </span>
          </div>
        </li>
      ))}
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
    <section aria-labelledby={id} className="border-b border-line bg-steel">
      <Container wide className=" py-8 sm:py-12 lg:py-14">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10 flex-none bg-azure" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-paper/60">
            Technologies
          </span>
        </div>
        <h2 id={id} className="mt-6 text-h3 text-white">
          Technologies We Work With
        </h2>

        {/* Stacks below sm, so on a phone the cards get the full width rather
            than a sliver beside the plate. */}
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8 lg:mt-8">
          {/* <p className="flex-none text-[14px] font-medium leading-[1.55] text-ink sm:max-w-[220px] lg:max-w-[260px] lg:text-[15px]">
            The stack behind our{" "}
            <span className="text-amber-ink">{industry}</span> work
          </p> */}

          {/* Vertical padding so a card's shadow and hover lift aren't clipped
              by the strip's overflow. */}
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

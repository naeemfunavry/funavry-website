import Container from "@/components/ui/Container";
import TechIcon from "@/components/ui/TechIcon";
import DetailHeading from "./DetailHeading";

/** The fewest tiles one pass of the strip holds, so a short stack still
    spans a wide screen; shorter lists repeat to reach it. */
const MIN_PASS = 10;

/** One pass of the strip. Rendered twice so the loop joins without a seam;
    the second copy is hidden from assistive tech. The gap lives inside each
    item (`pr-3`) so both passes measure the same. */
function Pass({ tech, ariaHidden = false }: { tech: string[]; ariaHidden?: boolean }) {
  return (
    <ul aria-hidden={ariaHidden} className="flex flex-none">
      {tech.map((name, i) => (
        <li key={`${name}-${i}`} className="flex-none pr-3 lg:pr-4">
          <div className="flex h-16 items-center gap-3 rounded-lg border border-paper/10 bg-paper/[0.04] px-6 transition-colors duration-300 hover:border-azure/50 hover:bg-paper/[0.07] lg:h-[70px]">
            <TechIcon
              name={name}
              size={22}
              onDark
              className="flex-none"
              monoClassName="flex h-6 min-w-[24px] flex-none items-center justify-center rounded-sm bg-paper/10 px-1 font-mono text-[9px] font-semibold uppercase leading-none text-paper/75"
            />
            <span className="whitespace-nowrap text-[14px] font-medium text-paper/85">
              {name}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Technology Stack: the technologies as tiles — logo and name — sliding past
 * in a loop on the page's one ink band, between the light sections either
 * side. The strip pauses on hover so a tile can be read.
 */
export default function TechStack({
  tech,
  id = "tech-heading",
  lead = "A modern, scalable technology stack built for performance, security and long-term growth.",
}: {
  tech: string[];
  id?: string;
  lead?: string;
}) {
  if (tech.length === 0) return null;

  const pass = Array.from(
    { length: Math.ceil(MIN_PASS / tech.length) },
    () => tech,
  ).flat();

  return (
    <section
      aria-labelledby={id}
      className="relative overflow-hidden bg-ink-900"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_90%_at_10%_0%,rgba(68,158,216,0.18),transparent_70%)]"
      />
      <div aria-hidden className="absolute inset-0 grid-paper-dark" />
      <Container wide className="relative py-14 lg:py-16">
        <DetailHeading
          id={id}
          eyebrow="Technology"
          title="Technology Stack"
          lead={lead}
          dark
        />

        <div className="marquee-mask group/m relative mt-8 overflow-hidden lg:mt-10">
          <div
            className="flex w-max animate-marquee group-hover/m:[animation-play-state:paused] motion-reduce:animate-none"
            style={{ animationDuration: `${pass.length * 4}s` }}
          >
            <Pass tech={pass} />
            <Pass tech={pass} ariaHidden />
          </div>
        </div>
      </Container>
    </section>
  );
}

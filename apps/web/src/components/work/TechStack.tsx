import Container from "@/components/ui/Container";
import TechIcon from "@/components/ui/TechIcon";
import DetailHeading from "./DetailHeading";

/**
 * Technology Stack: the brief's technologies as a row of tiles — logo and
 * name — on the page's one ink band, between the light sections either side.
 */
export default function TechStack({ tech }: { tech: string[] }) {
  if (tech.length === 0) return null;

  return (
    <section
      aria-labelledby="tech-heading"
      className="relative overflow-hidden bg-ink-900"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_90%_at_10%_0%,rgba(68,158,216,0.18),transparent_70%)]"
      />
      <div aria-hidden className="absolute inset-0 grid-paper-dark" />
      <Container wide className="relative py-14 lg:py-16">
        <DetailHeading
          id="tech-heading"
          eyebrow="Technology"
          title="Technology Stack"
          lead="A modern, scalable technology stack built for performance, security and long-term growth."
          dark
        />

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-10 lg:flex lg:flex-wrap">
          {tech.map((name) => (
            <li
              key={name}
              className="flex h-16 items-center justify-center gap-3 rounded-lg border border-paper/10 bg-paper/[0.04] px-6 transition-colors duration-300 hover:border-azure/50 hover:bg-paper/[0.07] lg:min-w-[150px] lg:flex-1"
            >
              <TechIcon
                name={name}
                size={22}
                onDark
                className="flex-none"
                monoClassName="flex h-6 min-w-[24px] flex-none items-center justify-center rounded-sm bg-paper/10 px-1 font-mono text-[9px] font-semibold uppercase leading-none text-paper/75"
              />
              <span className="text-[14px] font-medium text-paper/85">{name}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

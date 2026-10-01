import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Container from "@/components/ui/Container";
import { Wipe } from "@/components/ui/Kinetic";
import type { Industry } from "@/lib/industries";

/**
 * A service page's Industries We Serve: the page's eyebrow-and-title head,
 * then the industries as compact photo cards drawn like the home page's —
 * the industry's photograph under an ink fade, its name, line and proof
 * point — each one link, with the site's round arrow turning into amber on
 * hover.
 */
export default function ServiceIndustries({
  id,
  industries,
}: {
  id: string;
  industries: Industry[];
}) {
  if (industries.length === 0) return null;
  /* Rows come out even: three across when the count divides by three and
     not by four (nine industries make a 3×3, not 4-4-1). */
  const three = industries.length % 3 === 0 && industries.length % 4 !== 0;

  return (
    <section
      aria-labelledby={id}
      className="relative overflow-hidden border-b border-line bg-[linear-gradient(180deg,#F8FBFE_0%,#EEF5FC_100%)]"
    >
      {/* The Compliance & Governance band's ground: a faint grid under two
          azure glows. */}
      <div aria-hidden className="absolute inset-0 grid-paper opacity-40" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 55% at 90% 8%, rgba(68,158,216,0.14), transparent 70%), radial-gradient(35% 50% at 86% 78%, rgba(68,158,216,0.16), transparent 70%)",
        }}
      />
      <Container wide className="relative py-10 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 flex-none bg-azure" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                Industries
              </span>
            </div>
            <h2 id={id} className="mt-6 text-h3 text-ink">
              Industries We Serve
            </h2>
          </div>
          <p className="max-w-[46ch] text-[15.5px] leading-[1.7] text-ink-500">
            The sectors this practice has delivered platforms for —{" "}
            {industries.length} {industries.length === 1 ? "industry" : "industries"}{" "}
            in production.
          </p>
        </div>

        <ul
          className={`mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:gap-4 ${
            three ? "lg:grid-cols-3" : "lg:grid-cols-4"
          }`}
        >
          {industries.map((industry, i) => (
            <li key={industry.slug}>
              <Wipe delay={(i % (three ? 3 : 4)) * 0.05}>
                <IndustryCard industry={industry} wide={three} />
              </Wipe>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function IndustryCard({
  industry,
  wide,
}: {
  industry: Industry;
  /** In a three-across row: a wider, shorter frame keeps the card small. */
  wide: boolean;
}) {
  return (
    <Link
      href={`/industries/${industry.slug}`}
      aria-label={`${industry.name} — view industry`}
      className={`group relative block overflow-hidden ${wide ? "aspect-[16/9]" : "aspect-[4/3]"}  rounded-lg bg-ink-900 outline-none ring-1 ring-line transition-[box-shadow,transform] duration-500 ease-smooth hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(15,23,42,0.5)] focus-visible:ring-2 focus-visible:ring-azure`}
    >
      {industry.image && (
        <Image
          src={industry.image}
          alt=""
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 340px"
          placeholder={industry.blur ? "blur" : "empty"}
          blurDataURL={industry.blur}
          className="object-cover transition-transform duration-[900ms] ease-expo group-hover:scale-[1.06]"
        />
      )}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-ink-900/10"
      />

      <span
        aria-hidden
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink-900 transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:bg-amber"
      >
        <ArrowUpRight size={16} />
      </span>

      <span className="absolute inset-x-0 bottom-0 flex flex-col p-5">
        <span className="text-[16.5px] font-medium leading-snug tracking-[-0.02em] text-paper">
          {industry.name}
        </span>
        {industry.desc && (
          <span className="mt-1.5 line-clamp-2 text-[13px] leading-[1.55] text-paper/70">
            {industry.desc}
          </span>
        )}
        {industry.proof && (
          <span className="mt-3 flex items-center gap-2">
            <span aria-hidden className="h-1 w-1 flex-none rounded-full bg-azure" />
            <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-paper/55">
              {industry.proof}
            </span>
          </span>
        )}
      </span>
    </Link>
  );
}

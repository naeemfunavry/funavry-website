import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Frame from "@/components/ui/Frame";
import ProductWindow from "@/components/ui/ProductWindow";
import { Eyebrow, TextLink } from "@/components/ui/SectionLabel";
import { CASE_PHASE, type CaseStudy } from "@/lib/case-studies";
import { cn } from "@/lib/utils";

/**
 * Three featured case studies as compact tiles, beside a short intro. Shared by
 * the About and Contact pages; the whole tile opens the study's detail page.
 */
export default function SelectedWork({
  caseStudies,
  eyebrow = "Selected work",
  title = "See what we've built.",
  body = "A few of the platforms we've designed, engineered and run — from 14 plants across the US and MENA to a million hits a day.",
  className,
}: {
  /** Supplied by the page, which fetches from the CMS. */
  caseStudies: CaseStudy[];
  eyebrow?: string;
  title?: string;
  body?: string;
  className?: string;
}) {
  const work = caseStudies.slice(0, 3);

  return (
    <section className={cn("bg-paper", className)}>
      <Container wide className="py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
          <div>
            <Eyebrow label={eyebrow} />
            <h2 className="mt-6 text-h3 text-ink">{title}</h2>
            <p className="mt-5 max-w-[38ch] text-[15px] leading-[1.8] text-ink-500">
              {body}
            </p>
            <div className="mt-8">
              <TextLink href="/case-studies">View all work</TextLink>
            </div>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {work.map((study) => {
              const phase = CASE_PHASE[study.phase];
              return (
                <li key={study.slug}>
                  <Frame
                    as="article"
                    tint={phase.tint}
                    className="h-full"
                    innerClassName="flex h-full flex-col p-3"
                  >
                    <div className="border border-line bg-paper p-3.5">
                      <ProductWindow
                        study={study}
                        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 340px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                      <h3 className="text-[16px] font-medium leading-snug tracking-[-0.015em] text-ink">
                        <Link
                          href={`/case-studies/${study.slug}`}
                          className="after:absolute after:inset-0 after:z-10"
                        >
                          {study.title}
                        </Link>
                      </h3>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <span className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.16em]">
                          <span className="text-ink-400">{study.sector}</span>
                          <span aria-hidden className="h-px w-3 bg-line-strong" />
                          <span className={phase.text}>{study.phase}</span>
                        </span>
                        <ArrowRight
                          size={14}
                          className="flex-none text-ink-400 transition-transform duration-500 ease-expo group-hover/frame:translate-x-1 group-hover/frame:text-ink"
                        />
                      </div>
                    </div>
                  </Frame>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

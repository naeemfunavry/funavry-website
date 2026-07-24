import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Contact from "@/components/sections/Contact";
import Container from "@/components/ui/Container";
import CaseStudyCard from "@/components/ui/CaseStudyCard";
import { KineticWords, Wipe, Rule } from "@/components/ui/Kinetic";
import { CASE_STUDIES } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Case Studies — Funavry Technologies",
  description:
    "Platforms Funavry has built, automated, and run: quality systems on the plant floor, claims moving across borders, video turned into a storefront, classrooms that meet in a browser.",
};

export default function CaseStudiesPage() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* The bar sits on the dark hero on the home page; here there is no
            hero, so the section opens under the bar's own height. */}
        <section className="relative overflow-hidden border-b border-line bg-paper-deep pt-[130px]">
          <div aria-hidden className="absolute inset-0 grid-paper opacity-60" />

          <Container wide className="relative z-10 pb-24 pt-16 lg:pb-32 lg:pt-20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-end lg:gap-20">
              <div>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 flex-none bg-azure" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-ink-500">
                    Case Studies
                  </span>
                </div>
                <h1 className="mt-6 text-h1 text-ink">
                  <KineticWords text="Platforms in production," trigger="mount" />
                  <br />
                  <KineticWords
                    text="outcomes in the field."
                    delay={0.12}
                    trigger="mount"
                  />
                </h1>
              </div>

              <Wipe delay={0.2}>
                <p className="text-[16px] leading-[1.75] text-ink-500">
                  Quality systems on the plant floor, claims moving across
                  borders, video turned into a storefront, classrooms that meet
                  in a browser. Each one is live, and each one was built end to
                  end.
                </p>
              </Wipe>
            </div>

            <Rule className="mt-14 lg:mt-16" />

            <div className="mt-12 grid gap-6 lg:mt-14 lg:grid-cols-2 lg:gap-7">
              {CASE_STUDIES.map((study, i) => (
                <Wipe
                  key={study.slug}
                  delay={(i % 2) * 0.08}
                  duration={0.85}
                  className="h-full"
                >
                  <CaseStudyCard study={study} />
                </Wipe>
              ))}
            </div>
          </Container>
        </section>

        <Contact />
      </main>
      <Footer />
    </>
  );
}

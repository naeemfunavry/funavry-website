import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import CapabilitiesOS from "@/components/sections/CapabilitiesOS";
import WorkInteractive from "@/components/sections/WorkInteractive";
import Proof from "@/components/sections/Proof";
import Industries from "@/components/sections/Industries";
import { TrustedStrip } from "@/components/sections/Clients";
import Container from "@/components/ui/Container";
import TechStack from "@/components/sections/TechStack";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import {
  getCaseStudies,
  getDeliveryCountries,
  getIndustries,
  getOffices,
  getServices,
  getSocials,
  getTestimonials,
} from "@/lib/api";

/**
 * The landing page.
 *
 * A server component that fetches everything the page needs and hands it to
 * the sections. The sections themselves are client components — they animate,
 * they hold scroll state — so they cannot fetch, and they no longer import the
 * content either: it lives in the CMS now.
 *
 * The fetches run in parallel rather than in sequence. Awaited one at a time
 * they would serialise into six round trips before the first byte of HTML.
 */
export default async function Home() {
  const [
    services,
    caseStudies,
    industries,
    testimonials,
    offices,
    deliveryCountries,
    socials,
  ] = await Promise.all([
    getServices(),
    getFeaturedOrAll(),
    getIndustries(),
    getTestimonials(),
    getOffices(),
    getDeliveryCountries(),
    getSocials(),
  ]);

  return (
    <>
      <Nav services={services} industries={industries} socials={socials} />
      <main id="main">
        <Hero />
        <CapabilitiesOS services={services} />

        <Industries industries={industries} />
        {/* The trusted-partner strip, its own band under the industries. */}
        <section aria-label="Trusted by" className="bg-paper">
          <Container wide>
            <TrustedStrip />
          </Container>
        </section>
        {/* The deck indexes into its studies from the first render, so it
            only mounts with at least one — an unreachable CMS returns none. */}
        {caseStudies.length > 0 && (
          <WorkInteractive caseStudies={caseStudies} />
        )}

        <TechStack />
        {/* <Testimonials testimonials={testimonials} /> */}
        <Proof />
        <Contact />
      </main>
      <Footer
        offices={offices}
        deliveryCountries={deliveryCountries}
        socials={socials}
      />
    </>
  );
}

/**
 * The deck runs the featured set, falling back to everything.
 *
 * The fallback matters during the first minutes of a fresh install: nothing is
 * flagged featured yet, and a home page whose flagship section is empty looks
 * broken rather than unconfigured.
 */
async function getFeaturedOrAll() {
  const all = await getCaseStudies();
  const featured = all.filter((s) => s.featured);
  return featured.length > 0 ? featured : all.slice(0, 6);
}

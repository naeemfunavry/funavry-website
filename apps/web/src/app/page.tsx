import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import CapabilitiesOS from "@/components/sections/CapabilitiesOS";
import WorkInteractive from "@/components/sections/WorkInteractive";
import Proof from "@/components/sections/Proof";
import Industries from "@/components/sections/Industries";
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
        <Proof />
        <Industries industries={industries} />
        <WorkInteractive caseStudies={caseStudies} />

        <TechStack />
        <Testimonials testimonials={testimonials} />
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

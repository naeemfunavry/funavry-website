import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Contact from "@/components/sections/Contact";
import JobBoard from "@/components/careers/JobBoard";
import Button from "@/components/ui/Button";
import PageHero, { HeroStats } from "@/components/ui/PageHero";
import { getChrome } from "@/lib/chrome";
import { getStats } from "@/lib/api";
import { JOBS } from "@/lib/careers";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "Careers",
  description:
    "Join Funavry — an AI-first engineering and Global Business Services company. Explore open roles in engineering, AI, product, design and delivery across Pakistan, Saudi Arabia and the US.",
};

/**
 * Careers:
 *
 *   hero → open positions (search, filters, roles) → contact
 *
 * The shared `PageHero` opens it, as on About; applying for a role jumps to
 * the contact form that closes the page.
 */
export default async function CareersPage() {
  const [chrome, STATS] = await Promise.all([getChrome(), getStats("about")]);

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        <PageHero
          image={{ src: "/about/6.webp", position: "center 40%" }}
          eyebrow="Careers"
          title={["Be part of a team", "that creates impact."]}
          body="We build innovative solutions, solve complex challenges and create opportunities for people to grow and thrive."
          actions={
            <>
              <Button href="#open-positions" variant="accent" size="md" arrow>
                View open positions
              </Button>
              <Button href="/life-at-funavry" variant="outline" size="md">
                Life @ Funavry
              </Button>
            </>
          }
        >
          <HeroStats stats={STATS} />
        </PageHero>

        <JobBoard jobs={JOBS} />

        <Contact />
      </main>
      <Footer
        offices={chrome.offices}
        deliveryCountries={chrome.deliveryCountries}
        socials={chrome.socials}
      />
    </>
  );
}

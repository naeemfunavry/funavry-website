import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import Contact from "@/components/sections/Contact";
import Footprint from "@/components/sections/Footprint";
import WhyWorkWithUs from "@/components/sections/WhyWorkWithUs";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "Contact Us",
  description:
    "Talk to Funavry about a platform to build, a process to automate, or an operation to run. Email hello@funavry.com or reach our offices in the US, Saudi Arabia and Pakistan — we reply within one business day.",
};

/**
 * Contact:
 *
 *   the form → map & locations → why work with us
 *
 * The form comes first: it is what the page is for, so it opens the page
 * rather than closing it, and every other page's closing form isn't repeated
 * above the footer here.
 */
export default async function ContactPage() {
  const chrome = await getChrome();

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        {/* `top` is what the nav watches to take its on-dark style, which is
            what it should wear over this dark opening. */}
        <div id="top">
          <Contact variant="page" />
        </div>

        <Footprint
          offices={chrome.offices}
          deliveryCountries={chrome.deliveryCountries}
          eyebrow="Map & Locations"
          title="Where to find us."
          showOffices={false}
        />

        <WhyWorkWithUs />
      </main>
      <Footer
        offices={chrome.offices}
        deliveryCountries={chrome.deliveryCountries}
        socials={chrome.socials}
      />
    </>
  );
}

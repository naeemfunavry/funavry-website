import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import { getLeaders } from "@/lib/api";
import Contact from "@/components/sections/Contact";
import Footprint from "@/components/sections/Footprint";
import Gallery, { type GalleryPhoto } from "@/components/sections/Gallery";
import Leadership from "@/components/sections/Leadership";
import CeoMessage, { CEO_NAME } from "@/components/sections/CeoMessage";
import VisionMission from "@/components/sections/VisionMission";
import Button from "@/components/ui/Button";
import PageHero from "@/components/ui/PageHero";
import CompanyStats from "@/components/ui/CompanyStats";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "About Us",
  description:
    "Funavry is an AI-first engineering and Global Business Services partner. Since 2018 we have built modern platforms, automated the work inside them, and operated them at global scale — 500+ projects, 200+ engineers, offices in the US, Saudi Arabia and Pakistan, and delivery across nine countries.",
};

/* Life at Funavry — the company's own photographs, in /public/about. Add a
   photo by dropping it in that folder and listing it here with its pixel
   size; the strip takes any number, portrait or landscape.

   Captions say what the photo shows and no more: an event is named only when
   the picture itself says so (a banner or sign), never guessed. */
const GALLERY: GalleryPhoto[] = [
  {
    src: "/about/1.webp",
    alt: "The Funavry team seated and standing in rows before a Funavry and P@SHA backdrop at an outdoor event",
    caption: "The Funavry team",
    width: 680,
    height: 416,
  },
  {
    src: "/about/6.webp",
    alt: "The team standing together on a grassy mountaintop under a blue sky, with forested peaks and clouds behind",
    caption: "On the mountaintop",
    width: 2000,
    height: 1493,
  },
  {
    src: "/about/4.webp",
    alt: "The team gathered in front of the illuminated Funavry Technologies sign, decorated with green and white balloons",
    caption: "Celebrating at the office",
    width: 1549,
    height: 1157,
  },
  {
    src: "/about/3.webp",
    alt: "Women of the team holding bouquets under a balloon arch beside a Happy Women's Day banner",
    caption: "Women's Day",
    width: 1253,
    height: 940,
  },
  {
    src: "/about/7.webp",
    alt: "The team's football side posing together on a floodlit five-a-side pitch at night",
    caption: "Football night",
    width: 1280,
    height: 960,
  },
  {
    src: "/about/2.webp",
    alt: "The open-plan office floor seen through glass partitions, with the team at their desks",
    caption: "Inside the office",
    width: 1280,
    height: 960,
  },
  {
    src: "/about/5.webp",
    alt: "Women of the team seated around the boardroom table for a Sip, Sit & Share feedback session",
    caption: "A team session",
    width: 1600,
    height: 1200,
  },
];

/**
 * About:
 *
 *   hero → message from the CEO → vision & mission → leadership →
 *   life at Funavry → footprint → contact
 *
 * The same frame as the industry and service pages: a dark photographic hero,
 * the CEO's message, then lean sections under the site's section label.
 */
export default async function AboutPage() {
  const [chrome, LEADERS] = await Promise.all([getChrome(), getLeaders()]);

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        <PageHero
          image={{ src: "/about-us-bg-cover/about-hero.webp", position: "center" }}
          eyebrow="About Funavry"
          title={[
            "An AI-first partner that",
            "builds, automates and operates.",
          ]}
          body="Funavry is an AI-first technology and Global Business Services company. We build modern platforms, automate the work inside them, and operate them at global scale — so our clients get outcomes, not just software."
          actions={
            <>
              <Button href="/contact" variant="accent" size="md" arrow>
                Work with us
              </Button>
              <Button href="/case-studies" variant="outline" size="md">
                Our work
              </Button>
            </>
          }
          /* The home hero's figures, so the two pages state them alike. */
          footer={<CompanyStats className="mt-14 lg:mt-16" />}
        />

        {/* ----------------------------------- Message from the CEO ---- */}
        <CeoMessage />

        {/* -------------------------------------- Vision & mission ---- */}
        <VisionMission />

        {/* --------------------------------------------- Leadership ---- */}
        <Leadership leaders={LEADERS.filter((l) => l.name !== CEO_NAME)} />

        <Gallery title="Our Delivery team." photos={GALLERY} />

        <Footprint
          offices={chrome.offices}
          deliveryCountries={chrome.deliveryCountries}
          eyebrow="Global footprint"
          title="One team, delivering worldwide."
          showOffices={false}
        />

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

import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import { getLeaders, getStats } from "@/lib/api";
import Contact from "@/components/sections/Contact";
import Footprint from "@/components/sections/Footprint";
import Gallery, { type GalleryPhoto } from "@/components/sections/Gallery";
import Leadership from "@/components/sections/Leadership";
import CeoMessage, { CEO_NAME } from "@/components/sections/CeoMessage";
import VisionMission from "@/components/sections/VisionMission";
import Button from "@/components/ui/Button";
import PageHero, { HeroStats } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "About Us",
  description:
    "Funavry is an AI-first engineering and Global Business Services partner. Since 2018 we have built modern platforms, automated the work inside them, and operated them at global scale — 500+ projects, 200+ engineers, offices in the US, Saudi Arabia and Pakistan, and delivery across nine countries.",
};

/* Life at Funavry — the company's own photographs, in /public/about. Add a
   photo by dropping it in that folder and listing it here with its pixel
   size; the strip takes any number, portrait or landscape.

   Captions say what the photo shows and no more: the outings are not named
   by place, because nothing in the pictures says where they were. */
const GALLERY: GalleryPhoto[] = [
  {
    src: "/about/1.webp",
    alt: "The Funavry team seated and standing in rows before a Funavry and P@SHA backdrop at an outdoor event",
    caption: "The Funavry team",
    width: 680,
    height: 416,
  },
  {
    src: "/about/2.webp",
    alt: "The team gathered on the stairs and marble floor of the office lobby",
    caption: "The office lobby",
    width: 4032,
    height: 3024,
  },
  {
    src: "/about/7.webp",
    alt: "The team celebrating in the office under blue and white balloons",
    caption: "Celebrating at the office",
    width: 1280,
    height: 960,
  },
  {
    src: "/about/12.webp",
    alt: "Colleagues in a meeting around the boardroom table",
    caption: "In the boardroom",
    width: 4032,
    height: 3024,
  },
  {
    src: "/about/8.webp",
    alt: "A table-tennis match at the office, with colleagues crowded on the stairs to watch",
    caption: "Table tennis at the office",
    width: 4032,
    height: 3024,
  },
  {
    src: "/about/5.webp",
    alt: "The whole team on a lawn below green hills on a company outing",
    caption: "Company day out",
    width: 4032,
    height: 3024,
  },
  {
    src: "/about/3.webp",
    alt: "The team gathered on a lakeside lawn with hills behind",
    caption: "By the lake",
    width: 4032,
    height: 3024,
  },
  {
    src: "/about/4.webp",
    alt: "A volleyball match on a lakeside court, with colleagues watching from the side",
    caption: "Volleyball by the lake",
    width: 4032,
    height: 3024,
  },
  {
    src: "/about/10.webp",
    alt: "Colleagues on the lawn watching the games from their chairs",
    caption: "Games on the lawn",
    width: 4032,
    height: 3024,
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
  const [chrome, STATS, LEADERS] = await Promise.all([
    getChrome(),
    getStats("about"),
    getLeaders(),
  ]);

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        <PageHero
          image={{ src: "/about/2.webp", position: "center 40%" }}
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
        >
          <HeroStats stats={STATS} />
        </PageHero>

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

import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import LifeHero from "@/components/life/LifeHero";
import CoreValues from "@/components/life/CoreValues";
import Moments, { type Moment } from "@/components/life/Moments";
import GallerySlider, {
  type GallerySlide,
} from "@/components/life/GallerySlider";
import JoinTeam from "@/components/life/JoinTeam";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "Life @ Funavry",
  description:
    "Life at Funavry: the people, values and culture behind our work — a team of curious minds and builders who learn, collaborate and grow together.",
};

/* Moments that make us — the company's own photographs, in
   /public/lifefunavry/moments. The first one leads the bento at twice the
   size. Each caption is the moment's heading; the category is the small label
   above it. Say only what the picture shows. */
const MOMENTS: Moment[] = [
  {
    src: "/lifefunavry/moments/vision.webp",
    alt: "Funavry team members on a panel on stage, in front of a screen about the prospects of local IT startups in Pakistan",
    caption: "Vision",
    category: "On the panel",
  },
  {
    src: "/lifefunavry/moments/growth.webp",
    alt: "A group of Funavry colleagues dressed formally, standing together in an office lobby",
    caption: "Growth",
    category: "Our people",
  },
  {
    src: "/lifefunavry/moments/innovation.webp",
    alt: "A team member trying a virtual-reality headset at a technology showcase booth",
    caption: "Innovation",
    category: "Hands-on",
  },
  {
    src: "/lifefunavry/moments/connection.webp",
    alt: "Two people shaking hands at a signing table under LEAP and Funavry branding at the LEAP technology event",
    caption: "Connection",
    category: "At LEAP",
  },
  {
    src: "/lifefunavry/moments/impact.webp",
    alt: "Women of the team seated around the boardroom table for a Sip, Sit & Share feedback session",
    caption: "Impact",
    category: "Culture",
  },
  {
    src: "/lifefunavry/moments/talent.webp",
    alt: "Funavry engineers at work across the open-plan office floor, seen through the glass partitions of the workspaces",
    caption: "Talent",
    category: "At work",
  },
];

/* Every photo in /public/lifefunavry, for the gallery slider. */
const GALLERY: GallerySlide[] = [
  {
    src: "/lifefunavry/2026.webp",
    alt: "The team gathered around a 2026 sign under blue and white balloons at the office",
    caption: "Welcoming 2026",
    width: 833,
    height: 1297,
  },
  {
    src: "/lifefunavry/green-white.webp",
    alt: "The team dressed in green and white, gathered under green and white balloons at the office",
    caption: "Green and white at the office",
    width: 2000,
    height: 1500,
  },
  {
    src: "/lifefunavry/office.webp",
    alt: "The open-plan office floor with the team at their desks",
    caption: "The office floor",
    width: 2000,
    height: 1500,
  },
  {
    src: "/lifefunavry/tt-battle.webp",
    alt: "Two colleagues shaking hands across a table-tennis table before a match",
    caption: "Table tennis face-off",
    width: 2000,
    height: 1333,
  },
  {
    src: "/lifefunavry/tt-win.webp",
    alt: "The table-tennis winners in a row wearing their medals",
    caption: "Table tennis winners",
    width: 2000,
    height: 1491,
  },
  {
    src: "/lifefunavry/core.webp",
    alt: "The leadership team standing together in the office lobby",
    caption: "The leadership team",
    width: 1245,
    height: 795,
  },
  {
    src: "/lifefunavry/iftaar.webp",
    alt: "The team seated along a long table for an iftar dinner",
    caption: "Iftar together",
    width: 1225,
    height: 922,
  },
  {
    src: "/lifefunavry/interns.webp",
    alt: "A group of interns standing together at the office",
    caption: "Our interns",
    width: 2000,
    height: 1500,
  },
  {
    src: "/lifefunavry/mens-day.webp",
    alt: "Colleagues beside an International Men's Day banner at the office",
    caption: "International Men's Day",
    width: 1112,
    height: 903,
  },
  {
    src: "/lifefunavry/w-session.webp",
    alt: "Colleagues gathered around the boardroom table for a session",
    caption: "A session in the boardroom",
    width: 1600,
    height: 1200,
  },
  {
    src: "/lifefunavry/ah.webp",
    alt: "A group of colleagues under a balloon arch at the office",
    caption: "Celebrating at the office",
    width: 1083,
    height: 925,
  },
  {
    src: "/lifefunavry/winner.webp",
    alt: "Medal winners lined up together outdoors",
    caption: "The winners",
    width: 2000,
    height: 1503,
  },
  {
    src: "/lifefunavry/boys.webp",
    alt: "A group of colleagues on the rocks of a mountain stream on a trip",
    caption: "On the trip",
    width: 1600,
    height: 2133,
  },
  {
    src: "/lifefunavry/girls.webp",
    alt: "A group of colleagues among tall trees on a trip",
    caption: "Among the trees",
    width: 1600,
    height: 2065,
  },
  {
    src: "/lifefunavry/girls-trip.webp",
    alt: "Four colleagues on a meadow with snow-capped mountains behind",
    caption: "In the mountains",
    width: 2000,
    height: 2715,
  },
  {
    src: "/lifefunavry/sharan.webp",
    alt: "A large group of colleagues together in a forest clearing on a trip",
    caption: "The whole group",
    width: 1600,
    height: 1200,
  },
  {
    src: "/lifefunavry/1.webp",
    alt: "The Funavry team seated and standing in rows before a Funavry and P@SHA backdrop at an outdoor event",
    caption: "The Funavry team",
    width: 680,
    height: 416,
  },
  {
    src: "/lifefunavry/2.webp",
    alt: "The team gathered on the stairs and marble floor of the office lobby",
    caption: "The office lobby",
    width: 1253,
    height: 940,
  },
  {
    src: "/lifefunavry/7.webp",
    alt: "The team celebrating in the office under blue and white balloons",
    caption: "Celebrating at the office",
    width: 3855,
    height: 2878,
  },
  {
    src: "/lifefunavry/12.webp",
    alt: "Colleagues in a meeting around the boardroom table",
    caption: "In the boardroom",
    width: 4032,
    height: 3024,
  },
  {
    src: "/lifefunavry/8.webp",
    alt: "A table-tennis match at the office, with colleagues crowded on the stairs to watch",
    caption: "Table tennis at the office",
    width: 4032,
    height: 3024,
  },
  {
    src: "/lifefunavry/5.webp",
    alt: "The whole team on a lawn below green hills on a company outing",
    caption: "Company day out",
    width: 1280,
    height: 960,
  },
  {
    src: "/lifefunavry/3.webp",
    alt: "The team gathered on a lakeside lawn with hills behind",
    caption: "By the lake",
    width: 3607,
    height: 2694,
  },
  {
    src: "/lifefunavry/4.webp",
    alt: "A volleyball match on a lakeside court, with colleagues watching from the side",
    caption: "Volleyball by the lake",
    width: 1549,
    height: 1157,
  },
  {
    src: "/lifefunavry/10.webp",
    alt: "Colleagues on the lawn watching the games from their chairs",
    caption: "Games on the lawn",
    width: 4032,
    height: 3024,
  },
  {
    src: "/lifefunavry/6.webp",
    alt: "Interns holding their Funavry internship certificates in the boardroom",
    caption: "Internship certificates",
    width: 1480,
    height: 1100,
  },
];

/**
 * Life @ Funavry:
 *
 *   hero → core values → moments (photo bento) → gallery slider →
 *   join the team
 */
export default async function LifeAtFunavryPage() {
  const chrome = await getChrome();

  return (
    <>
      <Nav
        services={chrome.services}
        industries={chrome.industries}
        socials={chrome.socials}
      />
      <main id="main">
        <LifeHero />
        <CoreValues />
        <Moments moments={MOMENTS} />
        <GallerySlider slides={GALLERY} />
        <JoinTeam />
      </main>
      <Footer
        offices={chrome.offices}
        deliveryCountries={chrome.deliveryCountries}
        socials={chrome.socials}
      />
    </>
  );
}

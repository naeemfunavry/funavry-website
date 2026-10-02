import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getChrome } from "@/lib/chrome";
import LifeHero from "@/components/life/LifeHero";
import CoreValues from "@/components/life/CoreValues";
import Moments, { type Moment } from "@/components/life/Moments";
import JoinTeam from "@/components/life/JoinTeam";

export const metadata: Metadata = {
  /* The root layout appends " — Funavry Technologies" via its title template. */
  title: "Life @ Funavry",
  description:
    "Life at Funavry: the people, values and culture behind our work — a team of curious minds and builders who learn, collaborate and grow together.",
};

/* The company's own photographs, in /public/about (see the README there).
   The first one leads the bento at twice the size; each category becomes a
   filter chip. Captions say what the photo shows and no more. */
const MOMENTS: Moment[] = [
  {
    src: "/about/5.webp",
    alt: "The whole team on a lawn below green hills on a company outing",
    caption: "Company day out",
    category: "Outings",
  },
  {
    src: "/about/2.webp",
    alt: "The team gathered on the stairs and marble floor of the office lobby",
    caption: "The office lobby",
    category: "Office Life",
  },
  {
    src: "/about/8.webp",
    alt: "A table-tennis match at the office, with colleagues crowded on the stairs to watch",
    caption: "Table tennis at the office",
    category: "Office Life",
  },
  {
    src: "/about/12.webp",
    alt: "Colleagues in a meeting around the boardroom table",
    caption: "In the boardroom",
    category: "Office Life",
  },
  {
    src: "/about/7.webp",
    alt: "The team celebrating in the office under blue and white balloons",
    caption: "Celebrating at the office",
    category: "Team Events",
  },
  {
    src: "/about/1.webp",
    alt: "The Funavry team seated and standing in rows before a Funavry and P@SHA backdrop at an outdoor event",
    caption: "The Funavry team",
    category: "Team Events",
  },
  {
    src: "/about/3.webp",
    alt: "The team gathered on a lakeside lawn with hills behind",
    caption: "By the lake",
    category: "Outings",
  },
  {
    src: "/about/4.webp",
    alt: "A volleyball match on a lakeside court, with colleagues watching from the side",
    caption: "Volleyball by the lake",
    category: "Outings",
  },
  {
    src: "/about/10.webp",
    alt: "Colleagues on the lawn watching the games from their chairs",
    caption: "Games on the lawn",
    category: "Outings",
  },
];

/**
 * Life @ Funavry:
 *
 *   hero → core values → moments (filterable photo bento) → join the team
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

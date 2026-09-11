/**
 * The offices, with the locations supplied by the company profile.
 *
 * Lives here rather than in the footer because three things draw it now: the
 * footer and Contact page list them, the About page renders them, and the
 * Capabilities globe turns to face them. Two copies of a location is a bug
 * waiting to happen — the one that isn't being looked at goes stale.
 */
export type Office = {
  flag: string;
  country: string;
  /** The city, which is what the footer heads each block with and what keys
      the list. It is also the globe's marker label, so it must stay unique. */
  city: string;
  role: string;
  /** One-line description of what the office does — the company profile's own
      caption for it. Drawn by the About footprint map cards; the footer and
      Contact page use the postal `address` instead. */
  blurb: string;
  address: string[];
  /**
   * Where the office is, in degrees. The globe projects this to place a marker
   * and picks it as a camera target, so it is the office's real city — not a
   * country centroid, which for the USA would land in Kansas rather than on the
   * coast the office is actually on.
   */
  at: { lon: number; lat: number };
};

export const OFFICES: Office[] = [
  {
    flag: "/flags/us.svg",
    country: "United States",
    city: "New York",
    role: "North America Delivery",
    blurb: "North America client engagement & delivery.",
    address: ["North America client", "engagement & delivery"],
    at: { lon: -74.006, lat: 40.7128 }, // New York City
  },
  {
    flag: "/flags/sa.svg",
    country: "Saudi Arabia",
    city: "Riyadh",
    role: "Middle East & GCC",
    blurb: "Middle East & GCC presence and engagement.",
    address: ["Middle East & GCC", "presence & engagement"],
    at: { lon: 46.6753, lat: 24.7136 }, // Riyadh
  },
  {
    flag: "/flags/pk.svg",
    country: "Pakistan",
    city: "Islamabad",
    role: "Engineering & Delivery Center",
    blurb: "17,000 sq ft engineering & delivery center.",
    address: ["Street 12, G-8/1,", "Islamabad, Pakistan", "17,000 sq ft engineering center"],
    at: { lon: 73.04, lat: 33.69 }, // G-8, Islamabad
  },
];

/**
 * The countries delivery reaches, from the company profile. The footer strip
 * and the About footprint section both render this, so it lives beside the
 * offices rather than being typed out twice.
 */
export const DELIVERY_COUNTRIES = [
  "USA",
  "UK",
  "UAE",
  "Qatar",
  "Saudi Arabia",
  "Australia",
  "Japan",
  "Pakistan",
  "Costa Rica",
];

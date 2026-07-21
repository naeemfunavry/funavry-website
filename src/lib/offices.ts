/**
 * The offices, with the addresses supplied by the company.
 *
 * Lives here rather than in the footer because two things draw it now: the
 * footer lists them with full addresses, and the Capabilities globe turns to
 * face them. Two copies of a postal address is a bug waiting to happen — the
 * one that isn't being looked at goes stale.
 */
export type Office = {
  flag: string;
  country: string;
  /** The city, which is what the footer heads each block with and what keys
      the list. Country alone stopped working the moment there were two
      Pakistani offices: it rendered the same heading twice and collided the
      React keys behind it. */
  city: string;
  role: string;
  address: string[];
  /**
   * Where the office is, in degrees. The globe projects this to place a marker
   * and picks it as a camera target, so it is the office's real city — not a
   * country centroid, which for the USA would land in Kansas rather than on the
   * bay the office is actually on.
   */
  at: { lon: number; lat: number };
};

export const OFFICES: Office[] = [
  // {
  //   flag: "/flags/pk.svg",
  //   country: "Pakistan",
  //   city: "Lahore",
  //   role: "Global Delivery Center",
  //   address: [
  //     "Plot B, 281 Ghazi Rd,",
  //     "Khuda Buksh Colony",
  //     "KB Society, Lahore,",
  //     "Punjab",
  //   ],
  //   at: { lon: 74.36, lat: 31.52 }, // Lahore
  // },
  {
    flag: "/flags/pk.svg",
    country: "Pakistan",
    city: "Islamabad",
    role: "Regional Office",
    address: ["Street 12, G-8/1,", "Islamabad,", "Pakistan"],
    at: { lon: 73.04, lat: 33.69 }, // G-8, Islamabad
  },
  {
    flag: "/flags/us.svg",
    country: "USA",
    city: "San Jose",
    role: "Regional Office",
    address: ["18 S 2nd Street #120", "San Jose, CA, 95113,", "United States"],
    at: { lon: -121.89, lat: 37.34 }, // San Jose, CA
  },
  {
    flag: "/flags/ae.svg",
    country: "UAE",
    city: "Dubai",
    role: "Regional Office",
    address: [
      "34HW+5J5 - Parkside",
      "Retail Level - Cluster R",
      "- Jumeirah Lakes",
      "Towers - Dubai",
    ],
    at: { lon: 55.14, lat: 25.07 }, // Jumeirah Lakes Towers, Dubai
  },
];

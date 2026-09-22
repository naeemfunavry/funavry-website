import type { ContentLifecycle, MediaRef } from "./common";

/** Where an office is, in degrees — the real city, never a country centroid. */
export interface GeoPoint {
  lon: number;
  lat: number;
}

export interface Office extends ContentLifecycle {
  id: string;
  slug: string;
  country: string;
  /** Keys the list and labels the globe marker, so it must stay unique. */
  city: string;
  role: string;
  /** The company profile's own one-line caption, used by the About map cards. */
  blurb: string;
  /** Postal address, one row per printed line. */
  addressLines: string[];
  flag: MediaRef | null;
  location: GeoPoint;
  isHeadquarters: boolean;
  email: string | null;
  phone: string | null;
  position: number;
}

/** A country delivery reaches. Separate from Office — reach is not presence. */
export interface DeliveryCountry {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2, for the flag and the map. */
  code: string;
  position: number;
}

/**
 * A client or partner mark. One table, discriminated by `isPartner`, because
 * the two carry identical fields and several organisations are both.
 */
export interface Client extends ContentLifecycle {
  id: string;
  slug: string;
  /** Read off the artwork, never off the filename — several filenames lie. */
  name: string;
  logo: MediaRef | null;
  websiteUrl: string | null;
  isPartner: boolean;
  /** Strongest marks lead the marquee. */
  position: number;
}

/** A technology in the stack strip. */
export interface Technology extends ContentLifecycle {
  id: string;
  slug: string;
  name: string;
  /** Grouping shown as the strip's row label, e.g. "AI/ML", "Cloud". */
  category: string;
  /** simple-icons slug, when the mark comes from that set. */
  iconSlug: string | null;
  logo: MediaRef | null;
  position: number;
}

/** An approved company figure: "500+ projects delivered". */
export interface Stat extends ContentLifecycle {
  id: string;
  key: string;
  value: string;
  label: string;
  /** Which surface renders it — "about", "proof", "footer". */
  group: string;
  position: number;
}

export interface SocialLink extends ContentLifecycle {
  id: string;
  label: string;
  url: string;
  /** lucide-react icon name. */
  icon: string;
  position: number;
}

/** A key/value site setting, typed so the admin can render the right input. */
export interface Setting {
  id: string;
  key: string;
  value: string;
  valueType: "string" | "number" | "boolean" | "json";
  group: string;
  description: string | null;
  updatedAt: string;
}

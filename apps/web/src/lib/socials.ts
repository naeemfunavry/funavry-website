import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Link2,
  type LucideIcon,
} from "lucide-react";

/**
 * Resolves a stored icon name to a lucide component.
 *
 * The channels themselves now live in the database — an editor can add one in
 * the admin panel — but the icon has to be a real component, and a component
 * cannot come out of a JSON response. So the row stores a name and this maps
 * it, from an explicit allow-list rather than an index into the whole lucide
 * export: looking a component up dynamically by a value from the database is
 * how a typo becomes a crash on every page that renders the footer.
 *
 * An unrecognised name falls back to a generic link icon, so a new channel
 * added before this map is updated renders plainly instead of breaking.
 */
const ICONS: Record<string, LucideIcon> = {
  Linkedin,
  LinkedIn: Linkedin,
  Facebook,
  Instagram,
  Twitter,
  X: Twitter,
  Github,
  GitHub: Github,
  Youtube,
  YouTube: Youtube,
};

export function socialIcon(name: string): LucideIcon {
  return ICONS[name] ?? Link2;
}

/** Each channel's brand colour, keyed like `ICONS`. Instagram's is its
    gradient. An unknown channel falls back to the site's ink. */
const COLORS: Record<string, string> = {
  Linkedin: "#0A66C2",
  LinkedIn: "#0A66C2",
  Facebook: "#1877F2",
  Instagram:
    "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
  Twitter: "#000000",
  X: "#000000",
  Github: "#181717",
  GitHub: "#181717",
  Youtube: "#FF0000",
  YouTube: "#FF0000",
};

export function socialColor(name: string): string {
  return COLORS[name] ?? "#2E3436";
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

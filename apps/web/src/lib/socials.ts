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

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

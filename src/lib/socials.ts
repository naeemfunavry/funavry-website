import { Linkedin, Facebook, Instagram, type LucideIcon } from "lucide-react";

/**
 * The company's social presence. URLs are best-guess handles on the `funavry`
 * name — confirm and correct if a channel uses a different slug.
 */
export const SOCIALS: { label: string; href: string; icon: LucideIcon }[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/funavry",
    icon: Linkedin,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/funavry",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/funavry",
    icon: Instagram,
  },
];

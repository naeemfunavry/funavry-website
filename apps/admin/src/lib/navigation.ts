import { Permission, UserRole } from "@funavry/types";
import {
  Briefcase,
  Building2,
  FileText,
  Gauge,
  Globe2,
  Handshake,
  Image as ImageIcon,
  Layers,
  type LucideIcon,
  MapPin,
  MessageSquareQuote,
  ScrollText,
  Settings,
  Share2,
  Sigma,
  Users,
  UserSquare2,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Every listed permission is required for the item to appear. */
  permissions?: Permission[];
  roles?: UserRole[];
  /** A one-line hint, shown on the dashboard's section cards. */
  description?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * The panel's navigation.
 *
 * Grouped the way the website is organised rather than the way the database is:
 * an editor looking for the founders' cards thinks "People", not "the leaders
 * table". The permission and role gates here only hide items — the API enforces
 * the same rules on every request, because a hidden link is not access control.
 */
export const NAVIGATION: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: Gauge,
        description: "What is live, what is in draft, and what changed recently",
      },
    ],
  },
  {
    title: "Work",
    items: [
      {
        label: "Case Studies",
        href: "/dashboard/case-studies",
        icon: Briefcase,
        permissions: [Permission.CONTENT_READ],
        description: "Portfolio projects, their briefs and their captures",
      },
      {
        label: "Services",
        href: "/dashboard/services",
        icon: Layers,
        permissions: [Permission.CONTENT_READ],
        description: "The practice lines and their sub-services",
      },
      {
        label: "Industries",
        href: "/dashboard/industries",
        icon: Building2,
        permissions: [Permission.CONTENT_READ],
        description: "Sectors, with the work filed under each",
      },
    ],
  },
  {
    title: "Editorial",
    items: [
      {
        label: "Blog & News",
        href: "/dashboard/posts",
        icon: FileText,
        permissions: [Permission.CONTENT_READ],
        description: "Articles, news items and case notes",
      },
      {
        label: "Testimonials",
        href: "/dashboard/testimonials",
        icon: MessageSquareQuote,
        permissions: [Permission.CONTENT_READ],
        description: "Client quotes and their approval state",
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        label: "Leadership",
        href: "/dashboard/leadership",
        icon: UserSquare2,
        permissions: [Permission.CONTENT_READ],
        description: "Founder, co-founders and the C-suite",
      },
      {
        label: "Team",
        href: "/dashboard/team",
        icon: Users,
        permissions: [Permission.CONTENT_READ],
        description: "The wider team directory",
      },
    ],
  },
  {
    title: "Company",
    items: [
      {
        label: "Locations",
        href: "/dashboard/offices",
        icon: MapPin,
        permissions: [Permission.CONTENT_READ],
        description: "Offices, their coordinates and delivery reach",
      },
      {
        label: "Clients & Partners",
        href: "/dashboard/clients",
        icon: Handshake,
        permissions: [Permission.CONTENT_READ],
        description: "The trusted-partner marks",
      },
      {
        label: "Technologies",
        href: "/dashboard/technologies",
        icon: Globe2,
        permissions: [Permission.CONTENT_READ],
        description: "The stack strip",
      },
      {
        label: "Stats",
        href: "/dashboard/stats",
        icon: Sigma,
        permissions: [Permission.CONTENT_READ],
        description: "Approved company figures, shared by every surface",
      },
      {
        label: "Social Links",
        href: "/dashboard/social-links",
        icon: Share2,
        permissions: [Permission.CONTENT_READ],
        description: "The footer's social presence",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Media",
        href: "/dashboard/media",
        icon: ImageIcon,
        permissions: [Permission.CONTENT_READ],
        description: "Every uploaded image, with alt text and usage",
      },
      {
        label: "Audit Log",
        href: "/dashboard/audit",
        icon: ScrollText,
        permissions: [Permission.AUDIT_READ],
        description: "Who did what, from where, and what changed",
      },
      {
        label: "Users",
        href: "/dashboard/users",
        icon: Users,
        permissions: [Permission.USER_READ],
        description: "Admin accounts, roles and sessions",
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        permissions: [Permission.SETTINGS_MANAGE],
        description: "Site-wide key/value configuration",
      },
    ],
  },
];

/** Flattened, for breadcrumb and page-title lookups. */
export const NAV_ITEMS: NavItem[] = NAVIGATION.flatMap((section) => section.items);

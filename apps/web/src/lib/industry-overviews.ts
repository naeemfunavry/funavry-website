import {
  Activity,
  ArrowLeftRight,
  Award,
  BadgeCheck,
  BarChart3,
  Bitcoin,
  Blocks,
  Bot,
  Boxes,
  Briefcase,
  Building2,
  CalendarClock,
  Clapperboard,
  CloudSun,
  Droplets,
  MessageCircle,
  Satellite,
  Sprout,
  Tractor,
  Wheat,
  ClipboardCheck,
  ClipboardList,
  Coins,
  Contact,
  CreditCard,
  Factory,
  FileCheck2,
  FileCog,
  FlaskConical,
  Gauge,
  Gem,
  GitBranch,
  Glasses,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Languages,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  MessageSquareWarning,
  MonitorPlay,
  Network,
  Newspaper,
  Package,
  Pill,
  Presentation,
  Receipt,
  RefreshCw,
  Rocket,
  Route,
  ScanEye,
  Share2,
  Shield,
  ShieldCheck,
  Ship,
  ShoppingBag,
  ShoppingCart,
  Siren,
  Smartphone,
  Store,
  Truck,
  UserCog,
  Users,
  Video,
  Wallet,
  Warehouse,
  Wifi,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * The long-form expertise statement for an industry's detail page, keyed by
 * slug. The CMS's industry description is capped at 320 characters and also
 * sets the listing cards, so the fuller statement lives here.
 *
 * The copy is the supplied text, word for word — only split into its parts so
 * the page can lay it out: an opening sentence where the paragraph has one
 * before its list, the lead-in, the offerings it lists, and the closing
 * sentence around any frameworks it names. Rejoined, the parts read as the
 * original paragraph.
 *
 * An industry without an entry keeps the statement the page builds from the
 * CMS data.
 */
export type IndustryOverview = {
  /** A sentence that comes before the list, where the paragraph has one. */
  intro?: string;
  /** The words before the list ("Development of"). */
  lead: string;
  offerings: { text: string; icon: LucideIcon }[];
  /** The closing sentence, up to any frameworks it names… */
  closing?: string;
  frameworks?: string[];
  /** …and the words after them. */
  tail?: string;
};

export const INDUSTRY_OVERVIEWS: Record<string, IndustryOverview> = {
  healthcare: {
    lead: "Development of",
    offerings: [
      { text: "Electronic Health Record (EHR) systems", icon: ClipboardList },
      { text: "patient engagement platforms", icon: HeartHandshake },
      { text: "insurance claims processing solutions", icon: FileCheck2 },
      { text: "electronic prescribing systems", icon: Pill },
      { text: "medical billing automation", icon: Receipt },
      { text: "clinical research platforms", icon: FlaskConical },
      { text: "telehealth applications", icon: Video },
      { text: "immersive healthcare training solutions", icon: Glasses },
    ],
    closing:
      "The company has experience working with leading healthcare organizations and operates with strong awareness of regulatory and interoperability frameworks including",
    frameworks: ["HIPAA", "HL7", "DEA", "SureScripts"],
    tail: "requirements.",
  },

  "financial-services": {
    lead: "Design and development of",
    offerings: [
      { text: "digital banking solutions", icon: Landmark },
      { text: "payment platforms", icon: CreditCard },
      { text: "blockchain infrastructure", icon: Blocks },
      { text: "tokenization systems", icon: Coins },
      { text: "cryptocurrency ecosystems", icon: Bitcoin },
      { text: "launchpad platforms", icon: Rocket },
      { text: "digital asset management solutions", icon: Wallet },
      { text: "NFT marketplaces", icon: Gem },
      {
        text: "integrations between traditional financial systems and emerging digital asset technologies",
        icon: ArrowLeftRight,
      },
    ],
  },

  education: {
    lead: "Development of",
    offerings: [
      { text: "learning management systems", icon: GraduationCap },
      { text: "professional training platforms", icon: Presentation },
      { text: "virtual learning environments", icon: MonitorPlay },
      { text: "online tutoring ecosystems", icon: Users },
      { text: "workforce development portals", icon: Briefcase },
      { text: "certification systems", icon: Award },
      { text: "skills assessment platforms", icon: ClipboardCheck },
      { text: "simulation-based learning solutions", icon: Glasses },
    ],
    closing:
      "These platforms enable educational institutions, training providers, enterprises, and government organizations to deliver effective learning, workforce enablement, and competency development programs.",
  },

  commerce: {
    lead: "Design and development of",
    offerings: [
      { text: "enterprise e-commerce platforms", icon: ShoppingCart },
      { text: "multi-vendor marketplaces", icon: Store },
      { text: "social commerce solutions", icon: Share2 },
      { text: "merchant management systems", icon: ShoppingBag },
      { text: "payment integrations", icon: CreditCard },
      { text: "logistics platforms", icon: Truck },
      { text: "customer engagement solutions", icon: HeartHandshake },
      { text: "content-driven digital ecosystems", icon: Newspaper },
    ],
    closing:
      "These platforms help organizations enhance customer experiences, streamline operations, and accelerate digital commerce initiatives.",
  },

  "industrial-iot": {
    lead: "Development of",
    offerings: [
      { text: "Industrial IoT platforms", icon: Factory },
      { text: "connected device ecosystems", icon: Wifi },
      { text: "operational intelligence solutions", icon: Gauge },
      { text: "workflow automation systems", icon: Workflow },
      { text: "production monitoring platforms", icon: Activity },
      { text: "predictive maintenance solutions", icon: Wrench },
      { text: "computer vision applications", icon: ScanEye },
      { text: "robotics integrations", icon: Bot },
      {
        text: "enterprise systems supporting digitally connected operations",
        icon: Network,
      },
    ],
    closing:
      "These solutions provide real-time visibility, automation, analytics, and decision support across industrial and operational environments.",
  },

  manufacturing: {
    intro:
      "Design and development of digital transformation solutions for consumer goods manufacturers, food processing organizations, and production-oriented enterprises.",
    lead: "Capabilities include",
    offerings: [
      { text: "quality management systems", icon: BadgeCheck },
      { text: "process digitization", icon: FileCog },
      { text: "workflow automation", icon: Workflow },
      { text: "compliance management", icon: ShieldCheck },
      { text: "production planning", icon: CalendarClock },
      { text: "operational intelligence", icon: Gauge },
      { text: "customer claims management", icon: MessageSquareWarning },
      { text: "traceability platforms", icon: Route },
      { text: "computer vision-based inspection", icon: ScanEye },
      {
        text: "enterprise solutions that improve efficiency, quality, and operational performance across manufacturing operations",
        icon: Factory,
      },
    ],
  },

  "supply-chain": {
    intro:
      "Development of enterprise platforms supporting end-to-end supply chain operations.",
    lead: "From procurement and field activities through",
    offerings: [
      { text: "transportation", icon: Truck },
      { text: "production planning", icon: CalendarClock },
      { text: "warehousing", icon: Warehouse },
      { text: "packing", icon: Package },
      { text: "shipment", icon: Ship },
      { text: "distribution", icon: Boxes },
    ],
    closing:
      "These solutions provide visibility, traceability, workflow automation, predictive analytics, and operational intelligence across geographically distributed operations.",
  },

  media: {
    lead: "Design and development of",
    offerings: [
      { text: "digital media platforms", icon: Clapperboard },
      { text: "news portals", icon: Newspaper },
      { text: "content management systems", icon: LayoutTemplate },
      { text: "video streaming solutions", icon: MonitorPlay },
      { text: "audience engagement platforms", icon: Users },
      { text: "advertising ecosystems", icon: Megaphone },
      { text: "mobile media applications", icon: Smartphone },
      { text: "multilingual publishing platforms", icon: Languages },
    ],
    closing:
      "These solutions support high-volume content delivery, real-time publishing, audience growth, and engaging digital experiences across web, mobile, and emerging digital channels.",
  },

  government: {
    lead: "Development of",
    offerings: [
      { text: "citizen service platforms", icon: Users },
      { text: "e-government solutions", icon: Landmark },
      { text: "public administration systems", icon: Building2 },
      { text: "workforce development portals", icon: Briefcase },
      { text: "law enforcement applications", icon: Shield },
      { text: "emergency response platforms", icon: Siren },
      { text: "training and simulation systems", icon: Glasses },
      {
        text: "digital transformation initiatives for government organizations",
        icon: RefreshCw,
      },
    ],
    closing:
      "These solutions improve service delivery, operational efficiency, transparency, citizen engagement, and organizational effectiveness.",
  },

  "enterprise-systems": {
    lead: "Design and implementation of",
    offerings: [
      { text: "enterprise-grade ERP", icon: Building2 },
      { text: "CRM", icon: Contact },
      { text: "HRMS", icon: UserCog },
      { text: "workflow automation", icon: Workflow },
      { text: "business process management", icon: GitBranch },
      { text: "analytics", icon: BarChart3 },
      { text: "operational management platforms", icon: LayoutDashboard },
    ],
    closing:
      "Experience includes custom enterprise applications, Oracle ERP implementations, systems integration, process modernization, and large-scale digital transformation initiatives supporting enterprise-wide operations.",
  },

  // TODO: placeholder copy, drawn from the CMS description — replace with the
  // supplied AgriTech statement.
  agriculture: {
    lead: "Design and development of",
    offerings: [
      { text: "crop diagnostics platforms", icon: Sprout },
      { text: "satellite and geospatial analytics", icon: Satellite },
      { text: "AI-powered farm advisory", icon: MessageCircle },
      { text: "farm management systems", icon: Tractor },
      { text: "weather and climate intelligence", icon: CloudSun },
      { text: "irrigation and soil monitoring", icon: Droplets },
      { text: "farmer engagement applications", icon: Users },
      { text: "agricultural supply chain traceability", icon: Wheat },
    ],
    closing:
      "These solutions bring data-driven insight and advisory to farmers in the field, improving yields, resource efficiency, and resilience across agricultural operations.",
  },
};

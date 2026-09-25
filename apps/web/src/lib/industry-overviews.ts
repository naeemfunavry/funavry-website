import {
  ClipboardList,
  FileCheck2,
  FlaskConical,
  Glasses,
  HeartHandshake,
  Pill,
  Receipt,
  Video,
  type LucideIcon,
} from "lucide-react";

/**
 * The long-form expertise statement for an industry's detail page, keyed by
 * slug. The CMS's industry description is capped at 320 characters and also
 * sets the listing cards, so the fuller statement lives here.
 *
 * The copy is the supplied text, word for word — only split into its parts so
 * the page can lay it out: the lead-in, the offerings it lists, and the
 * closing sentence around the frameworks it names. Rejoined, the parts read
 * as the original paragraph.
 *
 * An industry without an entry keeps the statement the page builds from the
 * CMS data.
 */
export type IndustryOverview = {
  /** The words before the list ("Development of"). */
  lead: string;
  offerings: { text: string; icon: LucideIcon }[];
  /** The closing sentence, up to the frameworks it names… */
  closing: string;
  frameworks: string[];
  /** …and the words after them. */
  tail: string;
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
};

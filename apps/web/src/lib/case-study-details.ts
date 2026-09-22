/**
 * The shape of a per-project brief, as `/case-studies/[slug]` renders it.
 *
 * The briefs themselves used to live in this file — thirty-four of them, some
 * three thousand lines. They are database rows now, edited in the admin panel
 * and fetched through `@/lib/api`, so what remains here is the contract the
 * page and the gallery are written against.
 *
 * Editing content here would change nothing on the site. If a brief is wrong,
 * fix it in the panel.
 */

export type DetailStat = { value: string; label: string };
export type DetailMeta = { label: string; value: string };
export type DetailChallenge = {
  title: string;
  challenge: string;
  solution: string;
};
export type DetailScreenshot = {
  src: string;
  alt: string;
  /** How a fixed 16:10 tile shows the capture. `cover` (default) fills the
      tile from the top — right for wide dashboards. `contain` shows it whole —
      for phone screens and very tall page captures, which a 16:10 crop would
      reduce to a sliver. */
  fit?: "cover" | "contain";
  /** Puts this capture on the laptop screen of the product visual, overriding
      the widest-desktop rule — for a brief whose key screen isn't its widest
      capture. */
  lead?: boolean;
};

export type CaseStudyDetail = {
  slug: string;
  /** The brief's own H1. */
  title: string;
  /** The brief's italic subtitle. */
  tagline: string;
  sector: string;
  phase: "Build" | "Automate" | "Operate";
  /** The brief's lede paragraph runs under the hero title. */
  summary: string;
  /** The brief's three-chip stat strip. */
  stats: DetailStat[];
  /** Project Meta table, confirmed rows only. */
  meta: DetailMeta[];
  introHeading: string;
  intro: string[];
  challengesLead: string;
  challenges: DetailChallenge[];
  resultsLead: string;
  results: string[];
  screenshots: DetailScreenshot[];
};

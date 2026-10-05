import type { CaseStudyDetail, DetailChallenge } from "./case-study-details";
import { INDUSTRY_TECHNOLOGIES } from "./industry-technologies";
import { TECH_ICONS } from "./tech-icons";
import { TECH_LOGOS } from "./tech-logos";
import { TECH_MARKS } from "./tech-marks";
import { TECH_MARKS_EXTRA } from "./tech-marks-extra";
import { metaParts } from "./work";
import type { Shot, WorkProject } from "./work-model";

/*
 * What the case study page shows, read from the brief. Nothing here is
 * written for the layout: every label and value is the brief's own, only
 * regrouped into the page's sections.
 */

const metaValue = (d: CaseStudyDetail, label: RegExp) =>
  d.meta.find((m) => label.test(m.label))?.value ?? "";

export type Glance = {
  industries: string[];
  highlights: { value: string; label: string }[];
  /** The client, or the region where the brief names one instead. */
  client: { label: "Client" | "Region"; value: string } | null;
  team: string | null;
};

/** Project at a Glance, as the brief lays it out: industries, highlights,
    the client (or region) and the dev team size. The Client / Region row
    reads "<who> · <team>", the team always its last part. */
export function glanceOf(detail: CaseStudyDetail, project: WorkProject): Glance {
  const industries = metaParts(metaValue(detail, /^industry$/i));

  let client: Glance["client"] = null;
  let team: string | null = null;
  const whoRow = detail.meta.find((m) => /^(client|region)$/i.test(m.label));
  if (whoRow) {
    const parts = whoRow.value.split("·").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1 && /engineer|developer/i.test(parts.at(-1)!)) team = parts.pop()!;
    if (parts.length > 0) {
      client = {
        label: /^region$/i.test(whoRow.label) ? "Region" : "Client",
        value: parts.join(" · "),
      };
    }
  }

  return {
    industries: industries.length > 0 ? industries : [project.sector.split("·")[0].trim()],
    highlights: detail.stats.map((s) => ({ value: s.value, label: s.label })),
    client,
    team,
  };
}

/** Every technology the site has artwork for, longest name first so "Azure AI
    Search" is found before "Azure". */
const KNOWN_TECH = Array.from(
  new Set([
    ...Object.keys(TECH_MARKS),
    ...Object.keys(TECH_MARKS_EXTRA),
    ...Object.keys(TECH_LOGOS),
    ...Object.keys(TECH_ICONS),
  ]),
).sort((a, b) => b.length - a.length);

/** The core stack, for a project filed under no industry. */
const CORE_STACK = ["AWS", "React", "Node.js", "Python", "PostgreSQL", "Redis", "Docker"];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The Technology Stack row: up to `max` technologies, each one the site can
 * draw a logo for. The tools the brief itself names (its Technologies and
 * Service rows) lead; the stack of the industries it is filed under fills the
 * rest — the same lists the industry pages run.
 */
export function techStack(
  detail: CaseStudyDetail,
  industrySlugs: string[] = [],
  max = 8,
): string[] {
  let text = [metaValue(detail, /technolog/i), metaValue(detail, /^service$/i)].join(" · ");
  const named: string[] = [];
  for (const name of KNOWN_TECH) {
    const re = new RegExp(`(^|[^\\w])${escape(name)}(?![\\w])`, "i");
    if (re.test(text)) {
      named.push(name);
      text = text.replace(re, "$1");
    }
  }

  const industry = industrySlugs.flatMap((slug) => INDUSTRY_TECHNOLOGIES[slug] ?? []);
  const pool = [...named, ...(industry.length > 0 ? industry : CORE_STACK)];
  return Array.from(new Set(pool)).slice(0, max);
}

export type Feature = {
  title: string;
  description: string;
  /** The problem the feature answers — the card's reverse side. */
  challenge: string;
  challengeTitle: string;
};

/* A brief's solutions open with the feature's name in title case — "Integrated
   Clinical Workflows (EHR) that connect…" — so the name is the leading run of
   capitalised words, and the rest is what it does. */
const NAME_WORD = /^(?:[A-Z0-9(][\w()'’./+-]*,?|&|\/|[-–—])$/;
const LEAD_IN =
  /^(?:that|which|with|where|through|including|offering|delivering|providing|covering|supporting|using|via|for|to|a|an|the|by|so)\s+/i;

export function featureOf(challenge: DetailChallenge): Feature {
  /* "Name — what it does": the brief names the feature itself. */
  const named = challenge.solution.trim().match(/^(.+?)\s+—\s+([\s\S]+)$/);
  if (named && named[1].split(/\s+/).length <= 8) {
    return {
      title: named[1],
      description: named[2],
      challenge: challenge.challenge,
      challengeTitle: challenge.title,
    };
  }

  const words = challenge.solution.trim().split(/\s+/);
  if (/^(?:A|An|The)$/.test(words[0] ?? "")) words.shift();

  let n = 0;
  while (n < words.length && NAME_WORD.test(words[n])) n++;
  /* "…Template Builder a drag-and-drop…" — the run ends before a lower-case
     word; a trailing joiner belongs to the description, not the name. */
  while (n > 0 && /^(?:&|\/|[-–—])$/.test(words[n - 1])) n--;

  const name = words.slice(0, n).join(" ").replace(/,$/, "");
  const rest = words.slice(n).join(" ").replace(LEAD_IN, "").trim();
  const usable = n >= 2 && n <= 7 && rest.length > 0;

  const description = usable ? rest : challenge.solution;
  return {
    title: usable ? name : challenge.title,
    description: description.charAt(0).toUpperCase() + description.slice(1),
    challenge: challenge.challenge,
    challengeTitle: challenge.title,
  };
}

/** One view of the Product Showcase. */
export type ShowcaseView = {
  id: "desktop" | "mobile" | "analytics";
  label: string;
  /** The laptop's screen, when the view has one. */
  screen: Shot | null;
  /** Phone screens beside or instead of it. */
  phones: Shot[];
};

/** The Product Showcase's tabs: the desktop application on a laptop with a
    phone beside it, the mobile application on its own, and an analytics
    dashboard where the brief has a capture of one. Only views with a capture
    to show are returned. */
export function showcaseViews(project: WorkProject, shots: Shot[]): ShowcaseView[] {
  const { primary, phones } = project.media;
  const desktops = shots.filter((s) => s.kind !== "mobile");
  const views: ShowcaseView[] = [];

  if (primary && primary.kind !== "mobile") {
    views.push({
      id: "desktop",
      label: "Desktop Application",
      screen: primary,
      phones: phones.slice(0, 1),
    });
  }
  if (phones.length > 0) {
    views.push({ id: "mobile", label: "Mobile Application", screen: null, phones: phones.slice(0, 3) });
  }
  const analytics = desktops.find(
    (s) =>
      s !== primary &&
      /dashboard|analytic|report|kpi|insight|metric/i.test(s.alt) &&
      !/mobile|phone|\bapp\b/i.test(s.alt),
  );
  if (analytics) {
    views.push({ id: "analytics", label: "Analytics Dashboard", screen: analytics, phones: [] });
  }

  return views;
}

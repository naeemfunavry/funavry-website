import type {
  MockupGround,
  MockupScene,
  ProjectMockupPlan,
  WorkProject,
} from "./work-model";

/*
 * Which 3D scene presents which project.
 *
 * Deterministic, never random: the plan is worked out once, over the order
 * the portfolio grid shows its projects in, from data alone — so a card looks
 * the same on every render, on the server and the client alike, and on every
 * page it appears on.
 *
 * Three rules, in order:
 *
 *   1. Honesty. A scene is only open to a project whose captures can fill it
 *      with real screens: laptop + mobile needs a real phone capture, a stack
 *      needs a second desktop screen, a device collage needs both. Nothing is
 *      ever invented to complete a composition. A low-resolution capture is
 *      kept out of the scenes that would blow it up.
 *   2. Fit. Among the open scenes, the project's sector picks an order of
 *      preference — dashboards for fintech, a monitor for government, laptop
 *      and phone for commerce, full-bleed for media.
 *   3. Variety. No scene repeats within four cards of itself (one row and the
 *      card below it, on a three-column grid), no scene takes more than its
 *      share of the page, a repeat is turned the other way, and no two
 *      neighbours share a backdrop.
 */

type Assignable = MockupScene;

/** The scenes a project's captures can honestly fill. */
export function eligibleScenes(project: WorkProject): Assignable[] {
  const { primary, supporting, phones } = project.media;
  if (!primary || primary.kind !== "desktop" || primary.presented) return [];

  const support = supporting.filter((s) => !s.presented);
  const supportScreens = support.filter((s) => s.kind === "desktop");
  /* Below ~1200px a capture shown at near full card width goes soft. */
  const sharp = primary.width >= 1200;

  const open: Assignable[] = [
    "floating-laptop",
    "desktop-monitor",
    "floating-browser",
  ];
  if (sharp) open.push("offset-laptop", "full-bleed");
  if (support.length > 0) open.push("multi-screen", "floating-dashboard");
  if (supportScreens.length > 0) open.push("stacked-screens");
  if (phones.length > 0) open.push("laptop-mobile");
  if (phones.length > 0 && supportScreens.length > 0) open.push("device-collage");
  return open;
}

/** Sector → the scenes that suit it, best first. */
const PREFERENCES: { match: RegExp; scenes: Assignable[] }[] = [
  {
    match: /fintech|web3/i,
    scenes: ["floating-dashboard", "stacked-screens", "floating-browser", "offset-laptop"],
  },
  {
    match: /commerce|retail|fashion/i,
    scenes: ["device-collage", "laptop-mobile", "offset-laptop", "full-bleed"],
  },
  {
    match: /media|marketing|adtech/i,
    scenes: ["full-bleed", "offset-laptop", "laptop-mobile", "floating-browser"],
  },
  {
    match: /health/i,
    scenes: ["desktop-monitor", "multi-screen", "floating-browser", "stacked-screens"],
  },
  {
    match: /public sector|government|supply|logistics|manufactur|enterprise|aviation|construction/i,
    scenes: ["desktop-monitor", "floating-dashboard", "stacked-screens", "multi-screen"],
  },
  {
    match: /education|hr tech|agri/i,
    scenes: ["floating-laptop", "full-bleed", "laptop-mobile"],
  },
];

/** Everything else, after the sector's picks. */
const FALLBACK: Assignable[] = [
  "floating-laptop",
  "offset-laptop",
  "floating-browser",
  "desktop-monitor",
  "multi-screen",
  "stacked-screens",
  "floating-dashboard",
  "laptop-mobile",
  "full-bleed",
  "device-collage",
];

function preferenceOrder(project: WorkProject): Assignable[] {
  const order: Assignable[] = [];
  /* A project with real mobile captures leads with a scene that shows them —
     those captures are the rarest asset in the portfolio. */
  if (project.media.phones.length > 0) order.push("device-collage", "laptop-mobile");
  /* AI products, whatever their sector, suit the floating-window scenes. */
  if (project.categories.includes("ai")) order.push("floating-browser", "multi-screen");
  for (const p of PREFERENCES) {
    if (p.match.test(project.sector)) order.push(...p.scenes);
  }
  order.push(...FALLBACK);
  return [...new Set(order)];
}

/** Backdrops each scene looks right on — all dark; each scene leans to a
    few, and the planner keeps neighbours apart. */
const GROUNDS: Record<Assignable, MockupGround[]> = {
  "floating-laptop": ["navy", "charcoal", "midnight"],
  "desktop-monitor": ["graphite", "abyss", "steel"],
  "floating-browser": ["midnight", "navy", "abyss"],
  "multi-screen": ["abyss", "steel", "navy"],
  "offset-laptop": ["charcoal", "midnight", "graphite"],
  "laptop-mobile": ["steel", "navy", "abyss"],
  "stacked-screens": ["midnight", "graphite", "charcoal"],
  "floating-dashboard": ["navy", "abyss", "steel"],
  "full-bleed": ["graphite", "charcoal", "midnight"],
  "device-collage": ["abyss", "charcoal", "steel"],
};

/** Grounds for projects without a scene: composed renders, interface crops
    and typographic covers. */
const LOOSE_GROUNDS: MockupGround[] = ["navy", "charcoal", "steel", "midnight", "graphite", "abyss"];

/** How many cards back a scene may not reappear within. */
const WINDOW = 4;

/** What one earlier use of a scene costs, in places of preference. */
const USE_COST = 3;

/**
 * Plans every project's presentation, walking them in display order.
 * Returns a plan per slug.
 */
export function planMockups(ordered: WorkProject[]): Map<string, ProjectMockupPlan> {
  const plans = new Map<string, ProjectMockupPlan>();
  const assignable = ordered.filter((p) => eligibleScenes(p).length > 0).length;
  /* No scene takes more than its share — a tenth of the page, rounded up. */
  const cap = Math.max(2, Math.ceil(assignable / 10));

  const used = new Map<Assignable, number>();
  const recentScenes: Assignable[] = [];
  const recentGrounds: MockupGround[] = [];
  let loose = 0;

  for (const project of ordered) {
    const open = new Set(eligibleScenes(project));

    if (open.size === 0) {
      /* No scene to choose. A crop is drawn as a floating window and a
         composed render reads as a full-bleed cut, so each holds that scene's
         place in the window — its neighbours won't repeat the look. */
      const { primary } = project.media;
      if (primary?.presented) recentScenes.push("full-bleed");
      else if (primary) recentScenes.push("floating-browser");
      /* Still vary the ground, so a run of covers isn't a run of identical
         rectangles. */
      let ground = LOOSE_GROUNDS[loose % LOOSE_GROUNDS.length];
      for (let k = 0; recentGrounds.slice(-2).includes(ground) && k < LOOSE_GROUNDS.length; k++) {
        ground = LOOSE_GROUNDS[(loose + k + 1) % LOOSE_GROUNDS.length];
      }
      loose++;
      recentGrounds.push(ground);
      plans.set(project.slug, { scene: "floating-browser", ground, mirror: loose % 2 === 0 });
      continue;
    }

    const candidates = preferenceOrder(project).filter((s) => open.has(s));
    const window = recentScenes.slice(-(WINDOW - 1));
    /* Preference rank plus a cost for every earlier use: the sector's pick
       wins while it is fresh, and the page spreads across all ten scenes. */
    const score = (s: Assignable) => candidates.indexOf(s) + USE_COST * (used.get(s) ?? 0);
    const best = (pool: Assignable[]) =>
      pool.reduce<Assignable | undefined>((a, s) => (a === undefined || score(s) < score(a) ? s : a), undefined);
    const scene =
      best(candidates.filter((s) => !window.includes(s) && (used.get(s) ?? 0) < cap)) ??
      best(candidates.filter((s) => !window.includes(s))) ??
      best(candidates.filter((s) => s !== recentScenes.at(-1))) ??
      candidates[0];

    const count = used.get(scene) ?? 0;
    used.set(scene, count + 1);
    recentScenes.push(scene);

    const options = GROUNDS[scene];
    const lastTwo = recentGrounds.slice(-2);
    const ground =
      [...options.slice(count % options.length), ...options.slice(0, count % options.length)].find(
        (g) => !lastTwo.includes(g),
      ) ?? options[0];
    recentGrounds.push(ground);

    plans.set(project.slug, { scene, ground, mirror: count % 2 === 1 });
  }

  return plans;
}

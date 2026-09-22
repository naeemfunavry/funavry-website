/**
 * The case-study shape the deck and the index render, plus the phase style map.
 *
 * The studies themselves used to live here as a literal array with statically
 * imported captures. They come from the CMS now — see `@/lib/api` — so what
 * remains is the contract the components are written against and the one piece
 * of presentation that is genuinely code rather than content: which colour each
 * delivery phase paints.
 */
import type { StaticImageData } from "next/image";

export type CaseStudy = {
  slug: string;
  title: string;
  /**
   * The one-line "what it is", shown as the subheading under the title on the
   * home deck and the index card — the same string the detail page's hero runs,
   * so the three surfaces open with one identical heading → subheading →
   * paragraph. Kept verbatim in sync with `tagline` in case-study-details.ts.
   */
  tagline: string;
  /** Stands in for the client name, which is not ours to publish. */
  sector: string;
  /** Which phase of Build → Automate → Operate the work mostly sat in. */
  phase: "Build" | "Automate" | "Operate";
  /**
   * What kind of window the capture belongs in. Every one of these is a desktop
   * web interface — there are no mobile or tablet captures — so the only honest
   * distinction left is who the thing was built for: `site` is public and gets
   * browser chrome, `app` is signed-in and gets an application toolbar. Anything
   * finer than that would be a device the screenshot never came from.
   */
  surface: "site" | "app";
  /**
   * What the capture is presented *in* on the home deck. Purely rhythm: a deck
   * where every card wears the same body reads as a template, so the frames
   * alternate.
   *
   * This is allowed to be an aesthetic choice in a way `surface` is not, and the
   * line between them is worth keeping straight. A laptop asserts nothing — all
   * six of these are desktop web apps, and a laptop is exactly where you'd use
   * one. A phone or tablet frame would assert a product that doesn't exist, and
   * there are no portrait captures anywhere in this repo to put in one. So:
   * laptop and window, and nothing that claims a device we never shipped.
   */
  frame: "laptop" | "window";
  summary: string;
  /** What the platform does. Never a metric — this work is not counted. */
  capabilities: string[];
  image: StaticImageData;
  /**
   * The product's mobile surface, where one shipped — a real portrait capture,
   * never a crop of the desktop one.
   *
   * This is the field that earns a phone frame. The note on `frame` above holds:
   * a device on the page is a claim about what was built, so a study without
   * this key gets no phone, and nothing stands in for the missing capture. Two
   * of the six have one today; the other four are desktop-only work and should
   * look it.
   */
  mobileImage?: StaticImageData;
  /**
   * Leader-line callouts over the capture, on the home deck only.
   *
   * Two rules, and both are load-bearing:
   *
   * `label` must be one of this study's own `capabilities`, verbatim. A callout
   * is a claim about a client's system printed on a picture of it, so it does
   * not get its own copy — "AI-Powered Claims Processing" over a claims system
   * with no AI in it is not a flourish, it's a lie about delivered work.
   *
   * `at` is where that capability is actually *visible* in the capture, as a
   * fraction of the capture itself — so the line lands on the thing it names:
   * the sidebar rail for role-based queues, the literal Surveyor Assignment nav
   * item for surveyor assignment. If a capability isn't on screen it doesn't get
   * a callout. Keep `at.x` under ~0.3: the chip hangs to the *left* of its
   * anchor, and past that it stops clearing the window and sits on the capture.
   */
  callouts?: { label: string; icon: string; at: { x: number; y: number } }[];
  /**
   * Portfolio highlights, taken verbatim from Section 03 of the corporate deck
   * (`Funavry_Corporate_Deck_v3.0`). These are the one place a metric is allowed
   * on the home deck: they are approved facts from the deck, not numbers invented
   * for the site. Shown as the floating stat cards on the Work showcase — `value`
   * is the headline, `detail` the context line beneath it. Featured studies only.
   */
  highlights?: { value: string; detail: string }[];
  /** The delivery footprint the deck prints beside each engagement. */
  client?: string;
  team?: string;
  /** The four the home page carries. The rest live on /case-studies. */
  featured?: boolean;
};





/** Each phase keeps its colour, as it does everywhere else on the site. */
export const CASE_PHASE = {
  Build: { text: "text-azure-ink", dot: "bg-azure", tint: "68,158,216" },
  Automate: { text: "text-amber-ink", dot: "bg-amber", tint: "245,159,19" },
  Operate: { text: "text-steel-ink", dot: "bg-steel", tint: "55,96,121" },
} as const;
